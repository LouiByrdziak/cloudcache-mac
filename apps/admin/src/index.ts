import { createHealthHandler } from "../../packages/worker-utils/src/health";

const health = createHealthHandler({
  service: "admin",
  envName: "staging",
  dependencies: { kvBinding: "ADMIN_KV", d1Binding: "ADMIN_D1", r2Binding: "ADMIN_R2" },
  // Cloudflare Access will guard /readyz; no Worker secret header
  readyz: { ttlMs: 5000, timeoutMs: 400, requireAuth: false },
});

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/healthz" || url.pathname === "/readyz") {
      return health.handle(request, env);
    }
    return new Response("admin: ok", { status: 200 });
  },
};
