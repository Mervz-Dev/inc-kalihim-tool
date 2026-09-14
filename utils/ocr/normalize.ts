/**
 * Text normalization and similarity helpers for handwritten Tagalog reasons.
 *
 * Everything here is pure and side-effect free so it can be unit-tested and so
 * the same function can normalize both the OCR output and the keyword list.
 */

/**
 * Tagalog particles and politeness markers that carry no meaning for
 * classification. "UWP PO", "UWP po", and "UWP" must all read the same.
 */
const FILLER_TOKENS = new Set([
  "PO",
  "NA",
  "ANG",
  "SA",
  "NG",
  "SI",
  "AY",
  "AT",
  "LANG",
  "DAW",
  "DIN",
  "RIN",
  "PA",
  "NAMAN",
  "MGA",
  "YUNG",
  "UNG",
]);

/** Digits a recognizer confuses with letters inside a word. */
const DIGIT_TO_LETTER: Record<string, string> = {
  "0": "O",
  "1": "I",
  "5": "S",
  "8": "B",
};

/** Form references such as "R1-07", "R1 06", "R107" all become "R107"/"R106". */
const FORM_CODE = /\bR ?1 ?[- ]?(0?[67])\b/g;

/**
 * The sheets carry a diagonal watermark ("16381103-2651587") that the
 * recognizer reads as text wherever it crosses a cell. No reason is a run
 * of digits, so such tokens are dropped (row numbers are one or two digits).
 */
const isWatermarkToken = (token: string): boolean => /^\d{4,}$/.test(token);

/**
 * Handwritten "UWP" as the recognizer tends to read it: the cursive W comes
 * back as a, v, n, m or u ("uap", "uvp"), and the trailing "po" is sometimes
 * glued on ("UWPPO"). No Tagalog word looks like any of these.
 */
const UWP_VARIANT = /^U[WAVNMU]P(PO)?$/;

const fixAbbreviations = (token: string): string =>
  UWP_VARIANT.test(token) ? "UWP" : token;

const stripDiacritics = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Inside a token that is clearly a word (mostly letters), a digit is almost
 * always a misread letter: "P0" is "PO", "UW1" is "UWI". Form codes like R107
 * are left alone.
 */
const fixDigitConfusions = (token: string): string => {
  if (/^R10[67]$/.test(token)) return token;

  const letters = (token.match(/[A-Z]/g) || []).length;
  const digits = (token.match(/[0-9]/g) || []).length;
  if (letters === 0 || digits === 0 || digits > letters) return token;

  return token.replace(/[0158]/g, (digit) => DIGIT_TO_LETTER[digit] ?? digit);
};

/**
 * Uppercase, accent-free, punctuation-free, single-spaced, filler removed.
 * Returns "" for text with no meaningful tokens.
 */
export const normalizeText = (value: string): string => {
  if (!value) return "";

  const upper = stripDiacritics(value).toUpperCase();
  const withCodes = upper.replace(FORM_CODE, (_match, suffix: string) => {
    return `R1${suffix.padStart(2, "0")}`;
  });

  return withCodes
    .replace(/[^A-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((token) => !isWatermarkToken(token))
    .map(fixDigitConfusions)
    .map(fixAbbreviations)
    .filter((token) => !FILLER_TOKENS.has(token))
    .join(" ");
};

export const tokenize = (value: string): string[] =>
  normalizeText(value).split(" ").filter(Boolean);

/** Levenshtein edit distance. */
export const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
    }
    previous = current;
  }

  return previous[b.length];
};

const bigrams = (value: string): Map<string, number> => {
  const counts = new Map<string, number>();
  for (let i = 0; i < value.length - 1; i++) {
    const gram = value.slice(i, i + 2);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return counts;
};

/** Sørensen–Dice similarity on character bigrams, 0–1. */
export const diceSimilarity = (a: string, b: string): number => {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const gramsA = bigrams(a);
  const gramsB = bigrams(b);
  let overlap = 0;

  gramsA.forEach((count, gram) => {
    overlap += Math.min(count, gramsB.get(gram) ?? 0);
  });

  return (2 * overlap) / (a.length - 1 + (b.length - 1));
};

/**
 * Whether an OCR token is a close-enough reading of an expected token.
 *
 * Short tokens ("TS", "MS", "UWP", "OJT") must match exactly: with one or two
 * bigrams, similarity scores are meaningless and a single wrong letter is a
 * different abbreviation. Longer tokens tolerate one edit or a high bigram
 * overlap, which covers the usual stroke misreads (TRABAJO / TRABAHO).
 */
const FORM_CODE_TOKEN = /^R10[67]$/;

export const tokensMatch = (expected: string, actual: string): boolean => {
  if (expected === actual) return true;
  if (expected.length <= 3 || actual.length <= 3) return false;
  // R1-06 and R1-07 are one edit apart and mean different codes.
  if (FORM_CODE_TOKEN.test(expected) || FORM_CODE_TOKEN.test(actual)) return false;

  return (
    editDistance(expected, actual) <= 1 ||
    diceSimilarity(expected, actual) >= 0.75
  );
};

/** Length of the longest common subsequence. */
export const lcsLength = (a: string, b: string): number => {
  let previous = new Array<number>(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    const current = [0];
    for (let j = 1; j <= b.length; j++) {
      current[j] =
        a[i - 1] === b[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], current[j - 1]);
    }
    previous = current;
  }

  return previous[b.length];
};

/**
 * A looser reading match for long words the recognizer mangled with extra or
 * swapped strokes ("TIRABAITO" for TRABAHO): nearly all of the expected
 * letters appear, in order, in the reading. Only for words long enough that
 * this cannot happen by accident, and never for a different initial letter.
 */
export const tokensMatchLoosely = (expected: string, actual: string): boolean => {
  if (expected.length < 6 || actual.length < 5) return false;
  if (expected[0] !== actual[0]) return false;
  if (actual.length > expected.length + 3) return false;

  return lcsLength(expected, actual) >= Math.ceil(expected.length * 0.8);
};
