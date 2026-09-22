import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Focus, LoaderCircle } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import "pdfjs-dist/web/pdf_viewer.css";

import { getPdfSource } from "../services/pdfService";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerProps {
  sourceId: string;
  bookTitle?: string;
  pdfPages: number[];
  highlightText: string;
}

interface TextFragment {
  element: HTMLElement;
  text: string;
}

function normalizeForMatch(text: string): string {
  return text
    .normalize("NFC")
    .toLocaleLowerCase("vi-VN")
    .replace(/\u00ad/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function highlightEvidence(
  fragments: TextFragment[],
  evidenceText: string
): HTMLElement | null {
  const needle = normalizeForMatch(evidenceText);

  if (!needle) return null;

  let searchableText = "";

  const ranges: {
    fragment: TextFragment;
    start: number;
    end: number;
  }[] = [];

  for (const fragment of fragments) {
    const normalized = normalizeForMatch(fragment.text);

    if (!normalized) continue;

    if (searchableText.length > 0) {
      searchableText += " ";
    }

    const start = searchableText.length;
    searchableText += normalized;

    ranges.push({
      fragment,
      start,
      end: searchableText.length,
    });
  }

  const matchStart = searchableText.indexOf(needle);

  if (matchStart === -1) {
    return null;
  }

  const matchEnd = matchStart + needle.length;
  let firstMatchedElement: HTMLElement | null = null;

  for (const range of ranges) {
    const overlaps = range.end > matchStart && range.start < matchEnd;

    if (!overlaps) continue;

    range.fragment.element.classList.add("evidence-highlight");

    if (!firstMatchedElement) {
      firstMatchedElement = range.fragment.element;
    }
  }

  return firstMatchedElement;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  sourceId,
  bookTitle,
  pdfPages,
  highlightText,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  const [viewerWidth, setViewerWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightFound, setHighlightFound] = useState<boolean | null>(null);

  useEffect(() => {
    const container = viewerRef.current;

    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);

      if (width > 0) {
        setViewerWidth(width);
      }
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sourceId || !pdfPages.length || !viewerWidth) return;

    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | null = null;

    const loadPdf = async () => {
      const container = viewerRef.current;

      if (!container) return;

      setIsLoading(true);
      setError(null);
      setHighlightFound(null);
      container.innerHTML = "";

      try {
        const source = await getPdfSource(sourceId);

        if (cancelled) return;

        loadingTask = pdfjsLib.getDocument({
          url: source.url,
        });

        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const validPages = [...new Set(pdfPages)]
          .filter((page) => page >= 1 && page <= pdf.numPages)
          .sort((a, b) => a - b);

        if (!validPages.length) {
          throw new Error("Không có trang PDF hợp lệ để hiển thị.");
        }

        const fragments: TextFragment[] = [];

        for (const pageNumber of validPages) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });

          const availableWidth = Math.max(viewerWidth - 32, 240);
          const scale = Math.min(1.5, availableWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });

          const pageWrapper = document.createElement("section");
          pageWrapper.className = "pdf-page-shell";
          pageWrapper.dataset.pdfPage = String(pageNumber);
          pageWrapper.style.width = `${viewport.width}px`;
          pageWrapper.style.height = `${viewport.height}px`;

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Không thể khởi tạo canvas PDF.");
          }

          const outputScale = Math.min(window.devicePixelRatio || 1, 2);

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          pageWrapper.appendChild(canvas);

          const transform =
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0];

          await page.render({
            canvasContext: context,
            viewport,
            transform,
          }).promise;

          if (cancelled) return;

          const textContent = await page.getTextContent();

          const textLayer = document.createElement("div");
          textLayer.className = "textLayer";
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;
          textLayer.style.setProperty("--scale-factor", String(viewport.scale));

          pageWrapper.appendChild(textLayer);

          const textDivs: HTMLElement[] = [];

          const textLayerTask = pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayer,
            viewport,
            textDivs,
          });

          await textLayerTask.promise;

          const textItems = textContent.items.filter(
            (item): item is typeof item & { str: string } =>
              "str" in item && typeof item.str === "string"
          );

          const count = Math.min(textItems.length, textDivs.length);

          for (let index = 0; index < count; index++) {
            fragments.push({
              element: textDivs[index],
              text: textItems[index].str,
            });
          }

          const pageLabel = document.createElement("div");
          pageLabel.className = "pdf-page-label";
          pageLabel.textContent = `PDF ${pageNumber}`;

          pageWrapper.appendChild(pageLabel);
          container.appendChild(pageWrapper);
        }

        if (cancelled) return;

        const firstHighlight = highlightEvidence(fragments, highlightText);
        const found = Boolean(firstHighlight);

        setHighlightFound(found);

        requestAnimationFrame(() => {
          if (firstHighlight) {
            firstHighlight.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            const firstPage = container.querySelector("[data-pdf-page]");

            firstPage?.scrollIntoView({
              behavior: "auto",
              block: "start",
            });
          }
        });
      } catch (err: any) {
        if (cancelled) return;

        console.error("PDF viewer failed:", err);

        setError(
          err?.message ||
            "Không thể tải hoặc hiển thị tệp PDF."
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;

      if (loadingTask) {
        loadingTask.destroy();
      }
    };
  }, [sourceId, pdfPages, highlightText, viewerWidth]);

  const firstPdfPage = pdfPages[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
      <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[var(--primary)] shrink-0" />

          <span className="text-xs font-serif font-semibold text-gray-800 truncate">
            {bookTitle || "Nguồn sử liệu"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {highlightFound === true && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã tô đoạn trích
            </span>
          )}

          {highlightFound === false && (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" />
              Chưa khớp chính xác chữ
            </span>
          )}

          {firstPdfPage && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-100 rounded text-[11px] text-[var(--primary)] font-medium">
              <Focus className="w-3 h-3" />
              PDF {firstPdfPage}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-gray-50 flex flex-col items-center justify-center">
            <LoaderCircle className="w-7 h-7 animate-spin text-[var(--primary)]" />
            <span className="mt-3 text-xs text-gray-600">
              Đang tải trang sử liệu...
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 bg-red-50 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-8 h-8 text-[var(--primary)]" />

            <h4 className="mt-2 font-serif font-bold text-sm">
              Không thể hiển thị PDF
            </h4>

            <p className="mt-1 text-xs text-gray-600 max-w-md">
              {error}
            </p>
          </div>
        )}

        <div
          ref={viewerRef}
          className="h-full overflow-auto px-4 py-4 flex flex-col items-center gap-4"
        />
      </div>
    </div>
  );
};