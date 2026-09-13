import { buildRows } from "../form-rows";
import { OcrBox, OcrLine, OcrResult } from "../types";

/**
 * Builds an OCR observation from "text @ x,y" words on one baseline. Geometry
 * mirrors the sample sheet: Blg numbers near x≈0.03, names from x≈0.05,
 * reasons from x≈0.37, tick boxes past x≈0.9, rows ≈0.036 apart.
 */
const line = (
  words: { text: string; x: number; width?: number }[],
  y: number,
  options: { confidence?: number; candidates?: string[]; height?: number } = {}
): OcrLine => {
  const height = options.height ?? 0.02;
  const positioned = words.map((word) => ({
    text: word.text,
    box: {
      x: word.x,
      y,
      width: word.width ?? 0.02 + word.text.length * 0.008,
      height,
    } as OcrBox,
  }));

  const left = Math.min(...positioned.map((word) => word.box.x));
  const right = Math.max(
    ...positioned.map((word) => word.box.x + word.box.width)
  );
  const text = positioned.map((word) => word.text).join(" ");

  return {
    text,
    confidence: options.confidence ?? 0.9,
    candidates: options.candidates ?? [text],
    box: { x: left, y, width: right - left, height },
    words: positioned,
  };
};

const header = line(
  [
    { text: "Blg", x: 0.02 },
    { text: "Pangalan", x: 0.17 },
    { text: "Dahilan", x: 0.55 },
    { text: "Huwebes", x: 0.9, width: 0.05 },
  ],
  0.25
);

/** The sample sheet, as Vision tends to read it: one observation per row. */
const sampleSheet: OcrResult = {
  imageWidth: 1200,
  imageHeight: 1600,
  lines: [
    line([{ text: "103", x: 0.03 }], 0.1),
    header,
    line([{ text: "1.", x: 0.03 }, { text: "BALITCHA,", x: 0.06 }, { text: "LORETO", x: 0.17 }], 0.3),
    line(
      [
        { text: "2.", x: 0.03 },
        { text: "ENRIQUEZ,", x: 0.06 },
        { text: "RHAIYEN", x: 0.18 },
        { text: "UWP", x: 0.38 },
        { text: "PO", x: 0.48 },
      ],
      0.336,
      { candidates: ["2. ENRIQUEZ, RHAIYEN UWP PO", "2. ENRIQUEZ, RHAIYEN UWO PO"] }
    ),
    line(
      [
        { text: "3.", x: 0.03 },
        { text: "ENRIQUEZ,", x: 0.06 },
        { text: "ROMUALDO", x: 0.18 },
        { text: "UWP", x: 0.38 },
        { text: "PO", x: 0.48 },
      ],
      0.372
    ),
    // A two-line handwritten reason: the second word wraps below the first.
    line([{ text: "4.", x: 0.03 }, { text: "MONEDERO,", x: 0.06 }, { text: "ANDREW", x: 0.19 }], 0.408),
    line([{ text: "NAGWAWALANG", x: 0.37 }], 0.404, { confidence: 0.6 }),
    line([{ text: "BAHALA", x: 0.37 }, { text: "PO", x: 0.5 }], 0.422, { confidence: 0.55 }),
    line(
      [
        { text: "5.", x: 0.03 },
        { text: "SANTILLAN,", x: 0.06 },
        { text: "JESMAR", x: 0.19 },
        { text: "NASA", x: 0.37 },
        { text: "TRABAHO", x: 0.45 },
        { text: "PO", x: 0.6 },
      ],
      0.444
    ),
    line(
      [
        { text: "6.", x: 0.03 },
        { text: "ENRIQUEZ,", x: 0.06 },
        { text: "MARY", x: 0.18 },
        { text: "LOREEN", x: 0.24 },
        { text: "UWP", x: 0.38 },
        { text: "PO", x: 0.48 },
        { text: "✓", x: 0.92, width: 0.01 },
      ],
      0.48
    ),
  ],
};

