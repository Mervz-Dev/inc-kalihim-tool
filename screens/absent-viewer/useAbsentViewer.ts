import { getSessionAbsentees } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { useSQLiteContext } from "expo-sqlite";
import { RefObject, useEffect, useState } from "react";

import { useSettingsStore } from "@/stores/settingsStore";
import {
  getNumberOfWeeks,
  getWeekdayBetween,
  getWeekWedToSun,
} from "@/utils/date";
import { delay } from "@/utils/delay";
import { plotAbsenteeToExcel } from "@/utils/excelPlotter";
import { zipExcelFileWithPassword } from "@/utils/file";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { DateType } from "react-native-ui-datepicker";

export const useAbsentViewer = (
  purok: string,
  saveBottomRef: RefObject<BottomSheetModal | null>
) => {
  const [sessionData, setSessionData] = useState<User.SessionData[]>([]);
  const loader = useLoading();
  const { lokalCode, distritoCode, lokal, distrito } = useSettingsStore();

  const [dateRange, setDateRange] = useState<{
    startDate?: DateType;
    endDate?: DateType;
  }>(getWeekWedToSun());

  const [isCapitalizeNames, setIsCapitalizeNames] = useState(false);

  const weekNumber = getNumberOfWeeks(dateRange.startDate);
  const firstSessionDay = getWeekdayBetween(
    dateRange.startDate,
    dateRange.endDate,
    4
  );
  const secondSessionDay = getWeekdayBetween(
    dateRange.startDate,
    dateRange.endDate,
    7
  );

  const [notes, setNotes] = useState<string>("");

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [plottedExcelUri, setPlottedExcelUri] = useState<string>("");

  const db = useSQLiteContext();

  const initFetch = async () => {
    try {
      loader.show("Please wait...");
      await delay(650);
      const sessionResult = await getSessionAbsentees(purok, db);
      setSessionData(sessionResult);
      setInfoModalVisible(true);
    } catch (error) {
      console.log(error);
    } finally {
      loader.hide();
    }
  };

  const generateAbsenteeForm = async () => {
    try {
      loader.show("Generating...");

      if (!sessionData) {
        return;
      }

      const info: User.Info = {
        week: weekNumber.toString(),
        firstSession: {
          day: firstSessionDay?.dayNumber?.toString() || "",
          month: firstSessionDay?.month || "",
          year: firstSessionDay?.year?.toString() || "",
        },
        secondSession: {
          day: secondSessionDay?.dayNumber?.toString() || "",
          month: secondSessionDay?.month || "",
          year: secondSessionDay?.year?.toString() || "",
        },
        lokalCode,
        distritoCode,
        lokal,
        distrito,
        note: notes,
      };

      const plottedExcelUri = await plotAbsenteeToExcel(sessionData, info, {
        isCapitalizeNames,
      });

      if (!plottedExcelUri) return;

      const zippedUri = await zipExcelFileWithPassword(plottedExcelUri);

      if (!zippedUri) return;

      setPlottedExcelUri(zippedUri);

      saveBottomRef?.current?.present();

      return zippedUri;
    } catch (error) {
      console.log("generateAbsenteeForm error: ", error);
    } finally {
      loader.hide();
    }
  };

  const toggleCapitalizeName = () => {
    setIsCapitalizeNames((v) => !v);
  };

  useEffect(() => {
    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sessionData,
    generateAbsenteeForm,
    dateRange,
    setDateRange,
    notes,
    setNotes,
    infoModalVisible,
    setInfoModalVisible,
    weekNumber,
    plottedExcelUri,
    setIsCapitalizeNames,
    isCapitalizeNames,
    toggleCapitalizeName,
  };
};
