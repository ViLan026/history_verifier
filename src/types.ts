export interface Evidence {
  chunk_id?: string | null;
  score?: number | null;
  book_name?: string | null;
  source_id?: string | null;
  pages: number[];
  pdf_pages: number[];
  text: string;
  headers?: Record<string, string> | null;
  footnotes?: Record<string, unknown> | null;
  token_count?: number | null;
}

export interface Claim {
  id: string;
  source_text: string;
  claim: string;
  evidence: Evidence[];
}

export interface EvidenceMapResponse {
  claims: Claim[];
}

export interface PdfSourceResponse {
  source_id: string;
  book_name: string;
  url: string;
  expires_in: number;
}

export interface ResearchEntry {
  id: string;
  indexNumber: number;
  inputText: string;
  status: "loading" | "success" | "error" | "empty";
  errorMessage?: string;
  claims: Claim[];
  createdAt: number;
}

export interface SelectedClaimContext {
  entryId: string;
  claimId: string;
  claim: Claim;
  evidenceIndex: number;
}

export interface SampleParagraph {
  id: string;
  title: string;
  era: string;
  content: string;
  sourceHint: string;
}