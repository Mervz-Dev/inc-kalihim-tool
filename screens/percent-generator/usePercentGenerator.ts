import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ParamListBase } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { RefObject, useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSettingsStore } from "@/stores/settingsStore";
import { Percent } from "@/types/percent";
import { computePercentage } from "@/utils/compute";
import {
  formatFullDate,
  getNumberOfWeeks,
  getRangeTextFormat,
  getWeekWedToSun,
  getYearFromDate,
} from "@/utils/date";
import { delay } from "@/utils/delay";
import { plotPercentToExcel } from "@/utils/excelPlotter";
import { zipExcelFile } from "@/utils/file";
import { generateDefaultPercentData } from "@/utils/generate";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAudioPlayer } from "expo-audio";
import Toast from "react-native-toast-message";
import { DateType } from "react-native-ui-datepicker";

/** Counts to add per code, e.g. `{ g: 3, b: 1 }`. */
export type CodeCounts = Partial<Record<keyof Percent.Codes, number>>;

/**
 * One reversible change to a grupo card. Kept in the hook (not in the card)
 * so a scanned batch and a single tap share the same Undo.
 */
type HistoryEntry =
  | {
      kind: "tap";
      sessionKey: Percent.SessionKey;
      codeKey: keyof Percent.Session | "in" | "out";
    }
  | { kind: "bulk"; sessionKeys: Percent.SessionKey[]; counts: CodeCounts };

const addCounts = (
  session: Percent.Session,
  counts: CodeCounts,
  sign: 1 | -1
): Percent.Session => {
  const updated = { ...session };
  (Object.keys(counts) as (keyof Percent.Codes)[]).forEach((key) => {
    const delta = counts[key] ?? 0;
    updated[key] = Math.max((updated[key] || 0) + sign * delta, 0);
  });
  return updated;
};

