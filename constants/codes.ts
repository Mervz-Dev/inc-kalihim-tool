import { CodeDefinition } from "@/types/code";
import { Percent } from "@/types/percent";

/**
 * Single source of truth for the attendance codes.
 *
 * `reason` is the official description shown under the dashboard "Codes"
 * button. `keywords` are the phrases a Kalihim writes in the Dahilan column
 * for that code -- the official wording, its abbreviations, and the everyday
 * variants -- used to classify handwritten reasons read from a photographed
 * sheet. Matching is case-, accent- and punctuation-insensitive, and drops the
 * Tagalog filler words ("po", "sa", "na", …), so keep keywords to the words
 * that carry meaning. Longer phrases win over shorter ones when both match,
 * which is what keeps "pamalagiang may sakit" on C rather than D.
 *
 * Ordered as the R1-04 buttons are (see CODES in constants/percent.ts).
 */
export const CODE_DEFINITIONS: CodeDefinition[] = [
  {
    key: "a",
    code: "A",
    reason: "Kahirapan, walang salapi, walang pamasahe, walang pang-gugol.",
    keywords: [
      "kahirapan",
      "walang salapi",
      "walang pamasahe",
      "walang pang-gugol",
      "walang panggugol",
      "walang pera",
      "pamasahe",
      "salapi",
    ],
  },
  {
    key: "b",
    code: "B",
    reason: "Trabaho, duty or busy sa work, gipit sa oras dahil sa work.",
    keywords: [
      "trabaho",
      "nasa trabaho",
      "may trabaho",
      "nagtatrabaho",
      "nag trabaho",
      "work",
      "nasa work",
      "busy sa work",
      "duty",
      "may duty",
      "gipit sa oras",
      "overtime",
      "shift",
      "OT",
    ],
  },
  {
    key: "c",
    code: "C",
    reason: "Pamalagiang may sakit (PMS), bed ridden.",
    keywords: [
      "PMS",
      "pamalagiang may sakit",
      "pamalagiang",
      "bed ridden",
      "bedridden",
      "matagal ng may sakit",
    ],
  },
  {
    key: "d",
    code: "D",
    reason:
      "May sakit, nahihilo, masakit ang ulo, may sipon at inuubo, dinala sa hospital.",
    keywords: [
      "may sakit",
      "sakit",
      "masakit",
      "nahihilo",
      "masakit ang ulo",
      "sipon",
      "may sipon",
      "inuubo",
      "ubo",
      "hospital",
      "ospital",
      "dinala sa hospital",
      "lagnat",
      "nilalagnat",
      "may lagnat",
      "naconfine",
      "na confine",
      "may karamdaman",
      "nagkasakit",
      "nagkakasakit",
      "maysakit",
      "hindi makalakad",
      "di makalakad",
      "makalakad",
      "LBM",
      "nagtatae",
      "nagtae",
      "sumakit",
      "sumasakit",
      "naoperahan",
      "nakunan",
      "nanganak",
    ],
  },
  {
    key: "e",
    code: "E",
    reason: "Hinahadlangan, inuusig, ayaw pasambahin.",
    keywords: [
      "hinahadlangan",
      "hinadlangan",
      "inuusig",
      "ayaw pasambahin",
      "pinagbabawalan",
      "bawal",
    ],
  },
  {
    key: "f",
    code: "F",
    reason:
      "Iba’t ibang klaseng dahilan, nag-alaga ng bata, nag-bantay ng tindahan or bahay kaya di maka-alis.",
    keywords: [
      "iba't ibang klaseng dahilan",
      "ibang dahilan",
      "nag-alaga ng bata",
      "nag alaga",
      "nagaalaga",
      "alaga ng bata",
      "nag-bantay",
      "nagbantay",
      "bantay ng tindahan",
      "bantay ng bahay",
      "bantay sa bahay",
      "di maka-alis",
      "di makaalis",
      "hindi makaalis",
      "walang kasama sa bahay",
    ],
  },
  {
    key: "g",
    code: "G",
    reason:
      "UWP, di matagpuan, walang impormasyon, hindi maabutan sa bahay, umiiwas.",
    keywords: [
      "UWP",
      "di matagpuan",
      "hindi matagpuan",
      "walang impormasyon",
      "hindi maabutan",
      "di maabutan",
      "hindi maabutan sa bahay",
      "umiiwas",
      "nag-iwas",
      "iwas",
      "walang tao",
      "hindi nakita",
      "walang paalam",
      "umalis ng walang paalam",
      "hindi nag rereply",
      "hindi nagrereply",
      "di nagrereply",
      "hindi nag reply",
      "walang reply",
      "no reply",
      "hindi makausap",
      "di makausap",
      "hindi makontak",
      "di makontak",
      "ayaw sumagot",
      "hindi sumasagot",
      "di sumasagot",
      "walang sagot",
      "hindi nagbubukas",
      "ayaw magbukas",
      "di nakita",
    ],
  },
  {
    key: "h",
    code: "H",
    reason:
      "Hindi umabot sa oras ng pagsamba, napag-sarhan ng pintuan, nahuling dumating.",
    keywords: [
      "hindi umabot",
      "di umabot",
      "hindi umabot sa oras",
      "napag-sarhan",
      "napagsarhan",
      "nahuling dumating",
      "nahuli",
      "late",
      "nalate",
      "na late",
    ],
  },
  {
    key: "i",
    code: "I",
    reason: "R1-06, nasa ibang dako o lugar, nasa ibang bayan o abroad.",
    keywords: [
      "R1-06",
      "ibang dako",
      "ibang lugar",
      "nasa ibang lugar",
      "ibang bayan",
      "nasa ibang bayan",
      "abroad",
      "nasa abroad",
      "probinsya",
      "nasa probinsya",
      "umuwi sa probinsya",
      "nasa malayo",
      "ibang bansa",
      "nasa ibang bansa",
      "bansa",
      "umuwi",
      "lumipat",
      "nag-abroad",
      // "Nasa <place>" (Pasig, Japan, …) is handled by a rule in the
      // classifier, since the place can be anything.
    ],
  },
  {
    key: "j",
    code: "J",
    reason: "Wala sa lokal.",
    keywords: [
      "wala sa lokal",
      "wala sa local",
      // Being in another lokal is J; having worshipped there is R1-07.
      "nasa ibang lokal",
      "nasa ibang local",
      "ibang lokal",
      "ibang local",
    ],
  },
  {
    key: "k",
    code: "K",
    reason: "Kalamidad, binagyo, binaha, nasunugan.",
    keywords: [
      "kalamidad",
      "binagyo",
      "bagyo",
      "binaha",
      "baha",
      "nasunugan",
      "sunog",
      "lindol",
    ],
  },
  {
    key: "l",
    code: "L",
    reason: "Pag-aaral, may exam, busy sa school, OJT.",
    keywords: [
      "pag-aaral",
      "pagaaral",
      "nag-aaral",
      "nagaaral",
      "aral",
      "may exam",
      "exam",
      "busy sa school",
      "school",
      "eskwela",
      "may klase",
      "klase",
      "review",
      "thesis",
      "OJT",
    ],
  },
  {
    key: "m",
    code: "M",
    reason: "Sumamba, tumupad di nakapag taob ng tarheta, without R1-07.",
    keywords: [
      "sumamba",
      "nakasamba",
      "nagsamba",
      "nakasamba sa lokal",
      "tumupad",
      "di nakapag taob",
      "di nakapagtaob",
      "hindi nakapagtaob",
      "tarheta",
      "walang tarheta",
      "without R1-07",
      "walang R1-07",
      // Attended but did not register at the door.
      "hindi nakapag tap",
      "hindi nakapagtap",
      "di nakapag tap",
      "hindi naka tap",
      "hindi nag tap",
      "nakalimutan mag tap",
      "hindi nakapag QR",
      "hindi nakapagQR",
      "di nakapag QR",
      "hindi nag QR",
      "nakalimutan mag QR",
      "nakalimutang mag QR",
      "nakalimutan",
      "nalimutan",
      "walang QR",
      "pagsambang sambahayan",
      "pagsamba sambahayan",
      "sambahayan",
      "PSS",
      "HWS",
      "house worship",
      "house worshipped",
      "household worship",
    ],
  },
  {
    key: "r107",
    code: "R107",
    reason: "May R1-07.",
    // Worshipped in another lokal. "Lokal ng <name>" is handled by a rule in
    // the classifier, since the name can be any lokal.
    keywords: [
      "R1-07",
      "nakasamba sa ibang lokal",
      "sumamba sa ibang lokal",
      "nagsamba sa ibang lokal",
      "nakasamba sa ibang local",
      "sumamba sa ibang local",
      "nagsamba sa ibang local",
      // The printed "Dumalo sa <lokal>, <distrito> (date)" note.
      "dumalo sa",
      "dumalo",
    ],
  },
  {
    key: "n",
    code: "N",
    reason:
      "TS, madalang sumamba (MS), nag-wawalang bahala, tinamad, may ulat na, may pinuntahan.",
    keywords: [
      "TS",
      "MS",
      "madalang sumamba",
      "madalang",
      "nag-wawalang bahala",
      "nagwawalang bahala",
      "walang bahala",
      "nagwalang bahala",
      "tinamad",
      "tamad",
      "may ulat na",
      "may ulat",
      "naulat na",
      "naulat",
      "nakaulat",
      "nakaulat na",
      "may pinuntahan",
      "pinuntahan",
      "nagpabaya",
      "tigil samba",
      "tigil sumamba",
      "tumigil sa pagsamba",
      "tumigil",
      "ayaw na sa INC",
      "ayaw na sumamba",
      "ayaw na",
      "ayaw sumamba",
    ],
  },
];

/**
 * A member whose Dahilan cell was left blank could not be reached for a
 * reason, so the sheet counts them under G (walang impormasyon).
 */
export const BLANK_REASON_KEY: keyof Percent.Codes = "g";

/**
 * Codes a scan may recognize but never adds to the card. C (pamalagiang may
 * sakit) and M (sumamba / tumupad) are shown in the review for information
 * only; their counts are entered another way.
 */
export const SCAN_NOT_APPLIED_KEYS: ReadonlySet<keyof Percent.Codes> =
  new Set<keyof Percent.Codes>(["c", "m"]);

export const CODE_DEFINITION_BY_KEY: Record<
  keyof Percent.Codes,
  CodeDefinition
> = Object.fromEntries(
  CODE_DEFINITIONS.map((definition) => [definition.key, definition])
) as Record<keyof Percent.Codes, CodeDefinition>;
