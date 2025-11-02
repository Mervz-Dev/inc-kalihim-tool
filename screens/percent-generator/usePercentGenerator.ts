import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { zipExcelFileWithPassword } from "@/utils/file";
import { generateDefaultPercentData } from "@/utils/generate";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useAudioPlayer } from "expo-audio";
import Toast from "react-native-toast-message";
import { DateType } from "react-native-ui-datepicker";

export const usePercentGenerator = (
  purok: string,
  groupCount: string,
  saveBottomRef: RefObject<BottomSheetModal | null>
) => {
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
  const [isFromLastWeekResult, setIsFromLastWeekResult] = useState(false);

  // --- Load Previous Data ---
  const loadPrevData = async () => {
    try {
      loader.show();
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
        setSNumberModalVisible(true);
      } else {
        Alert.alert(
          "No Previous S Number Found",
          "Please enter the S number values for each group before proceeding.",
          [{ text: "OK", onPress: () => setSNumberModalVisible(true) }]
        );
      }
    } catch (error) {
      console.error("Failed to load previous data:", error);
      Alert.alert("Error", "Failed to load group data.");
    } finally {
      loader.hide();
    }
  };

  useEffect(() => {
    loadPrevData();
  }, []);

  // --- Handlers ---

  const handleButtonPress = (
    groupIndex: number,
    codeKey: keyof Percent.Session | "in" | "out",
    sessionKey: Percent.SessionKey
  ) => {
    player.seekTo(0);
    player.play();

    setGroupValues((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;

        const updatedSession = {
          ...group[sessionKey],
          [codeKey]:
            ((group[sessionKey][codeKey as keyof Percent.Session] as number) ||
              0) + 1,
        };

        return { ...group, [sessionKey]: updatedSession };
      })
    );
  };

  const handleReset = (groupIndex: number) => {
    setGroupValues((prev) => {
      const updated = [...prev];
      const group = updated[groupIndex];

      // Reset session fields
      const resetSession = (session: Percent.Session) => {
        Object.keys(session).forEach((key) => {
          session[key as keyof Percent.Session] = 0;
        });
      };

      resetSession(group.firstSession);
      resetSession(group.secondSession);

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

      const zippedUri = await zipExcelFileWithPassword(excelUri);

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

      const excelUri = await plotPercentToExcel(
        result,
        isFromLastWeekResult ? prevComputedResult : undefined
      );

      const fromLast =
        weekNumber - parseInt(prevComputedResult?.info?.week || "0", 10) === 1;
      setIsFromLastWeekResult(fromLast);

      setCurrentComputedResult(result);

      await delay(500);

      if (!excelUri) return;

      const zippedUri = await zipExcelFileWithPassword(excelUri);

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
  };
};