describe("buildRows", () => {
  const { rows, layout } = buildRows(sampleSheet);

  it("derives the column split from the printed headers", () => {
    expect(layout.fromHeaders).toBe(true);
    expect(layout.reasonLeft).toBeGreaterThan(0.2);
    expect(layout.reasonLeft).toBeLessThan(0.37);
    expect(layout.reasonRight).toBeLessThan(0.9);
  });

  it("finds one row per Blg number and ignores the sheet number", () => {
    expect(rows.map((row) => row.blg)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("separates the name from the reason on a merged observation", () => {
    const row = rows[1];
    expect(row.nameText).toBe("ENRIQUEZ, RHAIYEN");
    expect(row.reasonText).toBe("UWP PO");
  });

  it("keeps a row with no reason as blank", () => {
    expect(rows[0].nameText).toBe("BALITCHA, LORETO");
    expect(rows[0].reasonText).toBe("");
    expect(rows[0].reasonConfidence).toBe(1);
  });

  it("joins a reason that wrapped onto a second line", () => {
    const row = rows[3];
    expect(row.nameText).toBe("MONEDERO, ANDREW");
    expect(row.reasonText).toBe("NAGWAWALANG BAHALA PO");
    expect(row.reasonConfidence).toBeCloseTo(0.55);
  });

  it("drops tick marks in the columns after Dahilan", () => {
    expect(rows[5].reasonText).toBe("UWP PO");
  });

  it("offers the recognizer's alternative readings as candidates", () => {
    expect(rows[1].reasonCandidates).toContain("2. ENRIQUEZ, RHAIYEN UWO PO");
  });

  it("gives every row a reason cell spanning the Dahilan column", () => {
    rows.forEach((row) => {
      expect(row.reasonCell.width).toBeGreaterThan(0);
      expect(row.reasonCell.height).toBeGreaterThan(0);
    });
  });

  it("still finds every row when most Blg numbers were not read", () => {
    // The photo the user tested: Vision read only "2." and "4." of the tiny
    // row numbers, so rows must be anchored on the printed names too.
    const withoutNumbers: OcrResult = {
      ...sampleSheet,
      lines: sampleSheet.lines.map((l) => {
        const kept = l.words.filter(
          (word) => !/^\d\.$/.test(word.text) || ["2.", "4."].includes(word.text)
        );
        return { ...l, words: kept, text: kept.map((w) => w.text).join(" ") };
      }),
    };

    const result = buildRows(withoutNumbers);
    expect(result.rows.map((row) => row.blg)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.rows.map((row) => row.nameText)).toEqual([
      "BALITCHA, LORETO",
      "ENRIQUEZ, RHAIYEN",
      "ENRIQUEZ, ROMUALDO",
      "MONEDERO, ANDREW",
      "SANTILLAN, JESMAR",
      "ENRIQUEZ, MARY LOREEN",
    ]);
    expect(result.rows[4].reasonText).toBe("NASA TRABAHO PO");
    expect(result.rows[5].reasonText).toBe("UWP PO");
  });

  it("numbers the rows from the names alone when no Blg number was read", () => {
    const withoutNumbers: OcrResult = {
      ...sampleSheet,
      lines: sampleSheet.lines.map((l) => {
        const kept = l.words.filter((word) => !/^\d\.$/.test(word.text));
        return { ...l, words: kept, text: kept.map((w) => w.text).join(" ") };
      }),
    };

    const result = buildRows(withoutNumbers);
    expect(result.rows.map((row) => row.blg)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.rows[0].nameText).toBe("BALITCHA, LORETO");
  });

  it("does not let one misread Blg digit renumber the other rows", () => {
    const misread: OcrResult = {
      ...sampleSheet,
      lines: sampleSheet.lines.map((l) => ({
        ...l,
        words: l.words.map((w) => (w.text === "3." ? { ...w, text: "8." } : w)),
      })),
    };

    expect(buildRows(misread).rows.map((row) => row.blg)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("ignores the signatures in the footer far below the rows", () => {
    const withFooter: OcrResult = {
      ...sampleSheet,
      lines: [
        ...sampleSheet.lines,
        line([{ text: "Kalihim", x: 0.06 }, { text: "ng", x: 0.14 }, { text: "Grupo", x: 0.18 }], 0.95),
        line([{ text: "WALA", x: 0.7 }, { text: "PO", x: 0.8 }], 0.93),
      ],
    };

    expect(buildRows(withFooter).rows).toHaveLength(6);
  });

  it("falls back to fixed columns when the header is unreadable", () => {
    const withoutHeader = {
      ...sampleSheet,
      lines: sampleSheet.lines.filter((l) => l !== header),
    };
    const result = buildRows(withoutHeader);
    expect(result.layout.fromHeaders).toBe(false);
    expect(result.rows.map((row) => row.blg)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(result.rows[1].reasonText).toBe("UWP PO");
  });
});
