import AsyncStorage from "@react-native-async-storage/async-storage";
import { RefObject, useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSettingsStore } from "@/stores/settingsStore";
import { Percent } from "@/types/percent";
import { computePercentage } from "@/utils/compute";
import {
  formatFullDate,
  getNumberOfWeeks,
  getPreviousWeekWedToSun,
  getRangeTextFormat,
  getYearFromDate,
} from "@/utils/date";
import { delay } from "@/utils/delay";
import { plotPercentToExcel } from "@/utils/excelPlotter";
import {
  copyExcelToDownloads,
  getFileNameWithoutExtension,
} from "@/utils/file";
import { generateDefaultPercentData } from "@/utils/generate";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import Toast from "react-native-toast-message";
import { DateType } from "react-native-ui-datepicker";

export const usePercentGenerator = (
  purok: string,
  groupCount: string,
  saveBottomRef: RefObject<BottomSheetModal | null>
) => {
  const loader = useLoading();
  // --- Initialization ---

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
  }>(getPreviousWeekWedToSun());

  const [plottedExcelUri, setPlottedExcelUri] = useState<string>();
  const [currentComputedResult, setCurrentComputedResult] =
    useState<Percent.ComputedPercent>();

  const [prevComputedResult, setPrevComputedResult] =
    useState<Percent.ComputedPercent>();
  const { lokalCode, distritoCode, lokal, distrito } = useSettingsStore();

  const [sNumberModalVisible, setSNumberModalVisible] = useState(false);

  // --- Load Previous Data ---
  const loadPrevData = async () => {
    try {
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

  // --- Excel Generation ---
  const generatePercentData = async () => {
    try {
      loader.show();
      const computedResult = computePercentage({
        groupValues,
        sNumber,
      });

      const weekNumber = getNumberOfWeeks(dateRange.startDate);
      const range = getRangeTextFormat(dateRange.startDate, dateRange.endDate);
      const yearNumber = getYearFromDate(dateRange.startDate);
      const dateString = formatFullDate(dateRange.endDate);
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

      const excelUri = await plotPercentToExcel(result, prevComputedResult);

      setCurrentComputedResult(computedResult);
      await delay(1000);

      if (!excelUri) return;

      setPlottedExcelUri(excelUri);

      saveBottomRef?.current?.present();

      console.log("Generated percent data:", computedResult);
    } catch (error) {
      alert("Error generation");
      console.error("generatePercentData error:", error);
    } finally {
      loader.hide();
    }
  };

  const handleShare = async () => {
    try {
      if ((await Sharing.isAvailableAsync()) && plottedExcelUri) {
        await Sharing.shareAsync(plottedExcelUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Porsyento File",
          UTI: "com.microsoft.excel.xlsx",
        });

        Toast.show({
          type: "success",
          text1: "File shared successfully",
          swipeable: true,
          visibilityTime: 2000,
          topOffset: 60,
        });

        await handleSaveOnCache();
      } else {
        Toast.show({
          type: "info",
          text1: "Sharing not available",
          text2: "This device cannot share files.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.log("handleShare error: ", error);
      Toast.show({
        type: "error",
        text1: "Error sharing file",
        text2: "Something went wrong.",
        position: "bottom",
      });
    }
  };

  const handleLocalSave = async () => {
    try {
      if (plottedExcelUri) {
        const savedUri = await copyExcelToDownloads(
          plottedExcelUri,
          getFileNameWithoutExtension(plottedExcelUri)
        );

        if (savedUri) {
          Toast.show({
            type: "success",
            text1: "File Saved",
            text2: "Your Excel file has been saved.",
            swipeable: true,
            visibilityTime: 2000,
            topOffset: 60,
          });

          await handleSaveOnCache();
        }
      } else {
        Toast.show({
          type: "info",
          text1: "No File Found",
          text2: "Please generate a file before saving.",
        });
      }
    } catch (error) {
      console.log("handleLocalSave error: ", error);
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: "Something went wrong while saving the file.",
      });
    }
  };

  const handleSaveOnCache = async () => {
    try {
      loader.show();
      if (currentComputedResult) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(currentComputedResult)
        );
        await delay(500);
        router.back();
      }
    } catch (error) {
      console.log("handleSaveOnCache error:", error);
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
    handleShare,
    handleLocalSave,
    handleSaveOnCache,
    currentComputedResult,
    prevComputedResult,
    setDateRange,
    dateRange,
    handleResetCache,
  };
};
