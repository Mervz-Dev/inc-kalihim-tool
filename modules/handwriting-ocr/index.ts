import HandwritingOcrModule from "./src/HandwritingOcrModule";
import type {
  OcrBox,
  OcrResult,
  RecognizeOptions,
} from "./src/HandwritingOcr.types";

export type {
  OcrBox,
  OcrLine,
  OcrResult,
  OcrWord,
  RecognizeOptions,
} from "./src/HandwritingOcr.types";

/** Whether this device can recognize handwriting on its own. */
export const isHandwritingOcrSupported: boolean =
  HandwritingOcrModule.isSupported;

/** Whether the system document scanner (camera with auto-capture) is available. */
export const isDocumentScannerSupported: boolean =
  HandwritingOcrModule.isDocumentScannerSupported;

/**
 * Opens the system document scanner. Resolves with a file URI of the scanned
 * page, flattened and cleaned up by the OS, or null if the user cancelled.
 */
export const scanDocument = (): Promise<string | null> =>
  HandwritingOcrModule.scanDocument();

/** Recognizes all text in a photo (file:// URI), fully on-device. */
export const recognizeText = (
  uri: string,
  options?: RecognizeOptions
): Promise<OcrResult> => HandwritingOcrModule.recognizeText(uri, options);

/** Recognizes each given region of a photo separately, in one pass. */
export const recognizeCells = (
  uri: string,
  cells: OcrBox[],
  options?: RecognizeOptions
): Promise<OcrResult[]> =>
  HandwritingOcrModule.recognizeCells(uri, cells, options);
