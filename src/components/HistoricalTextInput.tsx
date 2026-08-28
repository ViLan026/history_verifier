import React, { useState } from "react";
import { Search, Sparkles, RefreshCw, Trash2, BookOpen, ChevronDown } from "lucide-react";
import { SAMPLE_PARAGRAPHS } from "../data/samples";
import { SampleParagraph } from "../types";

interface HistoricalTextInputProps {
  content: string;
  onChangeContent: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const HistoricalTextInput: React.FC<HistoricalTextInputProps> = ({
  content,
  onChangeContent,
  onSubmit,
  isLoading,
}) => {
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);

  const handleSelectSample = (sample: SampleParagraph) => {
    onChangeContent(sample.content);
    setShowSampleDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading && content.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[#FAF7F0] border border-[#E3DAC8] rounded-xl p-5 sm:p-6 shadow-xs relative">

      {/* Editor Box */}
      <div className="relative rounded-lg border border-[#D5C9B3] bg-[#FCFBF8] focus-within:border-[#8B261E] focus-within:ring-2 focus-within:ring-[#8B261E]/20 transition-all">
        <textarea
          id="historical-input-textarea"
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={6}
          placeholder="Dán một bài viết, đoạn văn hoặc nội dung lịch sử vào đây..."
          className="w-full p-4 text-base text-[#241F1C] placeholder-[#9E9487] bg-transparent border-0 resize-y focus:outline-hidden disabled:opacity-60 leading-relaxed font-sans"
        />

        {/* Action bar inside/below textarea */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#F6F1E5] border-t border-[#E8DFC8] rounded-b-lg text-xs text-[#70665C]">
          <div className="flex items-center gap-3">
            <span>{charCount} ký tự</span>
            <span className="text-[#C5BBAA]">•</span>
            <span>{wordCount} từ</span>
          </div>

          <div className="flex items-center gap-2">
            {content && !isLoading && (
              <button
                type="button"
                onClick={() => onChangeContent("")}
                className="inline-flex items-center gap-1 text-[#8C4A42] hover:text-[#6B1B15] px-2 py-1 rounded hover:bg-[#EFE7D5] transition-colors cursor-pointer"
                title="Xóa nội dung"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls / Submission Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Sample selector */}
        <div className="relative">
          <button
            type="button"
            id="btn-sample-content"
            onClick={() => setShowSampleDropdown(!showSampleDropdown)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#4A3F33] bg-[#EFE9DB] hover:bg-[#E4DBC8] border border-[#D5C9B3] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B261E]" />
            <span>Thử nội dung mẫu</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSampleDropdown ? "rotate-180" : ""}`} />
          </button>

          {showSampleDropdown && (
            <div className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-[#FAF7F0] border border-[#D5C9B3] rounded-lg shadow-lg z-40 py-1.5 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[11px] font-semibold text-[#8B261E] uppercase tracking-wider border-b border-[#E8DFC8]">
                Chọn đoạn văn mẫu
              </div>
              {SAMPLE_PARAGRAPHS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#EFE8D6] transition-colors border-b border-[#F0E9DA] last:border-0"
                >
                  <div className="text-xs font-semibold text-[#1F1B18] font-serif">{sample.title}</div>
                  <div className="text-[11px] text-[#7A7064] mt-0.5">{sample.era}</div>
                  <div className="text-[11px] text-[#8C4A42] mt-0.5 italic truncate">{sample.sourceHint}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          id="btn-submit-search"
          onClick={onSubmit}
          disabled={isLoading || !content.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#8B261E] hover:bg-[#721F18] active:bg-[#5C1813] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang tra cứu nguồn...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Tìm nguồn sử liệu</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-2 text-right">
        <span className="text-[11px] text-[#8C8276] hidden sm:inline">
          Mẹo: Nhấn <kbd className="px-1.5 py-0.5 bg-[#EAE2D0] border border-[#D5CABB] rounded text-[10px] text-[#4A423A]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-[#EAE2D0] border border-[#D5CABB] rounded text-[10px] text-[#4A423A]">Enter</kbd> để tìm kiếm nhanh
        </span>
      </div>
    </div>
  );
};
