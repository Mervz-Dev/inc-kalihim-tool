import { CODE_DEFINITIONS } from "@/constants/codes";
import { Percent } from "@/types/percent";
import {
  normalizeText,
  tokenize,
  tokensMatch,
  tokensMatchLoosely,
} from "./normalize";
import { CodeCandidate, CodeSuggestion, ReasonAliases } from "./types";

/** Minimum score for a candidate to be offered as the suggestion. */
export const SUGGESTION_THRESHOLD = 0.7;

/** Below this the suggestion is a best guess and the row should be checked. */
export const CONFIDENT_THRESHOLD = 0.8;

const SCORE_EXACT = 1;
const SCORE_CONTAINED = 0.9;
const SCORE_FUZZY = 0.8;
const SCORE_LOOSE = 0.7;

interface PreparedKeyword {
  key: keyof Percent.Codes;
  original: string;
  tokens: string[];
  joined: string;
  /** Longer phrases are more specific and win ties. */
  length: number;
}

/** Keywords normalized once, exactly as the OCR text will be. */
const PREPARED_KEYWORDS: PreparedKeyword[] = CODE_DEFINITIONS.flatMap(
  (definition) =>
    definition.keywords
      .map((keyword) => {
        const tokens = tokenize(keyword);
        return {
          key: definition.key,
          original: keyword,
          tokens,
          joined: tokens.join(""),
          length: tokens.join(" ").length,
        };
      })
      .filter((keyword) => keyword.tokens.length > 0)
);

