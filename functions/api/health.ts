interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
}

interface Env {
  BACKEND_CONFIG: KVNamespaceLike;
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  const backendUrl = await env.BACKEND_CONFIG.get("BACKEND_TUNNEL_URL");

  return Response.json({
    status: "ok",
    backendConfigured: Boolean(backendUrl),
    timestamp: new Date().toISOString(),
  });
}
