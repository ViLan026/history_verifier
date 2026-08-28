/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Header } from "./components/Header";
import { ResearchSession } from "./components/ResearchSession";
import { SourceReader } from "./components/SourceReader";
import { Claim, EvidenceMapResponse, ResearchEntry } from "./types";

export default function App() {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Find currently selected claim scoped to the selected entry
  const selectedEntry = entries.find((e) => e.id === selectedEntryId);
  let selectedClaim: Claim | null = null;
  let claimIndex = 0;

  if (selectedEntry && selectedClaimId) {
    const idx = selectedEntry.claims.findIndex((c) => c.id === selectedClaimId);
    if (idx !== -1) {
      selectedClaim = selectedEntry.claims[idx];
      claimIndex = idx;
    }
  }

  // Handle submitting new historical text in session
  const handleSearchNewText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSearching) return;

    const newEntryId = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newIndexNumber = entries.length + 1;

    const newEntry: ResearchEntry = {
      id: newEntryId,
      indexNumber: newIndexNumber,
      inputText: trimmed,
      status: "loading",
      claims: [],
      createdAt: Date.now(),
    };

    // Add loading entry immediately to session
    setEntries((prev) => [...prev, newEntry]);
    setIsSearching(true);

    try {
      const response = await fetch("/api/evidence-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        let errorMessage = "Không thể kết nối tới dịch vụ tìm nguồn sử liệu.";
        try {
          const errData = await response.json();
          if (errData?.error) errorMessage = errData.error;
        } catch {}
        throw new Error(errorMessage);
      }

      const data: EvidenceMapResponse = await response.json();
      const returnedClaims = Array.isArray(data?.claims) ? data.claims : [];

      setEntries((prev) =>
        prev.map((item) => {
          if (item.id === newEntryId) {
            return {
              ...item,
              status: returnedClaims.length > 0 ? "success" : "empty",
              claims: returnedClaims,
            };
          }
          return item;
        })
      );

      // Auto select the first claim of the new entry if available
      if (returnedClaims.length > 0) {
        setSelectedEntryId(newEntryId);
        setSelectedClaimId(returnedClaims[0].id);
        setActiveEvidenceIndex(0);
      }
    } catch (err: any) {
      console.error("Error analyzing historical passage:", err);
      setEntries((prev) =>
        prev.map((item) => {
          if (item.id === newEntryId) {
            return {
              ...item,
              status: "error",
              errorMessage:
                err.message ||
                "Có lỗi xảy ra khi phân tích đoạn văn bản này. Vui lòng thử lại.",
            };
          }
          return item;
        })
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a claim specifically for a given entry
  const handleSelectClaim = (entryId: string, claimId: string) => {
    setSelectedEntryId(entryId);
    setSelectedClaimId(claimId);
    setActiveEvidenceIndex(0);
  };

  // Handle removing a single entry
  const handleRemoveEntry = (entryId: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== entryId);
      // Re-index remaining entries
      return filtered.map((e, idx) => ({ ...e, indexNumber: idx + 1 }));
    });

    if (selectedEntryId === entryId) {
      setSelectedEntryId(null);
      setSelectedClaimId(null);
    }
  };

  // Handle clearing the entire session
  const handleClearSession = () => {
    setEntries([]);
    setSelectedEntryId(null);
    setSelectedClaimId(null);
    setActiveEvidenceIndex(0);
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      {/* Archival Workspace Header */}
      <Header />

      {/* Main Two-Column Research Layout strictly constrained to remaining viewport height */}
      <main className="flex-1 min-h-0 max-w-[1600px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch overflow-hidden">
          {/* Left Column: Research Session (38-40% desktop) */}
          <section
            aria-label="Phiên tra cứu tạm thời"
            className="w-full lg:w-[40%] xl:w-[38%] h-full min-h-0 flex flex-col overflow-hidden"
          >
            <ResearchSession
              entries={entries}
              selectedEntryId={selectedEntryId}
              selectedClaimId={selectedClaimId}
              isLoading={isSearching}
              onSelectClaim={handleSelectClaim}
              onRemoveEntry={handleRemoveEntry}
              onClearSession={handleClearSession}
              onSearchNewText={handleSearchNewText}
            />
          </section>

          {/* Right Column: Historical Source Reader (60-62% desktop) */}
          <section
            aria-label="Nguồn sử liệu và thư tịch cổ"
            className="w-full lg:w-[60%] xl:w-[62%] h-full min-h-0 flex flex-col overflow-hidden"
          >
            <SourceReader
              selectedClaim={selectedClaim}
              claimIndex={claimIndex}
              activeEvidenceIndex={activeEvidenceIndex}
              onChangeEvidenceIndex={setActiveEvidenceIndex}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
