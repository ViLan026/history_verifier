import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { AlertCircle, BookOpen, LoaderCircle } from "lucide-react";

import { getPdfExcerpt } from "../services/pdfService";

interface PdfViewerProps {
  sourceId: string;
  bookTitle?: string;
  pdfPages: number[];
  highlightText: string;
}

export interface PdfViewerRef {
  scrollToTargetHighlight: (forceReload?: boolean) => void;
}

export const PdfViewer = forwardRef<PdfViewerRef, PdfViewerProps>(
  (
    {
      sourceId,
      bookTitle,
      pdfPages,
      highlightText,
    },
    ref
  ) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [targetPage, setTargetPage] = useState(1);
    const [highlightMode, setHighlightMode] = useState("none");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewerKey, setViewerKey] = useState(0);

    useImperativeHandle(ref, () => ({
      scrollToTargetHighlight: () => {
        if (!pdfUrl) return;

        // Reload iframe để quay lại đúng trang chứa evidence.
        setViewerKey((prev) => prev + 1);
      },
    }));

    useEffect(() => {
      let cancelled = false;
      let objectUrl: string | null = null;

      const load = async () => {
        if (!sourceId || !pdfPages?.length || !highlightText.trim()) {
          return;
        }

        setIsLoading(true);
        setError(null);
        setPdfUrl(null);

        try {
          const result = await getPdfExcerpt(
            sourceId,
            pdfPages,
            highlightText
          );

          if (cancelled) return;

          objectUrl = URL.createObjectURL(result.blob);

          setPdfUrl(objectUrl);
          setTargetPage(result.targetPage);
          setHighlightMode(result.highlightMode);
          setViewerKey((prev) => prev + 1);
        } catch (err: any) {
          if (!cancelled) {
            setError(
              err?.message || "Không thể tải trích đoạn PDF."
            );
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      load();

      return () => {
        cancelled = true;

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [sourceId, pdfPages, highlightText]);

    return (
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
        <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-[var(--primary)]" />

            <span className="text-xs font-serif font-semibold truncate">
              {bookTitle || "Nguồn sử liệu"}
            </span>
          </div>

          <span className="text-[11px] text-gray-500">
            {highlightMode === "exact" &&
              "Đã xác định đoạn trích"}
            {highlightMode === "partial" &&
              "Đã xác định một phần đoạn trích"}
            {highlightMode === "none" &&
              "Chưa xác định vị trí tô sáng"}
          </span>
        </div>

        <div className="relative flex-1 min-h-0">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50">
              <LoaderCircle className="w-7 h-7 animate-spin text-[var(--primary)]" />

              <span className="mt-3 text-xs text-gray-600">
                Đang chuẩn bị 7 trang sử liệu...
              </span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
              <AlertCircle className="w-7 h-7 text-[var(--primary)]" />

              <p className="mt-2 text-xs text-gray-600">
                {error}
              </p>
            </div>
          )}

          {pdfUrl && !error && (
            <iframe
              key={viewerKey}
              src={`${pdfUrl}#page=${targetPage}&zoom=page-width`}
              title={bookTitle || "Nguồn sử liệu"}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    );
  }
);

PdfViewer.displayName = "PdfViewer";