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

  try {
    const body = await request.json() as {
      source_id?: unknown;
      pdf_pages?: unknown;
      text?: unknown;
    };

    const { source_id, pdf_pages, text } = body;

    if (
      typeof source_id !== "string" ||
      !source_id.trim() ||
      !Array.isArray(pdf_pages) ||
      pdf_pages.length === 0 ||
      typeof text !== "string" ||
      !text.trim()
    ) {
      return jsonResponse(
        { error: "Dữ liệu nguồn sử liệu không hợp lệ." },
        400
      );
    }

    const response = await fetch(
      `${backendUrl}/api/v1/sources/${encodeURIComponent(source_id)}/excerpt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_pages, text }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`Excerpt API error (${response.status}):`, errorText);

      return jsonResponse(
        { error: "Không thể tạo trích đoạn PDF." },
        response.status
      );
    }

    const headers = new Headers({
      "Content-Type":
        response.headers.get("Content-Type") || "application/pdf",
      "Cache-Control": "no-store",
    });

    const forwardedHeaders = [
      "x-excerpt-start-page",
      "x-excerpt-end-page",
      "x-target-excerpt-page",
      "x-highlight-mode",
    ];

    for (const name of forwardedHeaders) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("PDF proxy error:", error);

    return jsonResponse(
      { error: "Không thể kết nối tới dịch vụ PDF." },
      502
    );
  }
}
