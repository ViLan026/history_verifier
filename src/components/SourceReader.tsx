import React, { useState } from "react";
import {
  AlignLeft,
  AlertCircle,
  BookMarked,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Library,
  Search,
} from "lucide-react";
import { Claim, Evidence } from "../types";
import { PdfViewer } from "./PdfViewer";

interface SourceReaderProps {
  selectedClaim: Claim | null;
  claimIndex: number;
  activeEvidenceIndex: number;
  onChangeEvidenceIndex: (index: number) => void;
}

export const SourceReader: React.FC<SourceReaderProps> = ({
  selectedClaim,
  activeEvidenceIndex,
  onChangeEvidenceIndex,
}) => {
  const [showFootnotes, setShowFootnotes] = useState<boolean>(false);
  const [isRetrievedTextExpanded, setIsRetrievedTextExpanded] = useState<boolean>(false);
  const [copiedExcerpt, setCopiedExcerpt] = useState<boolean>(false);
  const [highlightFoundOnPage, setHighlightFoundOnPage] = useState<boolean>(true);

  const evidenceList = selectedClaim?.evidence || [];
  const hasEvidence = evidenceList.length > 0;
  const currentEvidence: Evidence | null = hasEvidence
    ? evidenceList[activeEvidenceIndex] || evidenceList[0]
    : null;

  const resolveSourceId = (evidence: Evidence | null): string => {
    if (!evidence) return "";
    if (evidence.source_id?.trim()) return evidence.source_id.trim();

    const book = (evidence.book_name || "").toLowerCase();

    if (book.includes("đại việt sử ký toàn thư") || book.includes("toàn thư")) return "dvsk";
    if (book.includes("khâm định") || book.includes("cương mục")) return "kdvstgcm";
    if (book.includes("vương triều trần")) return "vtt";
    if (book.includes("việt sử toàn thư")) return "vstt";

    return "";
  };

  const headerEntries = currentEvidence?.headers
    ? Object.entries(currentEvidence.headers).filter(
        ([_, value]) => typeof value === "string" && value.trim()
      )
    : [];

  const footnoteEntries: [string, string][] = [];

  if (currentEvidence?.footnotes) {
    Object.entries(currentEvidence.footnotes).forEach(([page, notes]) => {
      if (typeof notes === "string") {
        if (notes.trim()) footnoteEntries.push([page, notes]);
        return;
      }

      if (notes && typeof notes === "object") {
        Object.entries(notes).forEach(([key, value]) => {
          if (typeof value === "string" && value.trim()) {
            footnoteEntries.push([`${page}.${key}`, value]);
          }
        });
      }
    });
  }

  const formattedPages =
    currentEvidence?.pages?.length
      ? currentEvidence.pages.join(", ")
      : null;

  const handleCopyExcerpt = () => {
    if (!currentEvidence) return;

    let citation = `[Trích nguồn] ${currentEvidence.book_name || "Sử liệu Việt Nam"}`;

    if (formattedPages) citation += `, Trang ${formattedPages}`;

    if (headerEntries.length > 0) {
      citation += ` (${headerEntries.map(([_, header]) => header).join(" - ")})`;
    }

    citation += `:\n"${currentEvidence.text}"`;

    navigator.clipboard.writeText(citation);
    setCopiedExcerpt(true);
    setTimeout(() => setCopiedExcerpt(false), 2000);
  };

  if (!selectedClaim) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-0 overflow-y-auto">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[var(--primary)] flex items-center justify-center mb-4 border border-red-100 shadow-2xs">
          <Library className="w-7 h-7" />
        </div>

        <h3 className="font-serif font-bold text-lg text-[var(--card-foreground)]">
          NGUỒN SỬ LIỆU
        </h3>

        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mt-2 leading-relaxed">
          Nhấp vào đoạn văn bản được tô sáng ở cột bên trái để mở nguồn sử liệu tương ứng.
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 italic bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200">
          <Search className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Tự động mở trang và đối chiếu đoạn được truy xuất</span>
        </div>
      </div>
    );
  }

  if (!hasEvidence || !currentEvidence) {
    return (
      <div className="bg-white border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-0 overflow-y-auto">
        <div className="shrink-0 pb-3 mb-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-50 text-[var(--primary)] border border-red-100">
            <Library className="w-4 h-4" />
          </div>

          <h3 className="text-sm font-bold text-[var(--card-foreground)] font-serif uppercase tracking-wide">
            NGUỒN SỬ LIỆU
          </h3>
        </div>

        <div className="my-auto p-6 sm:p-8 bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div>
            <h4 className="font-serif font-bold text-base text-[var(--card-foreground)]">
              Chưa tìm thấy đoạn sử liệu phù hợp trong kho dữ liệu hiện tại.
            </h4>

            <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">
              Hệ thống chưa tìm thấy đoạn sử liệu phù hợp cho nội dung đang được xem.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-lg border border-amber-200 text-xs text-left">
            <p className="font-semibold text-[11px] uppercase tracking-wide text-[var(--primary)]">
              Ghi chú:
            </p>
            <p className="text-xs mt-1 text-gray-700 leading-relaxed">
              Không tìm thấy nguồn phù hợp không đồng nghĩa nội dung trên là sai.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sourceId = resolveSourceId(currentEvidence);

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col h-full min-h-0 overflow-hidden space-y-2.5">
      {/* Header */}
      <div className="shrink-0 pb-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-start justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[var(--primary)] text-white flex-shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>

              <h3 className="text-sm sm:text-base font-bold font-serif text-[var(--card-foreground)] tracking-wide uppercase">
                {currentEvidence.book_name || "Thư tịch cổ"}
              </h3>
            </div>

            {headerEntries.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-serif pl-6">
                <Bookmark className="w-3 h-3 text-gray-400 flex-shrink-0" />

                <span className="truncate max-w-md">
                  {headerEntries.map(([_, headerText], index) => (
                    <span key={index}>
                      {index > 0 && " · "}
                      {headerText}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {formattedPages && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 text-gray-800 text-xs font-serif font-medium border border-gray-200">
                <BookMarked className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Trang {formattedPages}</span>
              </span>
            )}

            {evidenceList.length > 1 && (
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    onChangeEvidenceIndex(
                      activeEvidenceIndex > 0
                        ? activeEvidenceIndex - 1
                        : evidenceList.length - 1
                    )
                  }
                  className="p-1 rounded text-gray-700 hover:bg-[#7f0716] hover:text-white transition-colors"
                  title="Nguồn trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-medium text-gray-800 px-1.5 select-none font-serif">
                  Nguồn {activeEvidenceIndex + 1} / {evidenceList.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onChangeEvidenceIndex(
                      activeEvidenceIndex < evidenceList.length - 1
                        ? activeEvidenceIndex + 1
                        : 0
                    )
                  }
                  className="p-1 rounded text-gray-700 hover:bg-[#7f0716] hover:text-white transition-colors"
                  title="Nguồn kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retrieved Passage Excerpt */}
      <div className="shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg overflow-hidden shadow-2xs">
        <div className="px-3 py-1 bg-gray-100/80 border-b border-[var(--border-subtle)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold font-serif text-[var(--primary)] text-[11px] uppercase tracking-wider">
              Đoạn được truy xuất
            </span>

            {!highlightFoundOnPage && (
              <span className="text-[11px] text-amber-700 italic">
                Chưa xác định chính xác vị trí đoạn trích trên trang
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyExcerpt}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700 hover:bg-[#7f0716] hover:text-white bg-white border border-gray-200 transition-colors"
            >
              {copiedExcerpt ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsRetrievedTextExpanded(!isRetrievedTextExpanded)}
              className="p-1 rounded text-gray-500 hover:bg-[#7f0716] hover:text-white bg-white border border-gray-200 transition-colors"
            >
              {isRetrievedTextExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`p-2.5 bg-white border-l-3 border-[var(--primary)] text-xs sm:text-sm font-serif text-gray-900 leading-relaxed text-justify select-text ${
            isRetrievedTextExpanded ? "max-h-48 overflow-y-auto" : "line-clamp-2 sm:line-clamp-3"
          }`}
        >
          "{currentEvidence.text}"
        </div>
      </div>

      {/* Footnotes if any */}
      {footnoteEntries.length > 0 && (
        <div className="shrink-0 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowFootnotes(!showFootnotes)}
            className="w-full px-3 py-1 flex items-center justify-between text-left font-serif font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Xem chú thích thư tịch ({footnoteEntries.length})</span>
            </div>

            {showFootnotes ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showFootnotes && (
            <div className="p-2.5 bg-white border-t border-[var(--border-subtle)] space-y-1 max-h-32 overflow-y-auto">
              {footnoteEntries.map(([key, note]) => (
                <div key={key} className="flex items-start gap-1.5 text-xs text-gray-700">
                  <span className="font-semibold text-[var(--primary)] min-w-[32px]">
                    [{key}]
                  </span>
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Embedded PDF Source Viewer strictly contained and scrollable */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {sourceId ? (
          <PdfViewer
            sourceId={sourceId}
            bookTitle={currentEvidence.book_name}
            initialPage={currentEvidence.pages[0] || 1}
            highlightText={currentEvidence.text}
            highlightPages={currentEvidence.pages}
            onHighlightStatusChange={setHighlightFoundOnPage}
          />
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center border border-gray-200 rounded-xl bg-gray-50 text-xs text-gray-500">
            Không xác định được nguồn sử liệu.
          </div>
        )}
      </div>
    </div>
  );
};