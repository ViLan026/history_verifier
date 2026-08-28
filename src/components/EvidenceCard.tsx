import React, { useState } from "react";
import { BookOpen, Copy, Check, Hash, Bookmark, BookMarked, AlignLeft } from "lucide-react";
import { Evidence } from "../types";

interface EvidenceCardProps {
  evidence: Evidence;
  index: number;
  total: number;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  index,
  total,
}) => {
  const [copied, setCopied] = useState(false);

  // Extract non-empty headers
  const headerEntries = evidence.headers
    ? Object.entries(evidence.headers).filter(
        ([_, val]) => typeof val === "string" && val.trim() !== ""
      )
    : [];

  // Extract non-empty footnotes
  const footnoteEntries = evidence.footnotes
    ? Object.entries(evidence.footnotes).filter(
        ([_, val]) => typeof val === "string" && val.trim() !== ""
      )
    : [];

  const formattedPages = evidence.pages && evidence.pages.length > 0
    ? evidence.pages.join(", ")
    : null;

  const handleCopyCitation = () => {
    let citation = `[Trích nguồn] ${evidence.book_name || "Sử liệu Việt Nam"}`;
    if (formattedPages) citation += `, Trang ${formattedPages}`;
    if (headerEntries.length > 0) {
      citation += ` (${headerEntries.map(([_, h]) => h).join(" - ")})`;
    }
    citation += `:\n"${evidence.text}"`;

    if (footnoteEntries.length > 0) {
      citation += `\nChú thích: ${footnoteEntries.map(([k, v]) => `[${k}] ${v}`).join("; ")}`;
    }

    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      id={`evidence-card-${evidence.chunk_id || index}`}
      className="bg-[#FCFBF8] border border-[#DED4C1] rounded-xl p-5 sm:p-6 shadow-xs relative transition-all"
    >
      {/* Archival Badge Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#ECE3D2]">
        <div className="space-y-1">
          {/* Book Name */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#8B261E] flex-shrink-0" />
          </div>

          {/* Section / Header if available */}
          {headerEntries.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#7A6E5F] font-serif">
              <Bookmark className="w-3.5 h-3.5 text-[#A69986] flex-shrink-0" />
              <span>
                {headerEntries.map(([_, headerText], i) => (
                  <span key={i}>
                    {i > 0 && " · "}
                    {headerText}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* Page metadata & citation copy */}
        <div className="flex items-center gap-2">
          {formattedPages && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F2EBDB] text-[#4A4035] text-xs font-serif font-medium border border-[#E0D5BE]">
              <BookMarked className="w-3.5 h-3.5 text-[#8B261E]" />
              <span>Trang {formattedPages}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleCopyCitation}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-[#5E544B] hover:text-[#1F1B18] bg-[#F4EFE5] hover:bg-[#EAE2D2] border border-[#DDD4C1] transition-colors cursor-pointer"
            title="Sao chép trích đoạn và nguồn dẫn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-700">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trích dẫn</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary: Original Historical Passage */}
      <div className="my-4 pl-4 border-l-3 border-[#8B261E] bg-[#F8F5EC]/60 p-4 rounded-r-lg">
        <p className="text-base sm:text-[17px] text-[#241F1B] leading-relaxed font-serif text-justify select-text">
          {evidence.text}
        </p>
      </div>

      {/* Footnotes section (only rendered if footnotes exist) */}
      {footnoteEntries.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#ECE3D2] bg-[#F5EFE3]/80 p-3 rounded-lg border border-[#E4D9C4]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8B261E] font-serif uppercase tracking-wider mb-2">
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Chú thích thư tịch</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#52483E] leading-relaxed">
            {footnoteEntries.map(([key, noteText]) => (
              <li key={key} className="flex items-start gap-1.5">
                <span className="font-semibold text-[#8B261E] min-w-[20px]">
                  [{key}]:
                </span>
                <span>{noteText}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: Discreet Technical Metadata (Độ liên quan) */}
      <div className="mt-4 pt-3 border-t border-[#EFE8D8] flex items-center justify-between text-xs text-[#8C8072]">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">
            Trích đoạn <strong>{index + 1}</strong> / {total}
          </span>
        </div>

        {typeof evidence.score === "number" && (
          <div className="flex items-center gap-1 text-[11px] text-[#7A6F62]">
            <span>Độ liên quan:</span>
            <span className="font-mono font-medium text-[#4A4137]">
              {(evidence.score * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </article>
  );
};
