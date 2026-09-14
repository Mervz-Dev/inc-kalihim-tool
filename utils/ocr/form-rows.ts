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

/**
 * The sheets carry a diagonal watermark ("16381103-2651587") printed across
 * the table. The recognizer reads it wherever it crosses a cell; a word made
 * of four or more digits and nothing else is never a name, a reason or a row
 * number, so it is dropped before any geometry is looked at.
 */
const isWatermarkWord = (text: string): boolean =>
  /^[\d\s-]+$/.test(text) && (text.match(/\d/g) || []).length >= 4;

const flattenWords = (lines: OcrLine[]): PositionedWord[] =>
  lines.flatMap((line, lineIndex) =>
    line.words
      .filter((word) => !isWatermarkWord(word.text))
      .map((word) => {
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

  // Rows are anchored in the name column, so the cut-off below the header
  // comes from the Pangalan word alone: on a slightly tilted photo the
  // Dahilan word can sit lower than the first name, and taking the lower of
  // the two would swallow row 1. The header line's own words are excluded
  // separately (see buildRows).
  const headerBottom = pangalan.box.y + pangalan.box.height;
  const headerLine = {
    fromX: pangalan.centerX,
    fromY: pangalan.centerY,
    toX: dahilan.centerX,
    toY: dahilan.centerY,
    height: Math.max(pangalan.box.height, dahilan.box.height),
  };

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

  return { reasonLeft, reasonRight, headerBottom, headerLine, fromHeaders: true };
};

/**
 * Words on the header line itself ("Blg", "Dahilan", "Lagda", "Code"). The
 * line is followed at its own slope, so on a tilted photo a heading that sags
 * to the height of the first name is still a heading, and the name is not.
 */
const isHeaderLineWord = (word: PositionedWord, layout: FormLayout): boolean => {
  const line = layout.headerLine;
  if (!line) return false;

  const slope = line.toX === line.fromX ? 0 : (line.toY - line.fromY) / (line.toX - line.fromX);
  const headerYAt = line.fromY + slope * (word.centerX - line.fromX);
  return Math.abs(word.centerY - headerYAt) < line.height;
};

/** "1", "2.", "12" -- a row number, wherever the Blg column happens to sit. */
const isRowNumberText = (text: string): boolean =>
  /^\d{1,2}$/.test(normalizeText(text));

/**
 * A row number is a one- or two-digit word anywhere left of the reason
 * column: names never contain numbers, and the Blg column's position on the
 * photo depends on how the sheet was framed.
 */
const isBlgNumber = (word: PositionedWord, layout: FormLayout): boolean =>
  word.centerX < layout.reasonLeft &&
  word.centerY > layout.headerBottom &&
  isRowNumberText(word.text);

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

  // Printed text above the first row (a sheet title when the header was not
  // recognized) is handled by the numbering below: it comes out as row 0 or
  // less and is dropped. Nothing is trimmed by distance from the first Blg
  // number that happened to be read -- when "1." and "2." are missed and "3."
  // is not, rows 1 and 2 are still members.

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

/** A reason line's centre this close to a row boundary is ambiguous. */
const BOUNDARY_TOLERANCE = 0.25;

/** Two lines closer than this fraction of a line's height are one block. */
const ATTACHED_GAP = 0.5;

/**
 * Printed multi-line cell text (the "Dumalo sa <lokal>…" note) is centred on
 * its row, which puts its first line right on the boundary with the row
 * above, where the nearest-row rule hands it to the wrong member. A line
 * whose centre sits on a boundary and which is vertically attached to a line
 * on the other side follows that line. Handwriting sits at row centre, so it
 * is never a candidate.
 *
 * Returns, per observation index, the band the whole line moves to.
 */
const attachBoundaryLines = (
  reasonWords: PositionedWord[],
  bands: RowBand[],
  bandIndexAt: (y: number) => number
): Map<number, number> => {
  const overrides = new Map<number, number>();
  if (bands.length < 2) return overrides;

  const pitch = lowerMedian(bands.map((band) => band.bottom - band.top));

  interface ReasonLine {
    lineIndex: number;
    top: number;
    bottom: number;
    centerY: number;
    height: number;
    band: number;
  }

  const byLine = new Map<number, PositionedWord[]>();
  reasonWords.forEach((word) => {
    const line = byLine.get(word.lineIndex) ?? [];
    line.push(word);
    byLine.set(word.lineIndex, line);
  });

  const lines: ReasonLine[] = Array.from(byLine.entries()).map(([lineIndex, line]) => {
    const top = Math.min(...line.map((word) => word.box.y));
    const bottom = Math.max(...line.map((word) => word.box.y + word.box.height));
    const centerY = (top + bottom) / 2;
    return { lineIndex, top, bottom, centerY, height: bottom - top, band: bandIndexAt(centerY) };
  });

  lines.forEach((line) => {
    if (line.band < 0) return;
    const band = bands[line.band];
    const nearTop = line.centerY - band.top <= BOUNDARY_TOLERANCE * pitch && line.band > 0;
    const nearBottom = band.bottom - line.centerY <= BOUNDARY_TOLERANCE * pitch && line.band < bands.length - 1;
    if (!nearTop && !nearBottom) return;

    const gapTo = (other: ReasonLine) =>
      other.centerY < line.centerY ? line.top - other.bottom : other.top - line.bottom;
    const isAttached = (other: ReasonLine) =>
      other.lineIndex !== line.lineIndex &&
      gapTo(other) <= ATTACHED_GAP * Math.max(line.height, other.height);

    // A wrapped handwritten reason ("NAGWAWALANG" / "BAHALA PO") can also
    // brush the next row's writing; it stays with the line of its own row.
    if (lines.some((other) => other.band === line.band && isAttached(other))) return;

    const neighbourBand = nearTop ? line.band - 1 : line.band + 1;
    if (lines.some((other) => other.band === neighbourBand && isAttached(other))) {
      overrides.set(line.lineIndex, neighbourBand);
    }
  });

  return overrides;
};

export interface BuildRowsResult {
  rows: ScannedRow[];
  layout: FormLayout;
}

export const buildRows = (result: OcrResult): BuildRowsResult => {
  const allWords = flattenWords(result.lines);
  const layout = detectLayout(allWords);
  const words = allWords.filter((word) => !isHeaderLineWord(word, layout));

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
  // "DE" in "DE LEON" is two letters at the left edge and must survive; a
  // misread number ("l.", "1") has at most one letter.
  const isBlgStrip = (word: PositionedWord) =>
    blgWords.has(word) ||
    word.centerX <= blgRight ||
    (word.centerX <= BLG_MAX_X &&
      letterCount(word.text) <= 1 &&
      letterCount(word.text) + (word.text.match(/\d/g) || []).length <= 2);

  const isReasonWord = (word: PositionedWord) =>
    word.centerX >= layout.reasonLeft && word.centerX <= layout.reasonRight;
  const bandIndexAt = (y: number) =>
    bands.findIndex((band) => y >= band.top && y < band.bottom);
  const reasonBandOverride = attachBoundaryLines(
    words.filter((word) => !isBlgStrip(word) && isReasonWord(word)),
    bands,
    bandIndexAt
  );
  const reasonBandOf = (word: PositionedWord) =>
    reasonBandOverride.get(word.lineIndex) ?? bandIndexAt(word.centerY);

  const rows = bands.map((band, bandIndex) => {
    const cell: OcrBox = {
      x: layout.reasonLeft,
      y: band.top,
      width: layout.reasonRight - layout.reasonLeft,
      height: band.bottom - band.top,
    };

    // A row number that slipped past the anchor step (read as part of the
    // name line, for instance) must not become part of the name either.
    const nameWords = words.filter(
      (word) =>
        !isBlgStrip(word) &&
        word.centerX < layout.reasonLeft &&
        !isRowNumberText(word.text) &&
        bandIndexAt(word.centerY) === bandIndex
    );
    const reasonWords = words.filter(
      (word) =>
        !isBlgStrip(word) &&
        isReasonWord(word) &&
        reasonBandOf(word) === bandIndex
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
