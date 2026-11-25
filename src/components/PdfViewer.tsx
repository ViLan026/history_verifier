import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";
import "pdfjs-dist/web/pdf_viewer.css";

import { getPdfExcerpt } from "../services/pdfService";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerProps {
  sourceId: string;
  bookTitle?: string;
  pdfPages: number[];
  highlightText: string;
}

export interface PdfViewerRef {
  scrollToTargetHighlight: (forceReload?: boolean) => void;
}

interface TextFragment {
  element: HTMLElement;
  text: string;
}

function normalizeForMatch(text: string): string {
  return text.normalize("NFC").toLocaleLowerCase("vi-VN").replace(/\u00ad/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
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

    ranges.push({fragment, start, end: searchableText.length,
    });
  }

  /*
   * 1. Thử match toàn bộ evidence.
   */
  let matchStart = searchableText.indexOf(needle);
  let matchLength = needle.length;

  /*
   * 2. Nếu không match toàn bộ thì tìm một đoạn đủ dài.
   * PDF text layer đôi khi khác raw text về xuống dòng,
   * dấu câu hoặc cách tách từ.
   */
  if (matchStart === -1) {
    const words = needle.split(" ").filter(Boolean);

    for (
      let length = Math.min(words.length, 24);
      length >= Math.min(8, words.length);
      length--
    ) {
      let found = false;

      for (let start = 0; start <= words.length - length; start++) {
        const fragment = words.slice(start, start + length).join(" ");

        const position = searchableText.indexOf(fragment);

        if (position !== -1) {
          matchStart = position;
          matchLength = fragment.length;
          found = true;
          break;
        }
      }

      if (found) break;
    }
  }

  if (matchStart === -1) {
    return null;
  }

  const matchEnd = matchStart + matchLength;

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

export const PdfViewer = forwardRef< PdfViewerRef, PdfViewerProps>((
    { sourceId, bookTitle, pdfPages, highlightText,},
    ref
  ) => {
    const viewerRef = useRef<HTMLDivElement>(null);

    const highlightRef = useRef<HTMLElement | null>(null);

    const targetPageRef = useRef<HTMLElement | null>(null);

    const [viewerWidth, setViewerWidth] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [highlightMode, setHighlightMode] = useState("none");

    /*
     * Nút "Vị trí trích dẫn" trong SourceReader
     * sẽ gọi hàm này.
     */
    useImperativeHandle(ref, () => ({
      scrollToTargetHighlight: () => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center", });

          return;
        }

        /*
         * Nếu không tìm được text chính xác,
         * ít nhất vẫn cuộn tới đúng trang.
         */
        targetPageRef.current?.scrollIntoView({ behavior: "smooth",
          block: "start",
        });
      },
    }));

    /*
     * Theo dõi chiều rộng khu vực PDF
     * để scale trang theo desktop/mobile.
     */
    useEffect(() => { 
      const container = viewerRef.current;

      if (!container) return;

      const observer = new ResizeObserver(
        ([entry]) => {
          const width = Math.floor(
            entry.contentRect.width
          );

          if (width > 0) {
            setViewerWidth(width);
          }
        }
      );

      observer.observe(container);

      return () => {
        observer.disconnect();
      };
    }, []);

    const pdfPagesKey = pdfPages.join(",");

    useEffect(() => {
      if (!sourceId ||!pdfPages?.length ||!highlightText.trim() ||!viewerWidth) {
        return;
      }

      let cancelled = false;

      let loadingTask: | ReturnType<typeof pdfjsLib.getDocument> | null = null;

      const load = async () => { const container = viewerRef.current;

        if (!container) return;

        setIsLoading(true);
        setError(null);
        setHighlightMode("none");

        highlightRef.current = null;
        targetPageRef.current = null;

        container.innerHTML = "";

        try {
          /*
           * Backend hiện tại vẫn giữ nguyên:
           * trả về excerpt PDF dưới dạng Blob.
           */
          const result = await getPdfExcerpt( sourceId, pdfPages, highlightText);

          if (cancelled) return;

          setHighlightMode(result.highlightMode);

          /*
           * Không tạo blob URL.
           *
           * Chuyển Blob -> ArrayBuffer -> Uint8Array
           * rồi đưa trực tiếp cho PDF.js.
           */
          const arrayBuffer = await result.blob.arrayBuffer();

          if (cancelled) return;

          const pdfData = new Uint8Array(arrayBuffer);

          loadingTask = pdfjsLib.getDocument({ data: pdfData,});

          const pdf = await loadingTask.promise;

          if (cancelled) return;

          const allFragments: TextFragment[] = [];

          /*
           * Backend chỉ trả excerpt khoảng 7 trang,
           * nên render toàn bộ excerpt.
           */
          for ( let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            if (cancelled) return;

            const page = await pdf.getPage(pageNumber);

            const baseViewport = page.getViewport({ scale: 1, });

            /*
             * Chừa khoảng padding trong viewer.
             */
            // const availableWidth = Math.max( viewerWidth - 24, 240 );
            const availableWidth = Math.max((container.clientWidth || 720) - 24, 240);

            /*
             * Không phóng quá lớn trên desktop.
             */
            const scale = Math.min( 1.5, availableWidth / baseViewport.width);

            const viewport = page.getViewport({ scale, });

            /*
             * Container của một trang PDF.
             */
            const pageWrapper = document.createElement("section");

            pageWrapper.className = "pdf-page-shell";

            pageWrapper.dataset.pdfPage = String(pageNumber);

            pageWrapper.style.width = `${viewport.width}px`;

            pageWrapper.style.height = `${viewport.height}px`;

            /*
             * Ghi nhớ đúng trang mà backend
             * xác định là target page.
             */
            if (  pageNumber === result.targetPage ) {
              targetPageRef.current = pageWrapper;
            }

            /*
             * Canvas = hình ảnh thật của PDF.
             */
            const canvas = document.createElement("canvas");

            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error( "Không thể khởi tạo canvas PDF.");
            }

            /*
             * Giới hạn DPR để mobile không tạo
             * canvas quá lớn gây tốn RAM.
             */
            const outputScale = Math.min(  window.devicePixelRatio || 1,  1.5)
            
            canvas.width = Math.floor(  viewport.width * outputScale)
            
            canvas.height = Math.floor(  viewport.height * outputScale);

            canvas.style.width = `${viewport.width}px`;

            canvas.style.height = `${viewport.height}px`;

            pageWrapper.appendChild(canvas);

            const transform = outputScale === 1 ? undefined : [ outputScale,  0,  0,  outputScale,  0,  0,];

            await page.render({ canvasContext: context, viewport, transform,}).promise;

            if (cancelled) return;

            /*
             * Text layer = chữ thật nằm trên canvas.
             *
             * Đây là phần giúp người dùng:
             * - kéo chuột chọn chữ
             * - copy chữ
             * - highlight evidence
             */
            const textContent =  await page.getTextContent();

            const textLayer = document.createElement("div");

            textLayer.className = "textLayer";

            textLayer.style.width = `${viewport.width}px`;

            textLayer.style.height = `${viewport.height}px`;

            textLayer.style.setProperty( "--scale-factor", String(viewport.scale));

            pageWrapper.appendChild(  textLayer);

            const textDivs: HTMLElement[] = [];

            const textLayerTask = pdfjsLib.renderTextLayer({
                textContentSource:
                  textContent,
                container: textLayer,
                viewport,
                textDivs,
              });

            await textLayerTask.promise;

            if (cancelled) return;

            const textItems = textContent.items.filter(
                ( item ): item is typeof item & {   
                  str: string;
                } =>
                  "str" in item &&  typeof item.str === "string"
              );

            const count = Math.min(  textItems.length,  textDivs.length);

            for (   let index = 0;   index < count;   index++ ) {
              allFragments.push({
                element: textDivs[index],
                text: textItems[index].str,
              });
            }

            container.appendChild(  pageWrapper);
          }

          if (cancelled) return;

          /*
           * Tìm evidence trong text layer.
           */
          const firstHighlight = highlightEvidence(   allFragments,   highlightText );

          highlightRef.current = firstHighlight;

          /*
           * Khi load lần đầu:
           *
           * 1. Nếu tìm thấy evidence -> đi thẳng
           *    tới đúng đoạn.
           *
           * 2. Nếu không tìm được -> đi tới
           *    target page backend trả về.
           */
          requestAnimationFrame(() => {
            if (firstHighlight) {
              firstHighlight.scrollIntoView({
                behavior: "auto",
                block: "center",
              });
            } else {
              targetPageRef.current?.scrollIntoView({
                behavior: "auto",
                block: "start",
              });
            }
          });
        } catch (err: any) {
          if (cancelled) return;

          console.error(  "PDF viewer failed:",  err);

          setError(  err?.message ||    "Không thể tải hoặc hiển thị tệp PDF.");
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      load();

      return () => {
        cancelled = true;

        if (loadingTask) {
          loadingTask.destroy();
        }
      };
    }, [ sourceId, pdfPagesKey, highlightText,]);

    return (
      <div className="flex-1 min-h-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-gray-100">
        {/* Header */}
        <div className="shrink-0 px-3 py-2 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-[var(--primary)] shrink-0" />

            <span className="text-xs font-serif font-semibold truncate">
              {bookTitle || "Nguồn sử liệu"}
            </span>
          </div>

          <span className="text-[11px] text-gray-500">
            {highlightMode === "exact" && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã xác định đoạn trích
              </span>
            )}

            {highlightMode ===
              "partial" && (
              <span>
                Đã xác định một phần đoạn
                trích
              </span>
            )}

            {highlightMode === "none" && (
              <span>
                Chưa xác định vị trí tô sáng
              </span>
            )}
          </span>
        </div>

        {/* PDF area */}
        <div className="relative flex-1 min-h-0">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50">
              <LoaderCircle className="w-7 h-7 animate-spin text-[var(--primary)]" />

              <span className="mt-3 text-xs text-gray-600">
                Đang chuẩn bị trang sử
                liệu...
              </span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
              <AlertCircle className="w-7 h-7 text-[var(--primary)]" />

              <p className="mt-2 text-xs text-gray-600">
                {error}
              </p>
            </div>
          )}

          <div
            ref={viewerRef}
            className="h-full overflow-auto px-3 py-4 flex flex-col items-center gap-4"
          />
        </div>
      </div>
    );
  }
);

PdfViewer.displayName = "PdfViewer";