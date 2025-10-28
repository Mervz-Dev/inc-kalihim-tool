import { Percent } from "@/types/percent";

export const CODES: (keyof Percent.Codes)[] = [
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
  "r107",
  "n",
] as const;

export const ALPHABET_CODES = CODES.filter((code) => code !== "r107");

export const ALL_SESSION_CODES: (keyof Percent.Session)[] = [
  ...ALPHABET_CODES,
  "totalCoded",
  "percent",
  "r107",
  "totalDalaw",
] as const;
