interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
}

interface Env {
  BACKEND_CONFIG: KVNamespaceLike;
}

interface Context {
  request: Request;
  env: Env;
}

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function getBackendUrl(env: Env): Promise<string | null> {
  const url = await env.BACKEND_CONFIG.get("BACKEND_TUNNEL_URL");
  return url?.replace(/\/+$/, "") || null;
}

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const backendUrl = await getBackendUrl(env);

  if (!backendUrl) {
    return jsonResponse({ error: "Backend chưa được cấu hình." }, 500);
  }

  let body: { content?: unknown };

  try {
    body = await request.json() as { content?: unknown };
  } catch {
    return jsonResponse({ error: "Dữ liệu yêu cầu không hợp lệ." }, 400);
  }

  const content = body.content;

  if (typeof content !== "string" || content.trim().length < 5) {
    return jsonResponse(
      { error: "Vui lòng nhập đoạn văn có ít nhất 5 ký tự." },
      400
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300_000);

  try {
    const response = await fetch(`${backendUrl}/api/v1/evidence-map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ content: content.trim() }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Evidence API error (${response.status}):`, errorText);

      return jsonResponse(
        {
          error:
            response.status >= 500
              ? "Dịch vụ tìm nguồn sử liệu đang gặp sự cố."
              : "Yêu cầu tìm nguồn sử liệu không hợp lệ.",
        },
        response.status >= 500 ? 502 : response.status
      );
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return jsonResponse(
        { error: "Quá thời gian phân tích nội dung." },
        504
      );
    }

    console.error("Evidence proxy error:", error);

    return jsonResponse(
      { error: "Không thể kết nối tới dịch vụ tìm nguồn sử liệu." },
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
