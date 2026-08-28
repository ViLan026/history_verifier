import React, { useRef, useEffect } from "react";
import { ResearchEntry, Claim } from "../types";
import { ResearchEntryCard } from "./ResearchEntryCard";
import { ResearchInput } from "./ResearchInput";
import { BookOpen, History, Trash2, PlusCircle, Compass } from "lucide-react";
import { SAMPLE_PARAGRAPHS } from "../data/samples";

interface ResearchSessionProps {
  entries: ResearchEntry[];
  selectedEntryId: string | null;
  selectedClaimId: string | null;
  isLoading: boolean;
  onSelectClaim: (entryId: string, claimId: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onClearSession: () => void;
  onSearchNewText: (text: string) => void;
}

export const ResearchSession: React.FC<ResearchSessionProps> = ({
  entries,
  selectedEntryId,
  selectedClaimId,
  isLoading,
  onSelectClaim,
  onRemoveEntry,
  onClearSession,
  onSearchNewText,
}) => {
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when a new entry is added
  useEffect(() => {
    if (entries.length > 0) {
      scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries.length]);

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
      {/* Session Header */}
      <div className="shrink-0 flex items-center justify-between pb-2.5 mb-2 border-b border-[var(--border-subtle)]">
        <h3 className="font-serif font-bold text-base text-[var(--card-foreground)] uppercase tracking-wide">
          Phiên tra cứu
        </h3>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClearSession}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-[#7f0716] hover:text-white active:bg-[#5f0510] border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới toàn bộ phiên tra cứu"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới phiên</span>
          </button>
        )}
      </div>

      {/* Entries List (Scrollable Chronological Session) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 mb-2">
        {entries.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-2 bg-[var(--surface-raised)] rounded-xl my-auto border border-[var(--border-subtle)]">
            <h4 className="font-serif font-bold text-sm text-[var(--card-foreground)]">
              Bắt đầu phiên nghiên cứu sử liệu
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
              Nhập hoặc dán các đoạn văn bản lịch sử ở bên dưới. Các phát biểu sẽ được đánh dấu trực tiếp để bạn đối chiếu với thư tịch cổ.
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isEntrySelected = entry.id === selectedEntryId;
            return (
              <ResearchEntryCard
                key={entry.id}
                entry={entry}
                isEntrySelected={isEntrySelected}
                selectedClaimId={isEntrySelected ? selectedClaimId : null}
                onSelectClaim={(claimId) => onSelectClaim(entry.id, claimId)}
                onRemoveEntry={onRemoveEntry}
              />
            );
          })
        )}
        <div ref={scrollBottomRef} />
      </div>

      {/* Persistent Input at Bottom */}
      <div className="shrink-0 pt-2 border-t border-[var(--border-subtle)]">
        <ResearchInput onSearch={onSearchNewText} isLoading={isLoading} />
      </div>
    </div>
  );
};
