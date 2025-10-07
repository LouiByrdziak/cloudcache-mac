export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("admin: ok", { status: 200 });
  },
};
