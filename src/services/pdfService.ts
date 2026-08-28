import type { EvidenceViewResponse } from "../types";

export async function getEvidenceView(
  sourceId: string,
  pages: number[],
  text: string
): Promise<EvidenceViewResponse> {
  if (!sourceId) throw new Error("Không có mã nguồn sử liệu.");
  if (!pages.length) throw new Error("Không có số trang sử liệu.");
  if (!text.trim()) throw new Error("Không có nội dung sử liệu để đối chiếu.");

  const response = await fetch("/api/source-evidence-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      source_id: sourceId,
      pages,
      text,
    }),
  });

  if (!response.ok) {
    let message = `Không thể tải dữ liệu trang (${response.status})`;

    try {
      const data = await response.json();
      if (data?.error) message = data.error;
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

export function getSourcePageImageUrl(sourceId: string, page: number): string {
  return `/api/source-page-image?source_id=${encodeURIComponent(sourceId)}&page=${page}`;
}