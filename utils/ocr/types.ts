import { Percent } from "@/types/percent";

/** Normalized (0–1) rectangle, origin at the top-left of the upright image. */
export interface OcrBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrWord {
  text: string;
  box: OcrBox;
}

/** One recognized observation; on a printed table this is often a whole row. */
export interface OcrLine {
  text: string;
  /** Recognizer confidence for `text`, 0–1. */
  confidence: number;
  /** Alternative readings, best first (includes `text`). */
  candidates: string[];
  box: OcrBox;
  words: OcrWord[];
}

export interface OcrResult {
  imageWidth: number;
  imageHeight: number;
  lines: OcrLine[];
}

/** One row of the sheet, as reconstructed from the OCR geometry. */
export interface ScannedRow {
  /** The printed row number in the Blg column. */
  blg: number;
  nameText: string;
  reasonText: string;
  /** Every reading of the reason worth classifying, best first. */
  reasonCandidates: string[];
  /** Lowest recognizer confidence among the words that make up the reason. */
  reasonConfidence: number;
  /**
   * The whole Dahilan cell for this row (column × row band), for a second,
   * cropped recognition pass. Present even when nothing was read in it.
   */
  reasonCell: OcrBox;
  /** Tight box around the reason words actually read, or null if none. */
  reasonBox: OcrBox | null;
}

/** Column geometry derived from the sheet, all normalized 0–1. */
export interface FormLayout {
  /** Left edge of the Dahilan column. */
  reasonLeft: number;
  /** Right edge of the Dahilan column (before the tick-box columns). */
  reasonRight: number;
  /** Bottom of the header row (its Pangalan word); nothing above it is a data row. */
  headerBottom: number;
  /**
   * The header line as read, from the Pangalan word to the Dahilan word, so
   * its slope on a tilted photo is known; `height` is the taller of the two.
   */
  headerLine?: { fromX: number; fromY: number; toX: number; toY: number; height: number };
  /** Whether the layout came from detected headers or the fallback constants. */
  fromHeaders: boolean;
}

export interface CodeCandidate {
  key: keyof Percent.Codes;
  /**
   * 1.0 exact phrase, 0.9 contained, 0.8 fuzzy, 0.7 loose (a best guess that
   * must be checked), or 1.0 from a learned alias.
   */
  score: number;
  /** The keyword (or alias) that produced the match. */
  matched: string;
}

export interface CodeSuggestion {
  /** Best candidate, or null when nothing reached the threshold. */
  key: keyof Percent.Codes | null;
  score: number;
  candidates: CodeCandidate[];
  /** True when the suggestion came from a Kalihim's earlier correction. */
  fromAlias: boolean;
  /** The reading that produced this suggestion, when there was one. */
  reading?: string;
}

/** `normalized reason text -> code key`, learned from review corrections. */
export type ReasonAliases = Record<string, keyof Percent.Codes>;
