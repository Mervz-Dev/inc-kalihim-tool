import { diceSimilarity, normalizeText } from "./normalize";
import {
  FormLayout,
  OcrBox,
  OcrLine,
  OcrResult,
  OcrWord,
  ScannedRow,
} from "./types";

/**
 * Rebuilds the rows of a photographed attendance sheet from OCR geometry.
 *
 * The sheet is a printed table: `Blg | Pangalan | Dahilan | ✓ | ✓`. The row
 * numbers and names are printed and read reliably; the reason is handwritten.
 * Rows are anchored on the printed Blg numbers rather than clustered by
 * height, so a reason that spills onto a second line, or a photo taken at a
 * slight angle, still lands on the right person.
 */

/** Where the columns sit when the header words cannot be found. */
const FALLBACK_LAYOUT: FormLayout = {
  reasonLeft: 0.35,
  reasonRight: 0.85,
  headerBottom: 0,
  fromHeaders: false,
};

/** Blg numbers live in the leftmost strip of the sheet. */
const BLG_MAX_X = 0.12;

/** Anything right of the Dahilan column is a tick box, never a reason. */
const REASON_RIGHT_MARGIN = 0.02;

interface PositionedWord extends OcrWord {
  lineIndex: number;
  centerX: number;
  centerY: number;
  confidence: number;
}

const center = (box: OcrBox) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const flattenWords = (lines: OcrLine[]): PositionedWord[] =>
  lines.flatMap((line, lineIndex) =>
    line.words.map((word) => {
      const { x, y } = center(word.box);
      return {
        ...word,
        lineIndex,
        centerX: x,
        centerY: y,
        confidence: line.confidence,
      };
    })
  );

const findHeaderWord = (
  words: PositionedWord[],
  header: string
): PositionedWord | undefined => {
  let best: PositionedWord | undefined;
  let bestScore = 0;

  words.forEach((word) => {
    const score = diceSimilarity(normalizeText(word.text), header);
    if (score > bestScore && score >= 0.8) {
      best = word;
      bestScore = score;
    }
  });

  return best;
};

/**
 * The boundary between the name and reason columns is the widest empty
 * vertical strip between the words on the data rows. Headings are centred
 * over their columns while the text in them is left-aligned, so the midpoint
 * between the two headings is not where the columns actually meet.
 */
const findColumnGap = (
  words: PositionedWord[],
  from: number,
  to: number,
  fallback: number
): number => {
  const centers = words
    .filter((word) => word.centerX >= from && word.centerX <= to)
    .map((word) => word.centerX)
    .sort((a, b) => a - b);

  if (centers.length < 2) return fallback;

  let bestGap = 0;
  let split = fallback;

  for (let i = 1; i < centers.length; i++) {
    const gap = centers[i] - centers[i - 1];
    if (gap > bestGap) {
      bestGap = gap;
      split = (centers[i] + centers[i - 1]) / 2;
    }
  }

  // A gap narrower than a word is just spacing, not a column boundary.
  return bestGap >= 0.04 ? split : fallback;
};

/** Derives the column split from the printed header row when it is legible. */
export const detectLayout = (words: PositionedWord[]): FormLayout => {
  const pangalan = findHeaderWord(words, "PANGALAN");
  const dahilan = findHeaderWord(words, "DAHILAN");

  if (!pangalan || !dahilan || dahilan.centerX <= pangalan.centerX) {
    const dataWords = words.filter((word) => word.centerX > BLG_MAX_X);
    return {
      ...FALLBACK_LAYOUT,
      reasonLeft: findColumnGap(
        dataWords,
        0.15,
        0.6,
        FALLBACK_LAYOUT.reasonLeft
      ),
    };
  }

  const headerBottom = Math.max(
    pangalan.box.y + pangalan.box.height,
    dahilan.box.y + dahilan.box.height
  );

  const dataWords = words.filter(
    (word) => word.centerY > headerBottom && word.centerX > BLG_MAX_X
  );
  const reasonLeft = findColumnGap(
    dataWords,
    pangalan.centerX,
    dahilan.centerX,
    (pangalan.centerX + dahilan.centerX) / 2
  );

  const nextHeading = words
    .filter(
      (word) =>
        word.centerX > dahilan.centerX + 0.1 &&
        Math.abs(word.centerY - dahilan.centerY) < dahilan.box.height
    )
    .sort((a, b) => a.centerX - b.centerX)[0];

  const reasonRight = nextHeading
    ? Math.max(reasonLeft + 0.1, nextHeading.box.x - REASON_RIGHT_MARGIN)
    : FALLBACK_LAYOUT.reasonRight;

  return { reasonLeft, reasonRight, headerBottom, fromHeaders: true };
};

