import React, { useState, useEffect } from "react";
import { BookOpen, AlertCircle, ChevronLeft, ChevronRight, Layers, Library } from "lucide-react";
import { Claim } from "../types";
import { EvidenceCard } from "./EvidenceCard";

interface EvidencePanelProps {
  selectedClaim: Claim | null;
  claimIndex: number;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  selectedClaim,
  claimIndex,
}) => {
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0);

  // Reset active evidence index when selected claim changes
  useEffect(() => {
    setActiveEvidenceIndex(0);
  }, [selectedClaim?.id]);

  if (!selectedClaim) {
    return (
      <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-8 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-[#F0E8D7] text-[#8B261E] flex items-center justify-center mb-3 border border-[#E0D4BD]">
          <Library className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-base text-[#1F1B18]">
          Chưa chọn phát biểu lịch sử
        </h3>
        <p className="text-xs text-[#6B6156] max-w-xs mt-1 leading-relaxed">
          Hãy nhấp vào một phát biểu trong danh sách hoặc nhấp vào đoạn văn bản được tô sáng để xem các trích đoạn sử liệu liên quan.
        </p>
      </div>
    );
  }

  const evidenceList = selectedClaim.evidence || [];
  const hasEvidence = evidenceList.length > 0;
  const currentEvidence = hasEvidence ? evidenceList[activeEvidenceIndex] || evidenceList[0] : null;

  return (
    <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-5 shadow-xs flex flex-col h-full">
      {/* Panel Header */}
      <div className="pb-3.5 mb-3.5 border-b border-[#E8DFC8]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#F0E8D7] text-[#8B261E] border border-[#E2D6C0]">
              <Library className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1F1B18] font-serif uppercase tracking-wide">
                  Nguồn sử liệu đối chiếu
                </h3>
                <span className="text-[11px] px-2 py-0.2 bg-[#8B261E] text-white font-medium rounded-full">
                  Phát biểu {String(claimIndex + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-[11px] text-[#7A7064]">
                {hasEvidence
                  ? `Tìm thấy ${evidenceList.length} đoạn sử liệu liên quan`
                  : "Chưa có trích đoạn sử liệu"}
              </p>
            </div>
          </div>

          {/* Passage Switcher if multiple passages */}
          {hasEvidence && evidenceList.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[#F2EBDB] p-1 rounded-lg border border-[#DDD3BE]">
              <button
                type="button"
                onClick={() =>
                  setActiveEvidenceIndex((prev) =>
                    prev > 0 ? prev - 1 : evidenceList.length - 1
                  )
                }
                className="p-1 rounded text-[#5E544B] hover:text-[#1F1B18] hover:bg-[#E6DEC9] transition-colors cursor-pointer"
                title="Trích đoạn trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-medium text-[#4A4137] px-1">
                {activeEvidenceIndex + 1}/{evidenceList.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveEvidenceIndex((prev) =>
                    prev < evidenceList.length - 1 ? prev + 1 : 0
                  )
                }
                className="p-1 rounded text-[#5E544B] hover:text-[#1F1B18] hover:bg-[#E6DEC9] transition-colors cursor-pointer"
                title="Trích đoạn kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Claim Context Quote */}
        <div className="mt-3 p-2.5 bg-[#FCFBF8] border-l-2 border-[#8B261E] rounded-r border border-r-[#E5DDCB] border-y-[#E5DDCB] text-xs text-[#3D352F]">
          <span className="font-semibold text-[#8B261E]">Phát biểu đang xét: </span>
          <span className="italic font-serif">"{selectedClaim.source_text}"</span>
        </div>
      </div>

      {/* Main Evidence Content */}
      <div className="grow overflow-y-auto pr-1">
        {hasEvidence && currentEvidence ? (
          <div className="space-y-4">
            <EvidenceCard
              evidence={currentEvidence}
              index={activeEvidenceIndex}
              total={evidenceList.length}
            />

            {/* If multiple evidence passages, quick preview buttons below */}
            {evidenceList.length > 1 && (
              <div className="pt-2">
                <div className="text-[11px] font-serif font-bold text-[#695F54] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Các đoạn sử liệu khác ({evidenceList.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {evidenceList.map((ev, idx) => (
                    <button
                      key={ev.chunk_id || idx}
                      type="button"
                      onClick={() => setActiveEvidenceIndex(idx)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                        idx === activeEvidenceIndex
                          ? "bg-[#F5EFE3] border-[#8B261E] text-[#1F1B18] font-medium ring-1 ring-[#8B261E]/30"
                          : "bg-[#FCFBF8] border-[#E3DAC8] text-[#5C5247] hover:bg-[#F3EDE0]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-serif font-semibold text-xs">
                        <span>{ev.book_name || "Sử liệu"}</span>
                        {ev.pages?.length > 0 && (
                          <span className="text-[11px] font-sans text-[#7A6F62]">
                            Trang {ev.pages.join(", ")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 italic text-[11px] text-[#6E6458]">
                        "{ev.text}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Evidence Case */
          <div className="p-6 bg-[#FCFBF8] border border-[#E3DAC8] rounded-xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#F4EFE3] text-[#A37B30] mx-auto flex items-center justify-center border border-[#E2D8C3]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#26211E]">
                Chưa tìm thấy đoạn sử liệu phù hợp trong kho dữ liệu hiện tại.
              </h4>
              <p className="text-xs text-[#6E6458] mt-1.5 leading-relaxed max-w-sm mx-auto">
                Hệ thống chưa tìm thấy trích đoạn có độ tương đồng đủ cao trong các bộ chính sử đã số hóa.
              </p>
            </div>

            <div className="p-3 bg-[#F4ECE0] rounded-lg border border-[#DFD4C0] text-xs text-[#7A3E16] text-left">
              <p className="font-semibold text-[11px] uppercase tracking-wide">
                Lưu ý quan trọng:
              </p>
              <p className="text-[11px] mt-0.5 text-[#5C4230]">
                Điều này không đồng nghĩa nội dung trên là sai. Việc một sự kiện chưa xuất hiện trong các nguồn hiện có là bình thường trong nghiên cứu văn bản học.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#EAE1CF] text-[11px] text-[#7A7064] text-center">
        Trích đoạn từ chính sử và thư tịch cổ phục vụ nghiên cứu & tra cứu học thuật
      </div>
    </div>
  );
};
