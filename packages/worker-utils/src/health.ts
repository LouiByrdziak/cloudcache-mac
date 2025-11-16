/*
  Shared health-check utilities for Cloudflare Workers
  - /healthz: liveness (public, minimal work)
  - /readyz: readiness (secure, cached, dependency checks)
*/

type DependencySelectors = {
  kvBinding?: string;
  d1Binding?: string;
  r2Binding?: string;
};

type ReadyzOptions = {
  ttlMs?: number; // cache TTL for readiness outcome
  timeoutMs?: number; // per-check timeout
  tokenHeader?: string; // header name for shared token
  tokenEnvKey?: string; // env var name containing token
  requireAuth?: boolean;
};

export type HealthConfig = {
  service: string;
  envName?: string;
  dependencies?: DependencySelectors;
  readyz?: ReadyzOptions;
};

type EnvLike = Record<string, unknown>;

const readinessCache: Record<string, { ts: number; status: number; body: unknown }> = {};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function now(): number {
  try {
    // @ts-expect-error Cloudflare Workers expose performance API
    return performance.now();
  } catch {
    return Date.now();
  }
}

async function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), timeoutMs)),
  ]);
}

async function checkKV(ns: KVNamespace | undefined, timeoutMs: number) {
  const start = now();
  try {
    if (!ns) throw new Error("MISSING");
    await withTimeout(ns.get("__cc_health_probe__", "text"), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    const error = e as Error;
    return {
      ok: false,
      latency_ms: Math.round(now() - start),
      error_code: error?.message || "ERROR",
    };
  }
}

async function checkD1(db: D1Database | undefined, timeoutMs: number) {
  const start = now();
  try {
    if (!db) throw new Error("MISSING");
    await withTimeout(db.prepare("PRAGMA user_version;").first(), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    const error = e as Error;
    return {
      ok: false,
      latency_ms: Math.round(now() - start),
      error_code: error?.message || "ERROR",
    };
  }
}

async function checkR2(bucket: R2Bucket | undefined, timeoutMs: number) {
  const start = now();
  try {
    if (!bucket) throw new Error("MISSING");
    await withTimeout(bucket.head("__cc_health_probe__"), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    const error = e as Error;
    return {
      ok: false,
      latency_ms: Math.round(now() - start),
      error_code: error?.message || "ERROR",
    };
  }
}

function getBinding<T>(env: EnvLike, name?: string): T | undefined {
  if (!name) return undefined;
  return env[name] as T | undefined;
}

function isAuthorized(request: Request, env: EnvLike, opts: ReadyzOptions): boolean {
  if (!opts.requireAuth) return true;
  const hdr = (opts.tokenHeader || "X-Ready-Token").toLowerCase();
  const provided = request.headers.get(hdr) || "";
  const expected = (env[opts.tokenEnvKey || "READYZ_TOKEN"] as string | undefined) || "";
  return Boolean(provided) && provided === expected;
}

export function createHealthHandler(cfg: HealthConfig) {
  const ttlMs = Math.max(0, cfg.readyz?.ttlMs ?? 5000);
  const timeoutMs = Math.max(50, cfg.readyz?.timeoutMs ?? 400);

  return {
    async handle(request: Request, env: EnvLike): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === "/healthz") {
        const body = {
          service: cfg.service,
          env: cfg.envName || "unknown",
          version: typeof __VERSION__ !== "undefined" ? __VERSION__ : "local",
          ok: true,
          ts: new Date().toISOString(),
        };
        return jsonResponse(body, 200);
      }

      if (path === "/readyz") {
        const opts = cfg.readyz ?? {};
        if (!isAuthorized(request, env, { ...opts, requireAuth: opts.requireAuth !== false })) {
          return jsonResponse({ ok: false, error: "UNAUTHORIZED" }, 401);
        }

        const cacheKey = `${cfg.service}:readyz`;
        const cached = readinessCache[cacheKey];
        const nowTs = Date.now();
        if (cached && nowTs - cached.ts < ttlMs) {
          return jsonResponse(cached.body, cached.status);
        }

        const kv = getBinding<KVNamespace>(env, cfg.dependencies?.kvBinding);
        const d1 = getBinding<D1Database>(env, cfg.dependencies?.d1Binding);
        const r2 = getBinding<R2Bucket>(env, cfg.dependencies?.r2Binding);

        const [kvRes, d1Res, r2Res] = await Promise.all([
          checkKV(kv, timeoutMs),
          checkD1(d1, timeoutMs),
          checkR2(r2, timeoutMs),
        ]);

        const body = {
          service: cfg.service,
          env: cfg.envName || "unknown",
          ok: kvRes.ok && d1Res.ok && r2Res.ok,
          checks: {
            kv: kvRes,
            d1: d1Res,
            r2: r2Res,
          },
          ts: new Date().toISOString(),
        };
        const status = body.ok ? 200 : 503;
        readinessCache[cacheKey] = { ts: nowTs, status, body };
        return jsonResponse(body, status);
      }

      return new Response("NOT_FOUND", { status: 404 });
    },
  };
}
