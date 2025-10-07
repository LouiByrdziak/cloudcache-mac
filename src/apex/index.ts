export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("apex: ok", { status: 200 });
  },
};
