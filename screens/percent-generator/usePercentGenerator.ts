import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { useSettingsStore } from "@/stores/settingsStore";
import { Percent } from "@/types/percent";
import { computePercentage } from "@/utils/compute";
import { delay } from "@/utils/delay";
import { plotPercentToExcel } from "@/utils/excelPlotter";
import { generateDefaultPercentData } from "@/utils/generate";
import { useLoading } from "@/utils/hooks/useLoading";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

export const usePercentGenerator = (purok: string, groupCount: string) => {
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
  const { lokalCode, distritoCode, lokal, distrito } = useSettingsStore();

  const [weekNumber, setWeekNumber] = useState("");
  const [monthNumber, setMonthNumber] = useState("");
  const [sNumberModalVisible, setSNumberModalVisible] = useState(false);

  // --- Load Previous Data ---
  const loadPrevData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed.sNumber)) {
          // Merge old and new group arrays safely
          setSNumber((prev) => {
            const merged = prev.map((group) => {
              const existing = parsed.sNumber.find(
                (item: any) => item.group === group.group
              );
              return existing ? existing : group;
            });
            return merged;
          });
        }
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
    sessionKey?: Percent.SessionKey
  ) => {
    setGroupValues((prev) => {
      const updated = [...prev];
      const group = updated[groupIndex];

      if (sessionKey) {
        const session = group[sessionKey];
        session[codeKey as keyof Percent.Session] =
          ((session[codeKey as keyof Percent.Session] as number) || 0) + 1;
      } else {
        group[codeKey as "in" | "out"] =
          (group[codeKey as "in" | "out"] || 0) + 1;
      }

      return updated;
    });
  };

  const handleReset = (groupIndex: number) => {
    setGroupValues((prev) => {
      const updated = [...prev];
      const group = updated[groupIndex];

      // Reset simple counters
      group.in = 0;
      group.out = 0;

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
      const dataToSave = JSON.stringify({ sNumber });
      await AsyncStorage.setItem(STORAGE_KEY, dataToSave);
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

      const result: Percent.ComputedPercent = {
        ...computedResult,
        info: {
          purok,
          week: weekNumber,
          month: monthNumber,
          lokalCode,
          distritoCode,
          lokal,
          distrito,
        },
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ sNumber: result.newSNumber })
      );

      const excelUri = await plotPercentToExcel(result);

      await delay(1500);

      if (!excelUri) return;

      // if (await Sharing.isAvailableAsync()) {
      //   await Sharing.shareAsync(excelUri, {
      //     mimeType:
      //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      //     dialogTitle: "Porsyento File",
      //     UTI: "com.microsoft.excel.xlsx",
      //   });
      // } else {
      //   Alert.alert("Sharing not available", "This device cannot share files.");
      // }

      router.back();

      Toast.show({
        type: "success",
        text1: "Form Generated Successfully",
        text2: "Your form has been saved to your device storage.",
        swipeable: true,
        visibilityTime: 2000,
        topOffset: 60,
      });

      console.log("Generated percent data:", computedResult);
    } catch (error) {
      alert("Error generation");
      console.error("generatePercentData error:", error);
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
    weekNumber,
    setWeekNumber,
    monthNumber,
    setMonthNumber,
  };
};
