import { createHealthHandler } from "../../packages/worker-utils/src/health";

const health = createHealthHandler({
  service: "app",
  envName: "staging",
  dependencies: { kvBinding: "APP_KV", d1Binding: "APP_D1", r2Binding: "APP_R2" },
  readyz: { ttlMs: 5000, timeoutMs: 400, requireAuth: false },
});

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/healthz" || url.pathname === "/readyz") {
      return health.handle(request, env);
    }
    return new Response("app: ok", { status: 200 });
  },
};