const isBlgNumber = (word: PositionedWord, layout: FormLayout): boolean =>
  word.centerX <= BLG_MAX_X &&
  word.centerY > layout.headerBottom &&
  /^\d{1,2}$/.test(normalizeText(word.text));

const letterCount = (text: string): number =>
  (text.toUpperCase().match(/[A-Z]/g) || []).length;

/** A printed name in the Pangalan column: letters, left of the reason column. */
const isNameWord = (word: PositionedWord, layout: FormLayout): boolean =>
  word.centerY > layout.headerBottom &&
  word.centerX < layout.reasonLeft &&
  letterCount(word.text) >= 2 &&
  !isBlgNumber(word, layout);

/** Something that marks a row: a Blg number, or the name printed beside it. */
interface RowAnchor {
  centerY: number;
  height: number;
  /** The printed Blg number, when one was read on this row. */
  blg: number | null;
  blgWords: PositionedWord[];
}

/**
 * Collects every row marker. The Blg numbers are tiny and often skipped by the
 * recognizer, but the printed names next to them are almost never missed, so
 * both anchor rows: a name alone still yields a row, and a number confirms
 * which row it is.
 */
const collectAnchors = (
  words: PositionedWord[],
  layout: FormLayout
): RowAnchor[] => {
  const anchors: RowAnchor[] = words
    .filter((word) => isBlgNumber(word, layout))
    .map((word) => ({
      centerY: word.centerY,
      height: word.box.height,
      blg: Number(normalizeText(word.text)),
      blgWords: [word],
    }));

  const nameLines = new Map<number, PositionedWord[]>();
  words.forEach((word) => {
    if (!isNameWord(word, layout)) return;
    const line = nameLines.get(word.lineIndex) ?? [];
    line.push(word);
    nameLines.set(word.lineIndex, line);
  });

  nameLines.forEach((line) => {
    anchors.push({
      centerY: line.reduce((sum, word) => sum + word.centerY, 0) / line.length,
      height: Math.max(...line.map((word) => word.box.height)),
      blg: null,
      blgWords: [],
    });
  });

  return anchors.sort((a, b) => a.centerY - b.centerY);
};

/**
 * Merges anchors that sit on the same baseline (the number and the name of one
 * row, or two readings of the same word). Rows are more than a text height
 * apart; markers on one row are a fraction of it.
 */
const clusterAnchors = (anchors: RowAnchor[]): RowAnchor[] => {
  const clusters: (RowAnchor & { members: number })[] = [];

  anchors.forEach((anchor) => {
    const current = clusters[clusters.length - 1];
    const tolerance = 0.7 * Math.max(anchor.height, current?.height ?? 0);

    if (current && anchor.centerY - current.centerY <= tolerance) {
      current.centerY =
        (current.centerY * current.members + anchor.centerY) /
        (current.members + 1);
      current.members += 1;
      current.height = Math.max(current.height, anchor.height);
      current.blg = current.blg ?? anchor.blg;
      current.blgWords.push(...anchor.blgWords);
      return;
    }

    clusters.push({ ...anchor, blgWords: [...anchor.blgWords], members: 1 });
  });

  return clusters;
};

const lowerMedian = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) / 2)];

interface RowBand {
  blg: number;
  top: number;
  bottom: number;
  blgWords: PositionedWord[];
}

/**
 * Turns the row anchors into horizontal bands. Each band reaches halfway to
 * its neighbours, so every word is assigned to the nearest row.
 *
 * Rows are numbered consecutively; the Blg numbers that were read vote on
 * where the sequence starts, so one misread digit cannot shift the others and
 * a row whose number was skipped is still numbered correctly.
 */
