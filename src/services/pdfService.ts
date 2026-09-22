import type { PdfSourceResponse } from "../types";

export async function getPdfSource(sourceId: string): Promise<PdfSourceResponse> {
  if (!sourceId.trim()) {
    throw new Error("Không có mã nguồn sử liệu.");
  }

  const response = await fetch(`/api/sources/${encodeURIComponent(sourceId)}/pdf`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = `Không thể tải PDF (${response.status})`;

    try {
      const data = await response.json();
      if (data?.error) message = data.error;
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}