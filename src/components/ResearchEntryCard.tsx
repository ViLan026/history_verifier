import React from "react";
import {
  BookOpen,
  RefreshCw,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Claim, ResearchEntry } from "../types";
import { HistoricalText } from "./HistoricalText";

interface ResearchEntryCardProps {
  entry: ResearchEntry;
  isEntrySelected: boolean;
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onRemoveEntry: (entryId: string) => void;
}

export const ResearchEntryCard: React.FC<ResearchEntryCardProps> = ({
  entry,
  isEntrySelected,
  selectedClaimId,
  onSelectClaim,
  onRemoveEntry,
}) => {
  const activeClaim = isEntrySelected && selectedClaimId
    ? entry.claims.find((c) => c.id === selectedClaimId)
    : null;

  return (
    <article
      id={`research-entry-${entry.id}`}
      className={`bg-[var(--surface-raised)] border rounded-xl p-3.5 sm:p-4 shadow-2xs relative transition-all ${
        isEntrySelected ? "border-[var(--primary)]/40" : "border-[var(--border)]"
      }`}
    >
      {/* Header: Entry Title & Meta */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[var(--border-subtle)] text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[var(--primary)] text-white flex items-center justify-center font-serif font-bold text-xs">
            {entry.indexNumber}
          </div>
          <h4 className="font-serif font-bold text-sm text-[var(--card-foreground)]">
            Đoạn tra cứu {entry.indexNumber}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {entry.status === "success" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 bg-white px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              <BookOpen className="w-3 h-3 text-[var(--primary)]" />
              <span>{entry.claims.length} phát biểu</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => onRemoveEntry(entry.id)}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#7f0716] active:bg-[#5f0510] transition-colors cursor-pointer"
            title="Xóa đoạn này khỏi phiên làm việc"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {entry.status === "loading" ? (
        <div className="py-5 px-3 bg-white rounded-lg border border-[var(--border-subtle)] text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-serif font-semibold text-[var(--card-foreground)]">
            <RefreshCw className="w-4 h-4 text-[var(--primary)] animate-spin" />
            <span>Đang phân tích nội dung và tìm nguồn sử liệu...</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] italic">
            Đang trích xuất phát biểu và đối chiếu với thư tịch cổ
          </p>
        </div>
      ) : entry.status === "error" ? (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1 text-xs text-red-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-700" />
            <span>Không thể hoàn tất tra cứu cho đoạn này</span>
          </div>
          <p className="text-[11px] text-red-700 leading-relaxed">
            {entry.errorMessage || "Không thể kết nối tới dịch vụ tìm nguồn sử liệu."}
          </p>
          <div className="mt-1 text-xs text-gray-800 font-serif bg-white/80 p-2 rounded border border-red-100">
            "{entry.inputText}"
          </div>
        </div>
      ) : entry.status === "empty" || entry.claims.length === 0 ? (
        <div className="p-3 bg-white rounded-lg border border-[var(--border-subtle)] space-y-2 text-xs text-gray-700">
          <p className="font-serif font-medium text-gray-900">
            "{entry.inputText}"
          </p>
          <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Không tìm thấy phát biểu lịch sử phù hợp để tra cứu trong nội dung này.
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Interactive Highlighted Historical Text */}
          <div className="p-3 bg-white rounded-lg border border-[var(--border-subtle)]">
            <HistoricalText
              originalText={entry.inputText}
              claims={entry.claims}
              selectedClaimId={selectedClaimId}
              onSelectClaim={onSelectClaim}
            />
          </div>

          {/* Compact Normalized Claim Box Directly Below */}
          {activeClaim && (
            <div className="p-2.5 bg-white border border-[var(--border-subtle)] rounded-lg text-xs transition-all">
              <div className="text-[11px] font-semibold text-[var(--primary)] font-serif uppercase tracking-wider mb-0.5">
                Phát biểu đang chọn
              </div>
              <p className="font-serif text-[var(--card-foreground)] leading-relaxed italic text-xs sm:text-[13px]">
                "{activeClaim.claim}"
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
