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

export interface OcrLine {
  text: string;
  confidence: number;
  candidates: string[];
  box: OcrBox;
  words: OcrWord[];
}

export interface OcrResult {
  imageWidth: number;
  imageHeight: number;
  lines: OcrLine[];
}

export interface RecognizeOptions {
  /**
   * Restrict recognition to this part of the image (normalized, top-left
   * origin). Boxes in the result stay relative to the whole image.
   */
  regionOfInterest?: OcrBox;
  /**
   * Let the recognizer correct readings against a dictionary. Off by default:
   * it "corrects" Tagalog and abbreviations such as UWP toward English words.
   */
  languageCorrection?: boolean;
  /** Extra vocabulary the corrector may snap to. Only used with correction on. */
  customWords?: string[];
  /**
   * Boost contrast and sharpen before recognizing. Helps faint ballpen on
   * white paper; can hurt clean photos.
   */
  enhance?: boolean;
}

export interface HandwritingOcrModuleType {
  /** False on platforms without an on-device recognizer (Android, for now). */
  isSupported: boolean;
  /** Whether the system document scanner (camera with auto-capture) exists here. */
  isDocumentScannerSupported: boolean;
  /**
   * Opens the system document scanner. Resolves with a file URI of the scanned
   * page, already flattened and cleaned up, or null if the user cancelled.
   */
  scanDocument(): Promise<string | null>;
  recognizeText(uri: string, options?: RecognizeOptions): Promise<OcrResult>;
  /**
   * Recognizes several regions of the same image in one pass. Each result
   * corresponds to the cell at the same index.
   */
  recognizeCells(
    uri: string,
    cells: OcrBox[],
    options?: RecognizeOptions
  ): Promise<OcrResult[]>;
}