export const usePercentGenerator = (
  purok: string,
  groupCount: string,
  saveBottomRef: RefObject<BottomSheetModal | null>
) => {
  const { encryptedFileEnabled } = useSettingsStore();
  const loader = useLoading();
  // --- Initialization ---

  const player = useAudioPlayer(require("@/assets/sounds/pop.mp3"));

  const defaultValues = generateDefaultPercentData(Number(groupCount));
  const STORAGE_KEY = `@prev-percent-${purok}`;

  const [groupValues, setGroupValues] = useState<Percent.GroupValues[]>(
    defaultValues.groupValues
  );
  const [sNumber, setSNumber] = useState<Percent.SNumber[]>(
    defaultValues.sNumber
  );
  const [isNoPrev, setIsNoPrev] = useState<boolean>(false);

  const [dateRange, setDateRange] = useState<{
    startDate?: DateType;
    endDate?: DateType;
  }>(getWeekWedToSun("previous"));

  const weekNumber = getNumberOfWeeks(dateRange.startDate);
  const range = getRangeTextFormat(dateRange.startDate, dateRange.endDate);
  const yearNumber = getYearFromDate(dateRange.startDate);
  const dateString = formatFullDate(dateRange.endDate);

  const [plottedExcelUri, setPlottedExcelUri] = useState<string>();
  const [currentComputedResult, setCurrentComputedResult] =
    useState<Percent.ComputedPercent>();

  const [prevComputedResult, setPrevComputedResult] =
    useState<Percent.ComputedPercent>();
  const { lokalCode, distritoCode, lokal, distrito } = useSettingsStore();

  const [sNumberModalVisible, setSNumberModalVisible] = useState(false);

  // The S# modal opens automatically on entry. iOS refuses to present a modal
  // from a screen that is still being pushed, so it waits until both the data
  // has loaded and the screen transition has finished.
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const [isScreenReady, setIsScreenReady] = useState(false);
  const [isSNumberModalPending, setIsSNumberModalPending] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", (event) => {
      if (!event.data.closing) setIsScreenReady(true);
    });

    // Never wait forever: if the event was missed or never fires, carry on.
    const fallback = setTimeout(() => setIsScreenReady(true), 1000);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigation]);

  useEffect(() => {
    if (isSNumberModalPending && isScreenReady) {
      setIsSNumberModalPending(false);
      setSNumberModalVisible(true);
    }
  }, [isSNumberModalPending, isScreenReady]);
  const [isFromLastWeekResult, setIsFromLastWeekResult] = useState(false);

  // --- Load Previous Data ---
  const loadPrevData = async () => {
    let shouldOpenModal = false;

    try {
      loader.show("Please wait...");
      await delay(650);
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (!parsed) {
          return;
        }

        if (Array.isArray(parsed.newSNumber)) {
          setSNumber((prev) => {
            const merged = prev.map((group) => {
              const existing = parsed.newSNumber.find(
                (item: any) => item.group === group.group
              );
              return existing ? existing : group;
            });
            return merged;
          });
        }

        setPrevComputedResult(parsed);
      } else {
        setIsNoPrev(true);
      }

      shouldOpenModal = true;
    } catch (error) {
      console.error("Failed to load previous data:", error);
      Alert.alert("Error", "Failed to load group data.");
    } finally {
      loader.hide();
    }

    // Open only after the loader is dismissed; the effect above also waits for
    // the screen transition to finish.
    if (shouldOpenModal) {
      setIsSNumberModalPending(true);
    }
  };

  useEffect(() => {
    loadPrevData();
  }, []);

  // --- Handlers ---

  const [history, setHistory] = useState<HistoryEntry[][]>([]);

  const pushHistory = (groupIndex: number, entry: HistoryEntry) => {
    setHistory((prev) => {
      const updated = [...prev];
      updated[groupIndex] = [...(updated[groupIndex] ?? []), entry];
      return updated;
    });
  };

  const playPop = () => {
    player.seekTo(0);
    player.play();
  };

  const adjustCode = (
    groupIndex: number,
    codeKey: keyof Percent.Session | "in" | "out",
    sessionKey: Percent.SessionKey,
    delta: 1 | -1
  ) => {
    setGroupValues((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;

        const currentValue =
          (group[sessionKey][codeKey as keyof Percent.Session] as number) || 0;

        const updatedSession = {
          ...group[sessionKey],
          [codeKey]: Math.max(currentValue + delta, 0),
        };

        return { ...group, [sessionKey]: updatedSession };
      })
    );
  };

  const handleButtonPress = (
    groupIndex: number,
    codeKey: keyof Percent.Session | "in" | "out",
    sessionKey: Percent.SessionKey,
    undo = false
  ) => {
    if (undo) {
      adjustCode(groupIndex, codeKey, sessionKey, -1);
      return;
    }

    playPop();
    adjustCode(groupIndex, codeKey, sessionKey, 1);
    pushHistory(groupIndex, { kind: "tap", sessionKey, codeKey });
  };

  /**
   * Adds a scanned sheet's counts to one grupo in a single update -- not one
   * tap per person -- and records it as one Undo step.
   */
  const applyScannedCodes = (
    groupIndex: number,
    sessionKeys: Percent.SessionKey[],
    counts: CodeCounts
  ) => {
    const total = Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
    if (total === 0 || sessionKeys.length === 0) return;

    playPop();
    setGroupValues((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;

        const updated = { ...group };
        sessionKeys.forEach((sessionKey) => {
          updated[sessionKey] = addCounts(group[sessionKey], counts, 1);
        });
        return updated;
      })
    );
    pushHistory(groupIndex, { kind: "bulk", sessionKeys, counts });
  };

  const canUndo = (groupIndex: number) =>
    (history[groupIndex]?.length ?? 0) > 0;

  const undo = (groupIndex: number) => {
    const entries = history[groupIndex] ?? [];
    const last = entries[entries.length - 1];
    if (!last) return;

    setHistory((prev) => {
      const updated = [...prev];
      updated[groupIndex] = entries.slice(0, -1);
      return updated;
    });

    if (last.kind === "tap") {
      adjustCode(groupIndex, last.codeKey, last.sessionKey, -1);
      return;
    }

    setGroupValues((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;

        const updated = { ...group };
        last.sessionKeys.forEach((sessionKey) => {
          updated[sessionKey] = addCounts(group[sessionKey], last.counts, -1);
        });
        return updated;
      })
    );
  };

  const handleReset = (groupIndex: number) => {
    const resetSession = (session: Percent.Session): Percent.Session =>
      Object.keys(session).reduce(
        (acc, key) => ({ ...acc, [key]: 0 }),
        {} as Percent.Session
      );

    setGroupValues((prev) =>
      prev.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              firstSession: resetSession(group.firstSession),
              secondSession: resetSession(group.secondSession),
            }
          : group
      )
    );

    setHistory((prev) => {
      const updated = [...prev];
      updated[groupIndex] = [];
      return updated;
    });
  };

  const handleChange = (index: number, value: string) => {
    setSNumber((prev) => {
      const updated = [...prev];
      updated[index].count = Number(value) || 0;
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSNumberModalVisible(false);
    } catch (error) {
      console.error("Failed to save S Number:", error);
      Alert.alert("Error", "Failed to save group values.");
    }
  };

  const generateLastData = async () => {
    try {
      if (!prevComputedResult) {
        Toast.show({
          type: "error",
          text1: "Error Generating",
          text2: "cannot generate previous data",
        });
        return;
      }

      setSNumberModalVisible(false);

      loader.show("Generating...");

      await delay(1000);

      const excelUri = await plotPercentToExcel(prevComputedResult);

      setCurrentComputedResult(prevComputedResult);

      await delay(500);

      if (!excelUri) return;

      const zippedUri = await zipExcelFile(excelUri, encryptedFileEnabled);

      console.log("zipped uri", zippedUri);

      setPlottedExcelUri(zippedUri);

      saveBottomRef?.current?.present();

      console.log("Generated prev percent data:", prevComputedResult);
    } catch (error) {
      alert("Error generation");
      console.error("generatePercentData error:", error);
    } finally {
      loader.hide();
    }
  };

  // --- Excel Generation ---
  const generatePercentData = async () => {
    try {
      loader.show("Calculating...");
      const computedResult = computePercentage({
        groupValues,
        sNumber,
      });

      await delay(1000);

      const result: Percent.ComputedPercent = {
        ...computedResult,
        info: {
          purok,
          week: weekNumber.toString(),
          month: range,
          year: yearNumber.toString(),
          dateString,
          lokalCode,
          distritoCode,
          lokal,
          distrito,
        },
      };

      loader.show("Generating...");

      const fromLast =
        weekNumber - parseInt(prevComputedResult?.info?.week || "0", 10) === 1;
      setIsFromLastWeekResult(fromLast);

      const excelUri = await plotPercentToExcel(
        result,
        fromLast ? prevComputedResult : undefined
      );

      setCurrentComputedResult(result);

      await delay(500);

      if (!excelUri) return;

      const zippedUri = await zipExcelFile(excelUri, encryptedFileEnabled);

      setPlottedExcelUri(zippedUri);

      saveBottomRef?.current?.present();

      console.log("Generated percent data:", computedResult);
    } catch (error) {
      alert("Error generation");
      console.error("generatePercentData error:", error);
    } finally {
      loader.hide();
    }
  };

  const handleResetCache = async () => {
    try {
      loader.show();
      await AsyncStorage.removeItem(STORAGE_KEY);

      setPrevComputedResult(undefined);
      setSNumber(defaultValues.sNumber);

      Toast.show({
        type: "success",
        text1: "Previous data is removed",
        text2: "Start to input S# again",
      });
    } catch (error) {
      console.log("handleResetCache error: ", error);
    } finally {
      loader.hide();
    }
  };

  // --- Return API ---
  return {
    groupValues,
    setGroupValues,
    sNumber,
    setSNumber,
    sNumberModalVisible,
    setSNumberModalVisible,
    handleButtonPress,
    handleReset,
    applyScannedCodes,
    undo,
    canUndo,
    handleChange,
    handleSave,
    generatePercentData,
    currentComputedResult,
    prevComputedResult: isFromLastWeekResult ? prevComputedResult : undefined,
    setDateRange,
    dateRange,
    handleResetCache,
    weekNumber,
    STORAGE_KEY,
    plottedExcelUri,
    generateLastData,
    isNoPrev,
  };
};
