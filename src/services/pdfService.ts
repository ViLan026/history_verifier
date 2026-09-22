export interface PdfExcerptResult {
  blob: Blob;
  targetPage: number;
  highlightMode: string;
}

export async function getPdfExcerpt(
  sourceId: string,
  pdfPages: number[],
  text: string
): Promise<PdfExcerptResult> {
  const response = await fetch("/api/source-excerpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_id: sourceId,
      pdf_pages: pdfPages,
      text,
    }),
  });

  if (!response.ok) {
    let message = `Không thể tải trích đoạn PDF (${response.status})`;

    try {
      const data = await response.json();
      if (data?.error) message = data.error;
      if (data?.detail) message = data.detail;
    } catch {}

    throw new Error(message);
  }

  return {
    blob: await response.blob(),
    targetPage: Number(response.headers.get("X-Target-Excerpt-Page") || "1"),
    highlightMode: response.headers.get("X-Highlight-Mode") || "none",
  };
}