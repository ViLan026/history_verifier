export interface Evidence {
  chunk_id: string;
  score: number;
  book_name: string;
  source_id?: string;
  pages: number[];
  text: string;
  headers?: Record<string, string> | null;
  footnotes?: Record<string, string> | null;
  token_count?: number;
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


export interface SourceWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  block: number;
  line: number;
  word: number;
}

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SourcePageView {
  page: number;
  width: number;
  height: number;
  words: SourceWord[];
  highlights: HighlightRect[];
}

export interface EvidenceViewResponse {
  source_id: string;
  source_pages: number[];
  pdf_pages: number[];
  display_pages: number[];
  pages: SourcePageView[];
  highlight_found: boolean;
}