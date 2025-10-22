import { createHealthHandler } from "../../packages/worker-utils/src/health";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      return new Response("apex: ok", { status: 200 });
    }
    return new Response("NOT_FOUND", { status: 404 });
  },
};