const containsPhrase = (tokens: string[], phrase: string[]): boolean => {
  if (phrase.length > tokens.length) return false;

  for (let start = 0; start + phrase.length <= tokens.length; start++) {
    let matched = true;
    for (let i = 0; i < phrase.length; i++) {
      if (tokens[start + i] !== phrase[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }

  return false;
};

const containsPhraseBy = (
  tokens: string[],
  phrase: string[],
  matches: (expected: string, actual: string) => boolean
): boolean => {
  if (phrase.length > tokens.length) return false;

  for (let start = 0; start + phrase.length <= tokens.length; start++) {
    let matched = true;
    for (let i = 0; i < phrase.length; i++) {
      if (!matches(phrase[i], tokens[start + i])) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }

  return false;
};

const containsFuzzyPhrase = (tokens: string[], phrase: string[]): boolean =>
  containsPhraseBy(tokens, phrase, tokensMatch);

/**
 * Loose match of a phrase, scored by how much of it was read cleanly. A
 * mangled word on its own ("TIRABAITO") is a guess to check; the same word
 * next to a cleanly read companion ("NASA TIRABAITO") is as good as a fuzzy
 * hit, because the companion confirms the phrase.
 */
const scoreLoosePhrase = (tokens: string[], phrase: string[]): number => {
  if (phrase.length > tokens.length) return 0;

  let best = 0;
  for (let start = 0; start + phrase.length <= tokens.length; start++) {
    let clean = 0;
    let matched = true;
    for (let i = 0; i < phrase.length; i++) {
      const actual = tokens[start + i];
      if (tokensMatch(phrase[i], actual)) {
        clean += 1;
      } else if (!tokensMatchLoosely(phrase[i], actual)) {
        matched = false;
        break;
      }
    }
    if (matched) {
      best = Math.max(best, clean > 0 ? SCORE_FUZZY : SCORE_LOOSE);
    }
  }

  return best;
};

const scoreKeyword = (
  tokens: string[],
  joined: string,
  keyword: PreparedKeyword
): number => {
  if (containsPhrase(tokens, keyword.tokens)) return SCORE_EXACT;

  // Handwriting often runs words together ("NAGWAWALANGBAHALA") or the
  // recognizer splits one ("NAG WAWALANG"). Comparing with spaces removed
  // catches both, but only for phrases long enough not to appear by accident.
  if (keyword.joined.length >= 5 && joined.includes(keyword.joined)) {
    return SCORE_CONTAINED;
  }

  if (containsFuzzyPhrase(tokens, keyword.tokens)) return SCORE_FUZZY;

  return scoreLoosePhrase(tokens, keyword.tokens);
};

/** Words that negate a form reference: "walang R1-07" is not "may R1-07". */
const NEGATIONS = new Set(["WALANG", "WALA", "WITHOUT", "HINDI", "DI"]);

/**
 * "Nasa <place>" means the member is somewhere else (I) -- unless the place
 * is one the other codes already speak for: work (B), the hospital (D), a
 * lokal (R1-07), or simply home.
 */
const NOT_A_PLACE_AWAY = new Set([
  "BAHAY",
  "TRABAHO",
  "WORK",
  "DUTY",
  "OSPITAL",
  "HOSPITAL",
  "LOKAL",
  "LOCAL",
  "KAPILYA",
  "SIMBAHAN",
]);

/**
 * Rules that no keyword list can express.
 *
 * - "Lokal ng Madrigal", "nakasamba sa lokal ng Makati": a lokal named after
 *   the word LOKAL means the member worshipped there, which is an R1-07 --
 *   even though "nakasamba sa lokal" on its own is M. (The "ng" is a filler
 *   and has already been dropped.) "Wala sa lokal" has nothing after LOKAL
 *   and is left to the J keyword. The match covers the whole phrase up to
 *   the name so it outranks any shorter keyword inside it.
 * - A negated R1-07 ("walang R1-07") must not count as having one.
 */
const scoreRules = (tokens: string[], noKeywordMatched: boolean): CodeCandidate[] => {
  const candidates: CodeCandidate[] = [];

  const lokal = tokens.findIndex((token) => token === "LOKAL" || token === "LOCAL");
  const named = lokal >= 0 ? tokens[lokal + 1] : undefined;
  if (named && named.length >= 3 && !NEGATIONS.has(named)) {
    candidates.push({
      key: "r107",
      score: SCORE_EXACT,
      matched: tokens.slice(0, lokal + 2).join(" ").toLowerCase(),
    });
  }

  // "Nasa Pasig", "nasa Japan", "nasa Cavite": away somewhere (I). Only when
  // no keyword recognized the reading -- a place the codes speak for
  // (trabaho, ospital, even misread as "trabajo") keeps its own code.
  const nasa = tokens.findIndex((token) => token === "NASA");
  const place = nasa >= 0 ? tokens[nasa + 1] : undefined;
  if (noKeywordMatched && place && place.length >= 3 && !NOT_A_PLACE_AWAY.has(place)) {
    candidates.push({
      key: "i",
      score: SCORE_CONTAINED,
      matched: `nasa ${place.toLowerCase()}`,
    });
  }

  return candidates;
};

const isNegatedFormCode = (tokens: string[], keyword: PreparedKeyword): boolean =>
  /^R10[67]$/.test(keyword.joined) &&
  tokens.some(
    (token, i) => token === keyword.joined && NEGATIONS.has(tokens[i - 1])
  );

const rankCandidates = (candidates: CodeCandidate[]): CodeCandidate[] => {
  // One entry per code: its best score, and the longest keyword at that score.
  const best = new Map<keyof Percent.Codes, CodeCandidate>();

  candidates.forEach((candidate) => {
    const current = best.get(candidate.key);
    if (
      !current ||
      candidate.score > current.score ||
      (candidate.score === current.score &&
        candidate.matched.length > current.matched.length)
    ) {
      best.set(candidate.key, candidate);
    }
  });

  return Array.from(best.values()).sort(
    (a, b) => b.score - a.score || b.matched.length - a.matched.length
  );
};

/**
 * Classifies one reading of a handwritten reason.
 *
 * Learned aliases (a Kalihim's earlier corrections) take precedence over the
 * keyword list, since they capture how *this* Kalihim writes a reason.
 */
export const classifyReasonText = (
  text: string,
  aliases: ReasonAliases = {}
): CodeSuggestion => {
  const normalized = normalizeText(text);

  if (!normalized) {
    return { key: null, score: 0, candidates: [], fromAlias: false };
  }

  const alias = aliases[normalized];
  if (alias) {
    const candidate: CodeCandidate = {
      key: alias,
      score: SCORE_EXACT,
      matched: normalized,
    };
    return {
      key: alias,
      score: SCORE_EXACT,
      candidates: [candidate],
      fromAlias: true,
      reading: text,
    };
  }

  const tokens = normalized.split(" ");
  const joined = tokens.join("");

  const fromKeywords = PREPARED_KEYWORDS.flatMap((keyword) => {
    if (isNegatedFormCode(tokens, keyword)) return [];
    const score = scoreKeyword(tokens, joined, keyword);
    return score > 0
      ? [{ key: keyword.key, score, matched: keyword.original }]
      : [];
  });

  const candidates = rankCandidates([
    ...scoreRules(tokens, fromKeywords.length === 0),
    ...fromKeywords,
  ]);

  const top = candidates[0];
  const accepted = top && top.score >= SUGGESTION_THRESHOLD;

  return {
    key: accepted ? top.key : null,
    score: top?.score ?? 0,
    candidates,
    fromAlias: false,
    reading: text,
  };
};

/**
 * Classifies a reason from every reading the recognizer offered for it and
 * keeps the best-supported code. An alternative reading that hits a keyword
 * exactly beats a top reading that only matches fuzzily.
 */
export const classifyReason = (
  readings: string[],
  aliases: ReasonAliases = {}
): CodeSuggestion => {
  let best: CodeSuggestion = {
    key: null,
    score: 0,
    candidates: [],
    fromAlias: false,
  };

  readings.forEach((reading) => {
    const suggestion = classifyReasonText(reading, aliases);
    if (
      suggestion.score > best.score ||
      (suggestion.fromAlias && !best.fromAlias && suggestion.key)
    ) {
      best = suggestion;
    }
  });

  return best;
};
