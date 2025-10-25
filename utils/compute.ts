import { Percent } from "@/types/percent";
import { roundDecimal } from "./number";

const SESSION_CODES: Percent.Session = {
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
  f: 0,
  g: 0,
  h: 0,
  i: 0,
  j: 0,
  k: 0,
  l: 0,
  m: 0,
  n: 0,
  r107: 0,
  totalDalaw: 0,
  totalCoded: 0,
  percent: 0,
  in: 0,
  out: 0,
};

export const computePercentage = (
  percentData: Percent.Percent
): Percent.ComputedPercent => {
  const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
  ];
  const result: Percent.ComputedPercent = {
    ...percentData,
    overAllPercentage: 0,
    newSNumber: [],

    firstSessionCodeTotal: { ...SESSION_CODES },
    secondSessionCodeTotal: { ...SESSION_CODES },
  };

  percentData.groupValues.forEach((group, idx) => {
    const sNumberCount = percentData.sNumber[idx]?.count || 1;

    // First Session
    const firstSession = group.firstSession;
    const firstTotal = letters.reduce(
      (sum, key) => sum + (firstSession[key as keyof Percent.Codes] || 0),
      0
    );
    const firstCoded = letters
      .filter((k) => k !== "m")
      .reduce(
        (sum, key) => sum + (firstSession[key as keyof Percent.Codes] || 0),
        0
      );
    const firstM = firstSession.m || 0;

    firstSession.totalDalaw = firstTotal;
    firstSession.totalCoded = firstCoded;
    firstSession.r107 = firstM;
    firstSession.percent = roundDecimal(firstCoded / sNumberCount) * 100;

    // Second Session
    const secondSession = group.secondSession;
    const secondTotal = letters.reduce(
      (sum, key) => sum + (secondSession[key as keyof Percent.Codes] || 0),
      0
    );
    const secondCoded = letters
      .filter((k) => k !== "m")
      .reduce(
        (sum, key) => sum + (secondSession[key as keyof Percent.Codes] || 0),
        0
      );
    const secondM = secondSession.m || 0;

    secondSession.totalDalaw = secondTotal;
    secondSession.totalCoded = secondCoded;
    secondSession.r107 = secondM;
    secondSession.percent = roundDecimal(secondCoded / sNumberCount) * 100;
  });

  // Calculate totals for each code
  percentData.groupValues.forEach((group) => {
    (
      Object.keys(result.firstSessionCodeTotal) as (keyof Percent.Codes)[]
    ).forEach((key) => {
      result.firstSessionCodeTotal[key] += group.firstSession[key];
      result.secondSessionCodeTotal[key] += group.secondSession[key];
    });
  });

  result.firstSessionCodeTotal.in = percentData.groupValues.reduce(
    (sum, item) => sum + (item.firstSession.in || 0),
    0
  );
  result.firstSessionCodeTotal.out = percentData.groupValues.reduce(
    (sum, item) => sum + (item.firstSession.out || 0),
    0
  );

  result.secondSessionCodeTotal.in = percentData.groupValues.reduce(
    (sum, item) => sum + (item.secondSession.in || 0),
    0
  );
  result.secondSessionCodeTotal.out = percentData.groupValues.reduce(
    (sum, item) => sum + (item.secondSession.out || 0),
    0
  );

  result.firstSessionCodeTotal.percent = roundDecimal(
    (result.firstSessionCodeTotal.percent || 0) / percentData.groupValues.length
  );
  result.secondSessionCodeTotal.percent = roundDecimal(
    (result.secondSessionCodeTotal.percent || 0) /
      percentData.groupValues.length
  );

  const firstPercent = result.firstSessionCodeTotal.percent || 0;
  const secondPercent = result.secondSessionCodeTotal.percent || 0;
  result.overAllPercentage = roundDecimal((firstPercent + secondPercent) / 2);

  const updatedSNumber = percentData.sNumber.map((s, index) => {
    const group = percentData.groupValues[index];
    const totalIn = group.firstSession.in + group.secondSession.in;
    const totalOut = group.firstSession.out + group.secondSession.out;
    const adjustedCount = s.count + totalIn - totalOut;
    return { ...s, count: adjustedCount };
  });

  result.newSNumber = updatedSNumber;

  return result;
};
