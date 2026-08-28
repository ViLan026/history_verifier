import React, { useState } from "react";
import { Claim } from "../types";
import { OriginalTextViewer } from "./OriginalTextViewer";
import { ClaimList } from "./ClaimList";
import { EvidencePanel } from "./EvidencePanel";
import { FileText, MapPin, Library } from "lucide-react";

interface EvidenceMapWorkspaceProps {
  originalText: string;
  claims: Claim[];
  selectedClaimId: string | null;
  onSelectClaim: (claimId: string) => void;
  onEditOriginalText: () => void;
}

export const EvidenceMapWorkspace: React.FC<EvidenceMapWorkspaceProps> = ({
  originalText,
  claims,
  selectedClaimId,
  onSelectClaim,
  onEditOriginalText,
}) => {
  // Active mobile tab: 'text' | 'claims' | 'evidence'
  const [mobileTab, setMobileTab] = useState<"text" | "claims" | "evidence">("claims");

  const selectedIndex = claims.findIndex((c) => c.id === selectedClaimId);
  const selectedClaim = selectedIndex !== -1 ? claims[selectedIndex] : claims[0] || null;
  const currentClaimIndex = selectedIndex !== -1 ? selectedIndex : 0;

  const handleSelectClaimAndSwitchMobile = (claimId: string) => {
    onSelectClaim(claimId);
    // On mobile, automatically show evidence tab when a claim is picked
    if (window.innerWidth < 768) {
      setMobileTab("evidence");
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-between bg-[#EFE9DC] p-1 rounded-xl border border-[#D5C9B3]">
        <button
          type="button"
          onClick={() => setMobileTab("text")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "text"
              ? "bg-[#FAF7F0] text-[#1F1B18] shadow-xs border border-[#DED4C1]"
              : "text-[#6E6356] hover:text-[#1F1B18]"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Văn bản gốc</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("claims")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "claims"
              ? "bg-[#FAF7F0] text-[#1F1B18] shadow-xs border border-[#DED4C1]"
              : "text-[#6E6356] hover:text-[#1F1B18]"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#8B261E]" />
          <span>Phát biểu ({claims.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("evidence")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "evidence"
              ? "bg-[#FAF7F0] text-[#1F1B18] shadow-xs border border-[#DED4C1]"
              : "text-[#6E6356] hover:text-[#1F1B18]"
          }`}
        >
          <Library className="w-3.5 h-3.5 text-[#8B261E]" />
          <span>Sử liệu ({selectedClaim?.evidence?.length || 0})</span>
        </button>
      </div>

      {/* Desktop 3-Column Layout / Tablet 2-Row Layout / Mobile Tabbed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Column 1: Original Text Viewer */}
        <div
          className={`lg:col-span-4 ${
            mobileTab !== "text" ? "hidden lg:block" : "block"
          }`}
        >
          <OriginalTextViewer
            originalText={originalText}
            claims={claims}
            selectedClaimId={selectedClaimId}
            onSelectClaim={handleSelectClaimAndSwitchMobile}
            onEdit={onEditOriginalText}
          />
        </div>

        {/* Column 2: Historical Claims List */}
        <div
          className={`lg:col-span-4 ${
            mobileTab !== "claims" ? "hidden lg:block" : "block"
          }`}
        >
          <ClaimList
            claims={claims}
            selectedClaimId={selectedClaimId}
            onSelectClaim={handleSelectClaimAndSwitchMobile}
          />
        </div>

        {/* Column 3: Historical Evidence Passages */}
        <div
          className={`lg:col-span-4 ${
            mobileTab !== "evidence" ? "hidden lg:block" : "block"
          }`}
        >
          <EvidencePanel
            selectedClaim={selectedClaim}
            claimIndex={currentClaimIndex}
          />
        </div>
      </div>
    </div>
  );
};
