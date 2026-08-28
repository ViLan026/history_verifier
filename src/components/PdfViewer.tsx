import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, Focus, LoaderCircle, Sparkles } from "lucide-react";
import { getEvidenceView, getSourcePageImageUrl } from "../services/pdfService";
import type { SourcePageView } from "../types";

interface PdfViewerProps {
  sourceId: string;
  bookTitle?: string;
  initialPage: number;
  highlightText: string;
  highlightPages: number[];
  onHighlightStatusChange?: (found: boolean) => void;
}

interface PageViewProps {
  sourceId: string;
  page: SourcePageView;
  pageIndex: number;
  isTarget: boolean;
  onImageLoaded?: (pageNum: number) => void;
}

  const buildTextLines = (page: SourcePageView) => {
    const groups = new Map<string, typeof page.words>();

    [...page.words]
      .sort((a, b) => a.block - b.block || a.line - b.line || a.word - b.word)
      .forEach((word) => {
        const key = `${word.block}-${word.line}`;
        const group = groups.get(key) || [];
        group.push(word);
        groups.set(key, group);
      });

    return Array.from(groups.values()).map((words) => {
      const first = words[0];
      const x = Math.min(...words.map((word) => word.x));
      const y = Math.min(...words.map((word) => word.y));
      const right = Math.max(...words.map((word) => word.x + word.width));
      const bottom = Math.max(...words.map((word) => word.y + word.height));

      return {
        text: words.map((word) => word.text).join(" "),
        x,
        y,
        width: right - x,
        height: bottom - y,
        block: first.block,
        line: first.line,
      };
    });
  };

