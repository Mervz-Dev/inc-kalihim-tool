import { classifyReason, classifyReasonText } from "../reason-classifier";

describe("classifyReasonText", () => {
  // The exact strings on the sample sheet.
  it.each([
    ["UWP PO", "g"],
    ["NAGWAWALANG BAHALA PO", "n"],
    ["NASA TRABAHO PO", "b"],
    ["uwp po", "g"],
  ])("classifies %p as %p", (text, key) => {
    expect(classifyReasonText(text).key).toBe(key);
  });

  it("gives no code for a blank reason", () => {
    expect(classifyReasonText("").key).toBeNull();
    expect(classifyReasonText("   ").key).toBeNull();
    expect(classifyReasonText("po").key).toBeNull();
  });

  // Typical recognizer misreads of the same handwriting.
  it.each([
    ["UWP P0", "g"],
    ["NAG WAWALANG BAHALA", "n"],
    ["NAGWAWALANGBAHALA", "n"],
    ["NASA TRABAJO", "b"],
    ["nasa trabah0 po", "b"],
    ["R1 07", "r107"],
    ["R107", "r107"],
    ["R1-06", "i"],
    ["may sak1t", "d"],
  ])("tolerates the misread %p as %p", (text, key) => {
    expect(classifyReasonText(text).key).toBe(key);
  });

  it("reads cursive UWP however the recognizer spells it", () => {
    ["uap po", "UVP", "unp po", "UWPPO", "uappo"].forEach((text) => {
      expect(classifyReasonText(text).key).toBe("g");
      expect(classifyReasonText(text).score).toBe(1);
    });
  });

  it("offers a long word mangled by extra strokes as a guess to check", () => {
    const alone = classifyReasonText("TIRABAITO");
    expect(alone.key).toBe("b");
    expect(alone.score).toBe(0.7);
  });

  it("trusts a mangled word when its companion word was read cleanly", () => {
    // Read off the user's photo: "NASA TIRABAITO PO" for "NASA TRABAHO PO".
    const suggestion = classifyReasonText("NASA TIRABAITO PO");
    expect(suggestion.key).toBe("b");
    expect(suggestion.score).toBe(0.8);
  });

  it("does not let a misread short abbreviation match", () => {
    // One wrong letter in a 2–3 letter code is a different code, not a typo.
    expect(classifyReasonText("UWO").key).toBeNull();
    expect(classifyReasonText("TX").key).toBeNull();
  });

  it("prefers the longer, more specific phrase", () => {
    expect(classifyReasonText("may sakit").key).toBe("d");
    expect(classifyReasonText("madalang sumamba").key).toBe("n");
  });

  it("still suggests C and M (the card just does not count them)", () => {
    expect(classifyReasonText("pamalagiang may sakit").key).toBe("c");
    expect(classifyReasonText("sumamba").key).toBe("m");
    expect(classifyReasonText("tumupad").key).toBe("m");
    expect(classifyReasonText("nakasamba sa lokal").key).toBe("m");
  });

  it("does not count a negated R1-07 as having one", () => {
    expect(classifyReasonText("without R1-07").key).toBe("m");
    expect(classifyReasonText("walang R1-07").key).toBe("m");
    expect(classifyReasonText("may R1-07").key).toBe("r107");
  });

  it("never confuses R1-06 with R1-07", () => {
    expect(classifyReasonText("R1-06").key).toBe("i");
    expect(classifyReasonText("R1-07").key).toBe("r107");
    const suggestion = classifyReasonText("R1-07");
    expect(suggestion.candidates.map((c) => c.key)).not.toContain("i");
  });

  it("codes worship in another lokal as R1-07", () => {
    [
      "nakasamba sa ibang lokal",
      "sumamba sa ibang lokal po",
      "Lokal ng Madrigal",
      "nasa lokal ng Makati po",
      "nakasamba sa lokal ng Almanza",
    ].forEach((text) => {
      expect(classifyReasonText(text).key).toBe("r107");
    });
  });

  it("keeps I and J apart, and J apart from R1-07", () => {
    expect(classifyReasonText("wala sa lokal").key).toBe("j");
    expect(classifyReasonText("wala sa lokal po").key).toBe("j");
    expect(classifyReasonText("nasa ibang lugar").key).toBe("i");
    expect(classifyReasonText("abroad po").key).toBe("i");
  });

  it("ranks alternatives for the review picker", () => {
    const suggestion = classifyReasonText("nasa trabaho po");
    expect(suggestion.candidates[0].key).toBe("b");
    expect(suggestion.score).toBe(1);
  });

  it("uses a learned alias before the keyword list", () => {
    const aliases = { "WALA DITO": "g" as const };
    const suggestion = classifyReasonText("wala dito po", aliases);
    expect(suggestion.key).toBe("g");
    expect(suggestion.fromAlias).toBe(true);
    expect(classifyReasonText("wala dito po").key).toBeNull();
  });
});

describe("classifyReason", () => {
  it("takes the best-supported reading across candidates", () => {
    // Top reading is garbage; the second reading is exact.
    expect(classifyReason(["UWO PO", "UWP PO"]).key).toBe("g");
  });

  it("prefers an exact reading over a fuzzy one", () => {
    const suggestion = classifyReason(["NASA TRABAJO", "NASA TRABAHO"]);
    expect(suggestion.key).toBe("b");
    expect(suggestion.score).toBe(1);
  });

  it("returns nothing when no reading is recognizable", () => {
    expect(classifyReason(["~~", "..."]).key).toBeNull();
  });
});
