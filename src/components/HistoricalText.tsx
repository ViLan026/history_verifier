import React, { useMemo } from "react";
import { Claim } from "../types";
import { segmentOriginalText } from "../utils/textHighlighter";

interface HistoricalTextProps {
  originalText: string;
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
}

export const HistoricalText: React.FC<HistoricalTextProps> = ({
  originalText,
  claims,
  selectedClaimId,
  onSelectClaim,
}) => {
  const segments = useMemo(
    () => segmentOriginalText(originalText, claims),
    [originalText, claims]
  );

  return (
    <div className="text-sm sm:text-[15px] font-serif text-gray-900 leading-relaxed text-justify select-text">
      {segments.map((seg, idx) => {
        if (!seg.isMatch || !seg.claimId) {
          return <span key={idx}>{seg.text}</span>;
        }

        const isSelected = seg.claimId === selectedClaimId;
        const matchingClaim = claims.find((c) => c.id === seg.claimId);
        const evidenceCount = matchingClaim?.evidence?.length || 0;

        return (
          <mark
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              if (seg.claimId) onSelectClaim(seg.claimId);
            }}
            title={
              evidenceCount > 0
                ? `${evidenceCount} nguồn sử liệu đối chiếu`
                : "Chưa tìm thấy đoạn sử liệu trong kho"
            }
            className={`transition-colors duration-150 inline cursor-pointer rounded-xs px-1 py-0.5 mx-0.5 ${
              isSelected
                ? "bg-amber-200 text-gray-900 border-b-2 border-[var(--primary)] font-medium"
                : "bg-amber-100/90 text-gray-900 border-b border-amber-300 hover:bg-amber-200"
            }`}
          >
            {seg.text}
          </mark>
        );
      })}
    </div>
  );
};
