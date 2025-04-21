import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ params, request  }) => {
  const addtwo = +(params.addtwo ?? 0);
  return new Response(JSON.stringify({"result": addtwo + 2}), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}


