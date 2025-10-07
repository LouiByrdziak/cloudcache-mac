export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("app: ok", { status: 200 });
  },
};