const PageView: React.FC<PageViewProps> = ({
  sourceId,
  page,
  pageIndex,
  isTarget,
  onImageLoaded,
}) => {
  const hasHighlights = page.highlights && page.highlights.length > 0;
  const textLines = buildTextLines(page);
  return (
    <div
      data-source-page={page.page}
      data-page-index={pageIndex}
      data-is-target={isTarget ? "true" : undefined}
      className={`relative bg-white shadow-xs border rounded-lg overflow-hidden transition-all ${
        isTarget ? "border-amber-400 ring-2 ring-amber-400/20" : "border-gray-200"
      }`}
    >
      <img
        src={getSourcePageImageUrl(sourceId, page.page)}
        alt={`Trang ${page.page}`}
        className="block w-full h-auto"
        draggable={false}
        onLoad={() => onImageLoaded?.(page.page)}
      />

      {/* Highlight Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {page.highlights.map((rect, index) => (
          <div
            key={`${page.page}-highlight-${index}`}
            data-highlight-rect="true"
            data-first-highlight={index === 0 ? "true" : undefined}
            className="absolute bg-yellow-400/50 border border-yellow-500/40 rounded-xs shadow-xs transition-opacity"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Selectable transparent OCR text layer */}
      <div className="absolute inset-0 select-text">
        {textLines.map((line) => (
          <span
            key={`${page.page}-${line.block}-${line.line}`}
            className="absolute text-transparent whitespace-nowrap cursor-text"
            style={{
              left: `${line.x * 100}%`,
              top: `${line.y * 100}%`,
              width: `${line.width * 100}%`,
              height: `${line.height * 100}%`,
              fontSize: `${Math.max(line.height * 100, 0.8)}cqw`,
              lineHeight: 1,
            }}
          >
            {line.text}
          </span>
        ))}
      </div>

      {/* Page Number & Highlight indicator tag */}
      <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5">
        {hasHighlights && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3" />
            Có đoạn trích
          </span>
        )}
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-medium shadow-xs ${
            isTarget
              ? "bg-[var(--primary)] text-white font-semibold"
              : "bg-black/65 text-white"
          }`}
        >
          Trang {page.page}
        </span>
      </div>
    </div>
  );
};

export const PdfViewer: React.FC<PdfViewerProps> = ({
  sourceId,
  bookTitle,
  initialPage,
  highlightText,
  highlightPages,
  onHighlightStatusChange,
}) => {
  const [pages, setPages] = useState<SourcePageView[]>([]);
  const [targetPdfPages, setTargetPdfPages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrolledOnceRef = useRef<boolean>(false);

  // Scroll directly to the highlight or target 4th page
  const scrollToTargetHighlight = useCallback((smooth = false) => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Try to find the exact first highlight rectangle
    const firstHighlight = container.querySelector('[data-first-highlight="true"]');
    if (firstHighlight) {
      firstHighlight.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
      return;
    }

    // 2. Try to find any target page or 4th page (index 3)
    const targetPageEl =
      container.querySelector('[data-is-target="true"]') ||
      container.querySelector('[data-page-index="3"]') ||
      container.querySelector('[data-source-page]');

    if (targetPageEl) {
      targetPageEl.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "center",
      });
    }
  }, []);




  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!sourceId || !highlightPages.length || !highlightText.trim()) return;

      setIsLoading(true);
      setError(null);
      setPages([]);
      scrolledOnceRef.current = false;

      try {
        const result = await getEvidenceView(sourceId, highlightPages, highlightText);

        if (cancelled) return;

        setPages(result.pages || []);
        setTargetPdfPages(result.pdf_pages || []);
        onHighlightStatusChange?.(result.highlight_found);

        // Schedule multiple scroll passes to ensure positioning before and after image layouts settle
        requestAnimationFrame(() => {
          scrollToTargetHighlight(false);
        });

        setTimeout(() => {
          if (!cancelled) {
            scrollToTargetHighlight(true);
          }
        }, 120);

        setTimeout(() => {
          if (!cancelled) {
            scrollToTargetHighlight(true);
          }
        }, 400);
      } catch (err: any) {
        if (cancelled) return;

        console.error("Evidence source viewer failed:", err);
        setError(err?.message || "Không thể tải trang sử liệu.");
        onHighlightStatusChange?.(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [
    sourceId,
    initialPage,
    highlightText,
    highlightPages,
    onHighlightStatusChange,
    scrollToTargetHighlight,
  ]);

  // When the target page image loads, guarantee scroll position stops exactly at the highlight
  const handleImageLoaded = useCallback(
    (pageNum: number) => {
      // If the target page or 4th page loaded, scroll into view
      const isTargetPage =
        targetPdfPages.includes(pageNum) ||
        (pages.length >= 4 && pages[3]?.page === pageNum);

      if (isTargetPage || !scrolledOnceRef.current) {
        scrolledOnceRef.current = true;
        requestAnimationFrame(() => {
          scrollToTargetHighlight(false);
        });
      }
    },
    [targetPdfPages, pages, scrollToTargetHighlight]
  );

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <LoaderCircle className="w-7 h-7 animate-spin text-[var(--primary)]" />
        <p className="mt-3 text-xs font-serif font-semibold text-gray-700">
          Đang chuẩn bị các trang sử liệu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-[var(--primary)] mb-2" />
        <h4 className="font-serif font-bold text-sm text-gray-900">
          Không thể tải trang sử liệu
        </h4>
        <p className="text-xs text-gray-600 mt-1 max-w-md">{error}</p>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
        <BookOpen className="w-7 h-7 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500">Không có trang sử liệu để hiển thị.</p>
      </div>
    );
  }

  // Find target page number for display
  const targetPageNumber =
    targetPdfPages[0] || (pages.length >= 4 ? pages[3]?.page : pages[0]?.page);

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-gray-100 shadow-2xs">
      <div className="shrink-0 px-3 py-1.5 bg-white border-b border-gray-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
          <span className="text-xs font-serif font-semibold text-gray-800 truncate">
            {bookTitle || "Nguồn sử liệu"}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {targetPageNumber && (
            <button
              type="button"
              onClick={() => scrollToTargetHighlight(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-[var(--primary)] bg-red-50 hover:bg-red-100 border border-red-200/80 rounded transition-colors"
              title="Cuộn tới vị trí đoạn trích dẫn được highlight"
            >
              <Focus className="w-3 h-3" />
              <span>Vị trí trích dẫn (Trang {targetPageNumber})</span>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4 scroll-smooth"
      >
        {pages.map((page, index) => {
          const isTarget =
            targetPdfPages.includes(page.page) ||
            (targetPdfPages.length === 0 && index === 3);

          return (
            <PageView
              key={page.page}
              sourceId={sourceId}
              page={page}
              pageIndex={index}
              isTarget={isTarget}
              onImageLoaded={handleImageLoaded}
            />
          );
        })}
      </div>
    </div>
  );
};
