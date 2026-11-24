
interface Env {
  BACKEND_BASE_URL: string;
}

export function onRequestGet({ env }: { env: Env }): Response {
  return Response.json({
    status: "ok",
    backendConfigured: Boolean(env.BACKEND_BASE_URL),
    timestamp: new Date().toISOString(),
  });
}
