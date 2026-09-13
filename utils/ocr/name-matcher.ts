import { tokenize, tokensMatch } from "./normalize";

export interface NameMatch<T> {
  record: T;
  /** 0–1; share of name tokens that agree. */
  score: number;
}

/** A sheet name has to agree with a record this well to be shown as a match. */
export const NAME_MATCH_THRESHOLD = 0.5;

/**
 * Finds the member record a sheet name refers to.
 *
 * Names on the sheet are "SURNAME, FIRST"; records may be stored either way,
 * so the comparison is on token sets, not strings. Tokens tolerate one
 * misread letter each, since the recognizer occasionally drops or swaps a
 * character even on printed text.
 */
export const matchName = <T>(
  nameText: string,
  records: T[],
  fullnameOf: (record: T) => string
): NameMatch<T> | null => {
  const sheetTokens = tokenize(nameText);
  if (sheetTokens.length === 0) return null;

  let best: NameMatch<T> | null = null;

  records.forEach((record) => {
    const recordTokens = tokenize(fullnameOf(record));
    if (recordTokens.length === 0) return;

    const remaining = [...recordTokens];
    let agreed = 0;

    sheetTokens.forEach((token) => {
      const index = remaining.findIndex((candidate) =>
        tokensMatch(candidate, token)
      );
      if (index >= 0) {
        agreed += 1;
        remaining.splice(index, 1);
      }
    });

    const score =
      agreed / Math.max(sheetTokens.length, recordTokens.length);

    if (score >= NAME_MATCH_THRESHOLD && (!best || score > best.score)) {
      best = { record, score };
    }
  });

  return best;
};