const buildBands = (anchors: RowAnchor[], layout: FormLayout): RowBand[] => {
  let clusters = clusterAnchors(anchors);
  if (clusters.length === 0) return [];

  const pitch =
    clusters.length > 1
      ? lowerMedian(
          clusters.slice(1).map((cluster, i) => cluster.centerY - clusters[i].centerY)
        )
      : clusters[0].height * 2.5;

  // Printed text in the name column above the first numbered row (a sheet
  // title, the header when it was not recognized) is not a member.
  const firstNumbered = clusters.find((cluster) => cluster.blg !== null);
  if (firstNumbered) {
    clusters = clusters.filter(
      (cluster) => cluster.centerY >= firstNumbered.centerY - 1.5 * pitch
    );
  }

  // The rows are one block; anything far below it is the sheet's footer
  // (signatures, "Kalihim ng Grupo"), never a member.
  if (clusters.length >= 3) {
    const end = clusters.findIndex(
      (cluster, i) => i > 0 && cluster.centerY - clusters[i - 1].centerY > 3 * pitch
    );
    if (end > 0) clusters = clusters.slice(0, end);
  }

  const votes = new Map<number, number>();
  clusters.forEach((cluster, i) => {
    if (cluster.blg === null) return;
    const base = cluster.blg - i;
    votes.set(base, (votes.get(base) ?? 0) + 1);
  });
  let base = 1;
  let bestVotes = 0;
  votes.forEach((count, candidate) => {
    if (count > bestVotes) {
      base = candidate;
      bestVotes = count;
    }
  });

  return clusters
    .map((cluster, i) => {
      const previous = clusters[i - 1];
      const next = clusters[i + 1];

      return {
        blg: base + i,
        top: previous
          ? (previous.centerY + cluster.centerY) / 2
          : Math.max(layout.headerBottom, cluster.centerY - pitch / 2),
        bottom: next
          ? (cluster.centerY + next.centerY) / 2
          : cluster.centerY + pitch / 2,
        blgWords: cluster.blgWords,
      };
    })
    .filter((band) => band.blg >= 1);
};

const unionBox = (boxes: OcrBox[], fallback: OcrBox): OcrBox => {
  if (boxes.length === 0) return fallback;

  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));

  return { x: left, y: top, width: right - left, height: bottom - top };
};

/** Reading order: line by line, left to right. */
const joinWords = (words: PositionedWord[]): string =>
  [...words]
    .sort((a, b) => a.lineIndex - b.lineIndex || a.centerX - b.centerX)
    .map((word) => word.text)
    .join(" ")
    .trim();

export interface BuildRowsResult {
  rows: ScannedRow[];
  layout: FormLayout;
}

export const buildRows = (result: OcrResult): BuildRowsResult => {
  const words = flattenWords(result.lines);
  const layout = detectLayout(words);

  const bands = buildBands(collectAnchors(words, layout), layout);
  const blgWords = new Set(bands.flatMap((band) => band.blgWords));

  // Names start right after the Blg numbers, so only the strip the numbers
  // themselves occupy is excluded -- not a fixed slice of the sheet. A number
  // misread as a letter or two ("l.") is dropped by its size and position.
  const blgRight = blgWords.size
    ? Math.max(
        ...Array.from(blgWords).map((word) => word.box.x + word.box.width)
      )
    : 0;
  const isBlgStrip = (word: PositionedWord) =>
    blgWords.has(word) ||
    word.centerX <= blgRight ||
    (word.centerX <= BLG_MAX_X && letterCount(word.text) + (word.text.match(/\d/g) || []).length <= 2);

  const rows = bands.map((band) => {
    const cell: OcrBox = {
      x: layout.reasonLeft,
      y: band.top,
      width: layout.reasonRight - layout.reasonLeft,
      height: band.bottom - band.top,
    };

    const inBand = words.filter(
      (word) =>
        !isBlgStrip(word) &&
        word.centerY >= band.top &&
        word.centerY < band.bottom
    );

    const nameWords = inBand.filter((word) => word.centerX < layout.reasonLeft);
    const reasonWords = inBand.filter(
      (word) =>
        word.centerX >= layout.reasonLeft && word.centerX <= layout.reasonRight
    );

    // Alternative readings come from the lines the reason words belong to.
    // On a merged "NAME REASON" observation those still contain the name, so
    // the classifier's filler/keyword matching has to cope with extra tokens.
    const reasonLineIndexes = Array.from(
      new Set(reasonWords.map((word) => word.lineIndex))
    );
    const reasonText = joinWords(reasonWords);
    const reasonCandidates = Array.from(
      new Set([
        reasonText,
        ...reasonLineIndexes.flatMap((index) => result.lines[index].candidates),
      ])
    ).filter(Boolean);

    return {
      blg: band.blg,
      nameText: joinWords(nameWords),
      reasonText,
      reasonCandidates,
      reasonConfidence:
        reasonWords.length > 0
          ? Math.min(...reasonWords.map((word) => word.confidence))
          : 1,
      reasonCell: cell,
      reasonBox:
        reasonWords.length > 0
          ? unionBox(
              reasonWords.map((word) => word.box),
              cell
            )
          : null,
    };
  });

  return { rows, layout };
};
