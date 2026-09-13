import {
  BLANK_REASON_KEY,
  CODE_DEFINITIONS,
  SCAN_NOT_APPLIED_KEYS,
} from "@/constants/codes";
import {
  isDocumentScannerSupported,
  isHandwritingOcrSupported,
  recognizeCells,
  recognizeText,
  scanDocument,
} from "@/modules/handwriting-ocr";
import { getUsersByPurokGrupo } from "@/services/sql-lite/db";
import { Percent } from "@/types/percent";
import { User } from "@/types/user";
import { useLoading } from "@/utils/hooks/useLoading";
import { buildRows } from "@/utils/ocr/form-rows";
import { matchName } from "@/utils/ocr/name-matcher";
import { normalizeText } from "@/utils/ocr/normalize";
import {
  CONFIDENT_THRESHOLD,
  classifyReason,
} from "@/utils/ocr/reason-classifier";
import { CodeSuggestion, ReasonAliases, ScannedRow } from "@/utils/ocr/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import type { CodeCounts } from "../../usePercentGenerator";

/** Reason phrases this Kalihim has corrected before, keyed by normalized text. */
const ALIASES_KEY = "@ocr-aliases";

/** Below this the recognizer itself was unsure; the row is flagged. */
const LOW_CONFIDENCE = 0.5;

/** Every keyword token, so the corrector can snap strokes to our vocabulary. */
export const CUSTOM_WORDS = Array.from(
  new Set(
    CODE_DEFINITIONS.flatMap((definition) =>
      definition.keywords.flatMap((keyword) =>
        keyword.toUpperCase().split(/[\s-]+/)
      )
    )
  )
).filter((word) => word.length >= 2);

export interface ReviewRow {
  blg: number;
  nameText: string;
  /** The member record the name was matched to, if any. */
  matchedName: string | null;
  /** The reading shown to the Kalihim: the one the code came from. */
  reasonText: string;
  /** The keyword the reading was taken as, when that is not obvious from it. */
  understoodAs: string | null;
  suggestion: CodeSuggestion;
  /** The code that will be applied; editable in the review. */
  key: keyof Percent.Codes | null;
  /** Nothing was written in the Dahilan cell; counted as G by convention. */
  blankReason: boolean;
  /** Something about this row deserves a look before applying. */
  needsAttention: boolean;
  lowConfidence: boolean;
}

export interface ReviewState {
  groupIndex: number;
  group: number;
  sessionKey: Percent.SessionKey;
  includeOtherSession: boolean;
  rows: ReviewRow[];
}

const SESSION_LABEL: Record<Percent.SessionKey, string> = {
  firstSession: "Huwebes",
  secondSession: "Linggo",
};

export const otherSession = (key: Percent.SessionKey): Percent.SessionKey =>
  key === "firstSession" ? "secondSession" : "firstSession";

export const sessionLabel = (key: Percent.SessionKey) => SESSION_LABEL[key];

/** Whether a reviewed row's code goes onto the card when applied. */
export const isApplied = (key: keyof Percent.Codes | null): key is keyof Percent.Codes =>
  key !== null && !SCAN_NOT_APPLIED_KEYS.has(key);

const loadAliases = async (): Promise<ReasonAliases> => {
  try {
    const raw = await AsyncStorage.getItem(ALIASES_KEY);
    return raw ? (JSON.parse(raw) as ReasonAliases) : {};
  } catch {
    return {};
  }
};

const saveAliases = async (aliases: ReasonAliases) => {
  try {
    await AsyncStorage.setItem(ALIASES_KEY, JSON.stringify(aliases));
  } catch (error) {
    console.log("saveAliases error:", error);
  }
};

interface PickedImage {
  uri: string;
  /**
   * A file in the app's own cache made for this scan (the scanner's page, or
   * the picker's copy of a photo). It is deleted as soon as the sheet has been
   * read. The user's Photos library is never written to or deleted from.
   */
  temporary: boolean;
}

