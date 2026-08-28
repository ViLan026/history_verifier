import React, { useState } from "react";
import { Search, Sparkles, RefreshCw, ChevronDown } from "lucide-react";
import { SAMPLE_PARAGRAPHS } from "../data/samples";
import { SampleParagraph } from "../types";

interface ResearchInputProps {
  onSearch: (text: string) => void;
  isLoading: boolean;
}

export const ResearchInput: React.FC<ResearchInputProps> = ({
  onSearch,
  isLoading,
}) => {
  const [content, setContent] = useState<string>("");
  const [showSampleDropdown, setShowSampleDropdown] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!content.trim() || isLoading) return;
    onSearch(content.trim());
    setContent("");
  };

  const handleSelectSample = (sample: SampleParagraph) => {
    setContent(sample.content);
    setShowSampleDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isLoading && content.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-3.5 shadow-xs relative">
      {/* Editor Box */}
      <div className="relative rounded-lg border border-[var(--border)] bg-white focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/15 transition-all">
        <textarea
          id="research-input-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={3}
          placeholder="Nội dung lịch sử cần tìm nguồn..."
          className="w-full p-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 resize-y focus:outline-hidden disabled:opacity-60 leading-relaxed font-sans"
        />
      </div>

      {/* Control Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Sample selector */}
        <div className="relative">
          <button
            type="button"
            id="btn-sample-content"
            onClick={() => setShowSampleDropdown(!showSampleDropdown)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-[#7f0716] hover:text-white active:bg-[#5f0510] border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-white transition-colors" />
            <span>Thử mẫu</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showSampleDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSampleDropdown && (
            <div className="absolute left-0 bottom-full mb-1.5 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-40 py-1 animate-in fade-in-50 zoom-in-95 max-h-64 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--primary)] uppercase tracking-wider border-b border-gray-100 font-serif">
                Chọn đoạn văn mẫu
              </div>
              {SAMPLE_PARAGRAPHS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-left px-3 py-2 hover:bg-red-50/60 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="text-xs font-semibold text-gray-900 font-serif">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {sample.era}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-submit-search"
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[#7f0716] active:bg-[#5f0510] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang tìm nguồn...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Tìm nguồn sử liệu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
