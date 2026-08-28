import React from "react";
import { Edit3, Copy, Check, FileText } from "lucide-react";
import { Claim } from "../types";
import { segmentOriginalText } from "../utils/textHighlighter";

interface OriginalTextViewerProps {
  originalText: string;
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onEdit: () => void;
}

export const OriginalTextViewer: React.FC<OriginalTextViewerProps> = ({
  originalText,
  claims,
  selectedClaimId,
  onSelectClaim,
  onEdit,
}) => {
  const [copied, setCopied] = React.useState(false);
  const segments = React.useMemo(
    () => segmentOriginalText(originalText, claims),
    [originalText, claims]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(originalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E8DFC8]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#F0E8D7] text-[#8B261E] border border-[#E2D6C0]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F1B18] font-serif uppercase tracking-wide">
              Văn bản gốc
            </h3>
            <p className="text-[11px] text-[#7A7064]">
              Nhấp vào đoạn văn bản để chọn phát biểu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#5E544B] hover:text-[#1F1B18] hover:bg-[#EFE8D8] border border-[#DDD4C1] transition-colors cursor-pointer"
            title="Sao chép văn bản gốc"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sao chép</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onEdit}
            id="btn-edit-original-text"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#8B261E] hover:bg-[#F2E8D7] border border-[#E2D5C0] transition-colors cursor-pointer"
            title="Chỉnh sửa văn bản hoặc nhập nội dung mới"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa văn bản</span>
          </button>
        </div>
      </div>

      {/* Interactive Text Viewer Body */}
      <div className="grow overflow-y-auto pr-1">
        <div className="p-4 bg-[#FCFBF8] border border-[#E5DCB] rounded-lg text-base text-[#2C2723] leading-relaxed font-serif text-justify select-text">
          {segments.map((seg, idx) => {
            if (!seg.isMatch || !seg.claimId) {
              return <span key={idx}>{seg.text}</span>;
            }

            const isSelected = seg.claimId === selectedClaimId;

            return (
              <mark
                key={idx}
                onClick={() => seg.claimId && onSelectClaim(seg.claimId)}
                title={`Nhấp để xem nguồn cho phát biểu ${seg.claimIndex}`}
                className={`transition-all duration-150 inline cursor-pointer rounded px-1 py-0.5 mx-0.5 ${
                  isSelected
                    ? "bg-[#FBE4A0] text-[#422006] ring-2 ring-[#D97706] font-medium shadow-xs"
                    : "bg-[#F1E8D5] text-[#2C2825] hover:bg-[#E7DAC1] border-b-2 border-[#CBBDA6]"
                }`}
              >
                {seg.text}
                {isSelected && (
                  <sup className="ml-1 px-1 py-0.2 bg-[#8B261E] text-white text-[10px] font-sans font-bold rounded-full">
                    {seg.claimIndex}
                  </sup>
                )}
              </mark>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-2.5 border-t border-[#EAE1CF] text-[11px] text-[#7A7064] flex items-center justify-between">
        <span>Đã trích xuất {claims.length} phát biểu lịch sử</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#FBE4A0] border border-[#D97706] inline-block"></span>
          <span>Phát biểu đang chọn</span>
        </span>
      </div>
    </div>
  );
};