const pickImage = (): Promise<PickedImage | null> =>
  new Promise((resolve) => {
    const fromCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Camera not allowed",
          text2: "Allow camera access in Settings to photograph a sheet.",
        });
        resolve(null);
        return;
      }

      // The system document scanner finds the sheet, captures when it is
      // steady and in focus, and flattens and cleans the page -- the best
      // photo we can get, with no processing of our own. Plain camera where
      // it is not available (Simulator).
      if (isDocumentScannerSupported) {
        try {
          const uri = await scanDocument();
          resolve(uri ? { uri, temporary: true } : null);
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Scanner failed",
            text2:
              error instanceof Error ? error.message : "Could not open the scanner.",
          });
          resolve(null);
        }
        return;
      }

      // The picker hands back its own copy of the photo (not saved to the
      // Photos library), which we delete after reading it.
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
        exif: false,
      });
      resolve(
        result.canceled ? null : { uri: result.assets[0].uri, temporary: true }
      );
    };

    const fromLibrary = async () => {
      // The picker copies the chosen photo into the app's cache; the original
      // in the library is untouched, so the copy can go once it is read.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        allowsEditing: false,
        exif: false,
        selectionLimit: 1,
      });
      resolve(
        result.canceled ? null : { uri: result.assets[0].uri, temporary: true }
      );
    };

    Alert.alert(
      "Scan attendance sheet",
      isDocumentScannerSupported
        ? "Point the camera at the sheet; it captures on its own when the page is steady and in focus."
        : "Lay the sheet flat, fill the frame, and avoid shadows.",
      [
        { text: "Scan with camera", onPress: () => void fromCamera() },
        { text: "Choose from library", onPress: () => void fromLibrary() },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });

/**
 * Reads every handwritten reason again, on its own cell, three ways: raw
 * strokes, the corrector pointed at our vocabulary, and the same on a
 * contrast-enhanced copy for faint pen on a dim photo. Every reading and
 * alternative becomes a candidate for the classifier, which keeps the best.
 */
export const readReasonCells = async (
  uri: string,
  rows: ScannedRow[]
): Promise<string[][]> => {
  const cells = rows.map((row) => row.reasonCell);
  if (cells.length === 0) return [];

  const passes = await Promise.all([
    recognizeCells(uri, cells, { languageCorrection: false }),
    recognizeCells(uri, cells, {
      languageCorrection: true,
      customWords: CUSTOM_WORDS,
    }),
    recognizeCells(uri, cells, {
      languageCorrection: true,
      customWords: CUSTOM_WORDS,
      enhance: true,
    }),
  ]);

  return rows.map((row, i) => {
    const cellLines = passes.map((pass) => pass[i]?.lines ?? []);

    const readings = cellLines
      .flat()
      .flatMap((line) => [line.text, ...line.candidates]);

    // A cell can hold two lines; a joined reading gives the classifier the
    // whole phrase, e.g. "NAGWAWALANG" + "BAHALA".
    const joined = cellLines.map((lines) =>
      lines.map((line) => line.text).join(" ")
    );

    return Array.from(
      new Set([...joined, ...readings, ...row.reasonCandidates])
    ).filter((reading) => reading.trim().length > 0);
  });
};

