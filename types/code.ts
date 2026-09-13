import { Percent } from "@/types/percent";

export interface CodeReason {
  code: string;
  reason: string;
}

/**
 * One attendance code with everything the app knows about it: the letter shown
 * to the Kalihim, the key used in the percent data, the official description,
 * and the words a Kalihim actually writes on the sheet for it.
 */
export interface CodeDefinition extends CodeReason {
  key: keyof Percent.Codes;
  keywords: string[];
}
