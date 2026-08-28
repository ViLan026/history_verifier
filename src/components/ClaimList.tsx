import React from "react";
import { ListFilter, MapPin } from "lucide-react";
import { Claim } from "../types";
import { ClaimCard } from "./ClaimCard";

interface ClaimListProps {
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
}

export const ClaimList: React.FC<ClaimListProps> = ({
  claims,
  selectedClaimId,
  onSelectClaim,
}) => {
  return (
    <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E8DFC8]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#F0E8D7] text-[#8B261E] border border-[#E2D6C0]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F1B18] font-serif uppercase tracking-wide">
              Bản đồ phát biểu
            </h3>
            <p className="text-[11px] text-[#7A7064]">
              {claims.length} phát biểu lịch sử được trích xuất
            </p>
          </div>
        </div>
      </div>

      {/* Claims List Scrollable */}
      <div className="grow overflow-y-auto pr-1 space-y-3">
        {claims.map((claim, idx) => (
          <ClaimCard
            key={claim.id || `claim-${idx}`}
            claim={claim}
            index={idx}
            isSelected={claim.id === selectedClaimId}
            onSelect={onSelectClaim}
          />
        ))}
      </div>

      {/* Footer info */}
      <div className="mt-3 pt-2.5 border-t border-[#EAE1CF] text-[11px] text-[#7A7064] text-center">
        Chọn một phát biểu để mở trích đoạn sử liệu tương ứng
      </div>
    </div>
  );
};
