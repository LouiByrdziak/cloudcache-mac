// packages/worker-utils/src/health.ts
var readinessCache = {};
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
function now() {
  try {
    return performance.now();
  } catch (_) {
    return Date.now();
  }
}
async function withTimeout(p, timeoutMs) {
  return await Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), timeoutMs))
  ]);
}
async function checkKV(ns, timeoutMs) {
  const start = now();
  try {
    if (!ns) throw new Error("MISSING");
    await withTimeout(ns.get("__cc_health_probe__", "text"), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    return { ok: false, latency_ms: Math.round(now() - start), error_code: e?.message || "ERROR" };
  }
}
async function checkD1(db, timeoutMs) {
  const start = now();
  try {
    if (!db) throw new Error("MISSING");
    await withTimeout(db.prepare("PRAGMA user_version;").first(), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    return { ok: false, latency_ms: Math.round(now() - start), error_code: e?.message || "ERROR" };
  }
}
async function checkR2(bucket, timeoutMs) {
  const start = now();
  try {
    if (!bucket) throw new Error("MISSING");
    await withTimeout(bucket.head("__cc_health_probe__"), timeoutMs);
    return { ok: true, latency_ms: Math.round(now() - start) };
  } catch (e) {
    return { ok: false, latency_ms: Math.round(now() - start), error_code: e?.message || "ERROR" };
  }
}
function getBinding(env, name) {
  if (!name) return void 0;
  return env[name];
}
function isAuthorized(request, env, opts) {
  if (!opts.requireAuth) return true;
  const hdr = (opts.tokenHeader || "X-Ready-Token").toLowerCase();
  const provided = request.headers.get(hdr) || "";
  const expected = env[opts.tokenEnvKey || "READYZ_TOKEN"] || "";
  return Boolean(provided) && provided === expected;
}
function createHealthHandler(cfg) {
  const ttlMs = Math.max(0, cfg.readyz?.ttlMs ?? 5e3);
  const timeoutMs = Math.max(50, cfg.readyz?.timeoutMs ?? 400);
  return {
    async handle(request, env) {
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === "/healthz") {
        const body = {
          service: cfg.service,
          env: cfg.envName || "unknown",
          ok: true,
          ts: (/* @__PURE__ */ new Date()).toISOString()
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
        const kv = getBinding(env, cfg.dependencies?.kvBinding);
        const d1 = getBinding(env, cfg.dependencies?.d1Binding);
        const r2 = getBinding(env, cfg.dependencies?.r2Binding);
        const [kvRes, d1Res, r2Res] = await Promise.all([
          checkKV(kv, timeoutMs),
          checkD1(d1, timeoutMs),
          checkR2(r2, timeoutMs)
        ]);
        const body = {
          service: cfg.service,
          env: cfg.envName || "unknown",
          ok: kvRes.ok && d1Res.ok && r2Res.ok,
          checks: {
            kv: kvRes,
            d1: d1Res,
            r2: r2Res
          },
          ts: (/* @__PURE__ */ new Date()).toISOString()
        };
        const status = body.ok ? 200 : 503;
        readinessCache[cacheKey] = { ts: nowTs, status, body };
        return jsonResponse(body, status);
      }
      return new Response("NOT_FOUND", { status: 404 });
    }
  };
}

// src/admin/index.ts
var health = createHealthHandler({
  service: "admin",
  envName: "staging",
  dependencies: { kvBinding: "ADMIN_KV", d1Binding: "ADMIN_D1", r2Binding: "ADMIN_R2" },
  // Cloudflare Access will guard /readyz; no Worker secret header
  readyz: { ttlMs: 5e3, timeoutMs: 400, requireAuth: false }
});
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/healthz" || url.pathname === "/readyz") {
      return health.handle(request, env);
    }
    return new Response("admin: ok", { status: 200 });
  }
};
export {
  index_default as default
};
