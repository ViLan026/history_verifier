import React from "react";
import { BookOpen, ChevronRight, AlertCircle, Quote } from "lucide-react";
import { Claim } from "../types";

interface ClaimCardProps {
  claim: Claim;
  index: number;
  isSelected: boolean;
  onSelect: (claimId: string) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  index,
  isSelected,
  onSelect,
}) => {
  const evidenceCount = claim.evidence?.length || 0;
  const formattedIndex = String(index + 1).padStart(2, "0");

  // Check if normalized claim provides distinct context
  const isNormalizedDifferent =
    claim.claim &&
    claim.claim.trim().toLowerCase() !== claim.source_text?.trim().toLowerCase();

  return (
    <div
      onClick={() => onSelect(claim.id)}
      id={`claim-card-${claim.id}`}
      className={`relative rounded-lg p-4 transition-all duration-150 cursor-pointer border text-left ${
        isSelected
          ? "bg-[#FCFBF7] border-[#8B261E] ring-2 ring-[#8B261E]/20 shadow-md translate-x-0.5"
          : "bg-[#FAF7F0] border-[#E3DAC8] hover:border-[#CFC3AE] hover:bg-[#F6F1E5] shadow-2xs"
      }`}
    >
      {/* Selection Left Accent Bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B261E] rounded-l-lg" />
      )}

      {/* Header: Index & Evidence Count */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold font-sans ${
              isSelected
                ? "bg-[#8B261E] text-white"
                : "bg-[#EAE1D0] text-[#4A4137]"
            }`}
          >
            {formattedIndex}
          </span>
          <span className="text-xs font-serif font-semibold text-[#4A4137] uppercase tracking-wider">
            Phát biểu lịch sử
          </span>
        </div>

        {/* Evidence Count Pill */}
        {evidenceCount > 0 ? (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isSelected
                ? "bg-[#F3E6D6] text-[#78350F] border border-[#E4C8A6]"
                : "bg-[#EFE8D9] text-[#5C5348] border border-[#DED4C1]"
            }`}
          >
            <BookOpen className="w-3 h-3 text-[#8B261E]" />
            <span>{evidenceCount} nguồn liên quan</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFECE6] text-[#7C7368] border border-[#DDD7CC]">
            <span>Chưa có nguồn</span>
          </span>
        )}
      </div>

      {/* Main Content: Source text from original paragraph */}
      <div className="mt-2 text-sm font-medium text-[#221D1A] leading-snug line-clamp-3">
        "{claim.source_text}"
      </div>

      {/* Secondary: Normalized contextual claim if different */}
      {isNormalizedDifferent && (
        <div className="mt-2 pt-2 border-t border-[#ECE3D2] flex items-start gap-1.5 text-xs text-[#6B6156]">
          <Quote className="w-3 h-3 text-[#A89C8D] mt-0.5 flex-shrink-0" />
          <span className="italic line-clamp-2">
            Ý nghĩa chuẩn hóa: {claim.claim}
          </span>
        </div>
      )}

      {/* Empty evidence note if 0 evidence */}
      {evidenceCount === 0 && (
        <div className="mt-2.5 p-2 bg-[#F2EDE1] rounded border border-[#E2DAC8] text-xs text-[#6E6356] space-y-1">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#A37B30] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              Chưa tìm thấy đoạn sử liệu phù hợp trong kho dữ liệu hiện tại.
            </p>
          </div>
          <p className="text-[10px] text-[#8C8072] italic pl-5">
            * Điều này không đồng nghĩa nội dung trên là sai.
          </p>
        </div>
      )}

      {/* Footer / Selector indicator */}
      <div className="mt-3 flex items-center justify-between text-xs text-[#8C8072]">
        <span className="text-[11px]">
          {isSelected ? "Đang hiển thị nguồn sử liệu →" : "Nhấp để xem nguồn trích dẫn"}
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform ${
            isSelected ? "text-[#8B261E] translate-x-0.5" : "text-[#B8AC99]"
          }`}
        />
      </div>
    </div>
  );
};