export const useScanForm = (
  purok: string,
  groupValues: Percent.GroupValues[],
  applyScannedCodes: (
    groupIndex: number,
    sessionKeys: Percent.SessionKey[],
    counts: CodeCounts
  ) => void
) => {
  const db = useSQLiteContext();
  const loader = useLoading();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [review, setReview] = useState<ReviewState | null>(null);
  const aliasesRef = useRef<ReasonAliases>({});

  const startScan = useCallback(
    async (groupIndex: number, sessionKey: Percent.SessionKey) => {
      const group = groupValues[groupIndex];
      if (!group) return;

      const picked = await pickImage();
      if (!picked) return;
      const { uri } = picked;

      try {
        loader.show("Reading the sheet…");

        const [full, aliases, members] = await Promise.all([
          recognizeText(uri),
          loadAliases(),
          Promise.all(
            (["male", "female"] as User.Gender[]).map((gender) =>
              getUsersByPurokGrupo(
                { purok, grupo: String(group.group), gender },
                db
              )
            )
          ).then((lists) => lists.flat()),
        ]);
        aliasesRef.current = aliases;

        const { rows } = buildRows(full);

        if (rows.length === 0) {
          Toast.show({
            type: "error",
            text1: "Couldn't read any rows",
            text2: "Make sure the whole table, with the printed names, is in the photo.",
            visibilityTime: 4000,
          });
          return;
        }

        loader.show("Reading the handwriting…");
        const readings = await readReasonCells(uri, rows);

        const reviewRows: ReviewRow[] = rows.map((row, i) => {
          const suggestion = classifyReason(readings[i] ?? [], aliases);
          const match = matchName(row.nameText, members, (m) => m.fullname);
          const hasReason = readings[i]?.some((r) => normalizeText(r)) ?? false;
          const lowConfidence = hasReason && row.reasonConfidence < LOW_CONFIDENCE;
          const guessed =
            hasReason &&
            suggestion.key !== null &&
            suggestion.score < CONFIDENT_THRESHOLD;

          // Show the reading the code came from (often a cell pass read the
          // word cleanly when the page pass did not), and what it was taken
          // as when that differs.
          const reasonText =
            suggestion.reading ?? row.reasonText ?? readings[i]?.[0] ?? "";
          const matched = suggestion.candidates[0]?.matched;
          const understoodAs =
            matched &&
            suggestion.key !== null &&
            suggestion.score >= 0.9 &&
            normalizeText(matched) !== normalizeText(reasonText)
              ? matched
              : null;

          return {
            blg: row.blg,
            nameText: row.nameText,
            matchedName: match?.record.fullname ?? null,
            reasonText,
            understoodAs,
            suggestion,
            key: hasReason ? suggestion.key : BLANK_REASON_KEY,
            blankReason: !hasReason,
            lowConfidence,
            needsAttention:
              (hasReason && suggestion.key === null) ||
              guessed ||
              lowConfidence ||
              // A name that is not in this grupo's records is only worth a
              // flag when there are records to compare against.
              (members.length > 0 && match === null),
          };
        });

        setReview({
          groupIndex,
          group: group.group,
          sessionKey,
          includeOtherSession: false,
          rows: reviewRows,
        });
        sheetRef.current?.present();
      } catch (error) {
        console.log("startScan error:", error);
        Toast.show({
          type: "error",
          text1: "Scan failed",
          text2:
            error instanceof Error ? error.message : "Could not read the photo.",
          visibilityTime: 4000,
        });
      } finally {
        loader.hide();

        // The photo has served its purpose: only the counts and the learned
        // corrections are kept, never the image.
        if (picked.temporary) {
          FileSystem.deleteAsync(uri, { idempotent: true }).catch((error) =>
            console.log("scan cleanup error:", error)
          );
        }
      }
    },
    [db, groupValues, loader, purok]
  );

  const setRowCode = useCallback(
    (blg: number, key: keyof Percent.Codes | null) => {
      setReview((prev) =>
        prev
          ? {
              ...prev,
              rows: prev.rows.map((row) =>
                row.blg === blg ? { ...row, key, needsAttention: false } : row
              ),
            }
          : prev
      );
    },
    []
  );

  const setIncludeOtherSession = useCallback((value: boolean) => {
    setReview((prev) =>
      prev ? { ...prev, includeOtherSession: value } : prev
    );
  }, []);

  const dismiss = useCallback(() => {
    sheetRef.current?.dismiss();
    setReview(null);
  }, []);

  const confirm = useCallback(async () => {
    if (!review) return;

    const counts: CodeCounts = {};
    const learned: ReasonAliases = { ...aliasesRef.current };
    let learnedSomething = false;

    review.rows.forEach((row) => {
      if (!row.key) return;

      // A correction teaches the app how this Kalihim writes that reason,
      // whether or not the code is one the card counts.
      const normalized = normalizeText(row.reasonText);
      if (normalized && row.key !== row.suggestion.key) {
        learned[normalized] = row.key;
        learnedSomething = true;
      }

      if (isApplied(row.key)) {
        counts[row.key] = (counts[row.key] ?? 0) + 1;
      }
    });

    const sessionKeys: Percent.SessionKey[] = review.includeOtherSession
      ? [review.sessionKey, otherSession(review.sessionKey)]
      : [review.sessionKey];

    applyScannedCodes(review.groupIndex, sessionKeys, counts);

    if (learnedSomething) {
      aliasesRef.current = learned;
      await saveAliases(learned);
    }

    const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    Toast.show({
      type: "success",
      text1: `Added ${total} code${total === 1 ? "" : "s"} to Grupo ${review.group}`,
      text2: sessionKeys.map(sessionLabel).join(" and ") + " session",
      visibilityTime: 2500,
    });

    dismiss();
  }, [applyScannedCodes, dismiss, review]);

  return {
    isSupported: isHandwritingOcrSupported,
    sheetRef,
    review,
    startScan,
    setRowCode,
    setIncludeOtherSession,
    confirm,
    dismiss,
  };
};
