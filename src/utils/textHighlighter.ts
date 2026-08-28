import { Claim } from "../types";

export interface TextSegment {
  text: string;
  claimId?: string;
  claimIndex?: number;
  isMatch: boolean;
}

/**
 * Splits original text into exact character slices corresponding to each claim's source_text.
 * Preserves the user's original text exactly without rewriting.
 */
export function segmentOriginalText(
  originalText: string,
  claims: Claim[]
): TextSegment[] {
  if (!originalText || !claims || claims.length === 0) {
    return [{ text: originalText, isMatch: false }];
  }

  interface Match {
    start: number;
    end: number;
    claimId: string;
    claimIndex: number;
    sourceText: string;
  }

  const matches: Match[] = [];

  claims.forEach((claim, index) => {
    const rawTarget = claim.source_text?.trim();
    if (!rawTarget) return;

    // 1. Try exact match
    let foundIndex = originalText.indexOf(rawTarget);
    if (foundIndex !== -1) {
      matches.push({
        start: foundIndex,
        end: foundIndex + rawTarget.length,
        claimId: claim.id,
        claimIndex: index + 1,
        sourceText: rawTarget,
      });
      return;
    }

    // 2. Try case-insensitive match
    const lowerOriginal = originalText.toLowerCase();
    const lowerTarget = rawTarget.toLowerCase();
    foundIndex = lowerOriginal.indexOf(lowerTarget);
    if (foundIndex !== -1) {
      matches.push({
        start: foundIndex,
        end: foundIndex + rawTarget.length,
        claimId: claim.id,
        claimIndex: index + 1,
        sourceText: rawTarget,
      });
      return;
    }

    // 3. Try collapsed whitespace match if exact spacing differs
    const cleanTargetWords = rawTarget.split(/\s+/).filter(Boolean);
    if (cleanTargetWords.length >= 2) {
      const firstWord = cleanTargetWords[0].toLowerCase();
      const lastWord = cleanTargetWords[cleanTargetWords.length - 1].toLowerCase();

      let searchPos = 0;
      while (searchPos < lowerOriginal.length) {
        const w1Pos = lowerOriginal.indexOf(firstWord, searchPos);
        if (w1Pos === -1) break;

        const wLastPos = lowerOriginal.indexOf(lastWord, w1Pos + firstWord.length);
        if (wLastPos !== -1 && wLastPos - w1Pos < rawTarget.length * 1.6) {
          matches.push({
            start: w1Pos,
            end: wLastPos + lastWord.length,
            claimId: claim.id,
            claimIndex: index + 1,
            sourceText: rawTarget,
          });
          break;
        }
        searchPos = w1Pos + firstWord.length;
      }
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Filter out overlapping matches (keep the first one)
  const nonOverlapping: Match[] = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd && m.end <= originalText.length) {
      nonOverlapping.push(m);
      lastEnd = m.end;
    }
  }

  // Build segments from exact originalText slices
  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const match of nonOverlapping) {
    if (match.start > currentIndex) {
      segments.push({
        text: originalText.slice(currentIndex, match.start),
        isMatch: false,
      });
    }

    segments.push({
      text: originalText.slice(match.start, match.end),
      claimId: match.claimId,
      claimIndex: match.claimIndex,
      isMatch: true,
    });

    currentIndex = match.end;
  }

  if (currentIndex < originalText.length) {
    segments.push({
      text: originalText.slice(currentIndex),
      isMatch: false,
    });
  }

  return segments;
}
