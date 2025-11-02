import { getSessionAbsentees } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { generateSessionHtml } from "@/utils/generate";
import { useSQLiteContext } from "expo-sqlite";
import { RefObject, useEffect, useState } from "react";

import { useSettingsStore } from "@/stores/settingsStore";
import {
  getNumberOfWeeks,
  getWeekdayBetween,
  getWeekWedToSun,
} from "@/utils/date";
import { plotAbsenteeToExcel } from "@/utils/excelPlotter";
import { zipExcelFileWithPassword } from "@/utils/file";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
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
      loader.show();
      const sessionResult = await getSessionAbsentees(purok, db);
      console.log(sessionResult, "session", purok);
      setSessionData(sessionResult);
    } catch (error) {
      console.log(error);
    } finally {
      loader.hide();
    }
  };

  const createSessionPdf = async () => {
    try {
      const html = generateSessionHtml(sessionData);

      const { uri: tempUri } = await Print.printToFileAsync({ html });

      console.log("Temp URI:", tempUri);

      const date = new Date();
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const customName = `purok-${purok}-${formattedDate}.pdf`;
      const newUri = FileSystem.documentDirectory + customName;

      await FileSystem.moveAsync({
        from: tempUri,
        to: newUri,
      });

      console.log("Saved PDF at:", newUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri);
      } else {
        console.log("Sharing is not available on this device");
      }
    } catch (error) {
      console.log("createSessionPdf error: ", error);
      return "";
    }
  };

  const createAttendance = async () => {
    try {
      console.log("📄 Loading Excel template from assets...");
      const ExcelJS = await import("exceljs");

      const asset = Asset.fromModule(require("@/assets/forms/attendance.xlsx"));
      await asset.downloadAsync();

      const dest = FileSystem.documentDirectory + "attendance_template.xlsx";
      await FileSystem.copyAsync({
        from: asset.localUri || asset.uri,
        to: dest,
      });

      const base64 = await FileSystem.readAsStringAsync(dest, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(base64, "base64");

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      const ws = workbook.worksheets[0];
      ws.getCell("A1").value = "Updated with ExcelJS!";
      ws.getCell("A2").value = "Purok 1";
      ws.getCell("A1").font = { bold: true, color: { argb: "FF2E8B57" } };

      const modifiedFileUri =
        FileSystem.documentDirectory + "attendance_updated.xlsx";

      const stream = await workbook.xlsx.writeBuffer();
      const updatedBase64 = Buffer.from(stream).toString("base64");
      await FileSystem.writeAsStringAsync(modifiedFileUri, updatedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("✅ Excel file updated:", modifiedFileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(modifiedFileUri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Share Attendance File",
          UTI: "com.microsoft.excel.xlsx",
        });
      } else {
        alert("Sharing not available on this device.");
      }
    } catch (e) {
      console.error("❌ Error creating attendance file:", e);
    }
  };

  const generateAbsenteeForm = async () => {
    try {
      loader.show("Generating...");
      // TODO:
      // store uri on state
      // save bottom form

      console.log("seee", sessionData);
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

      const plottedExcelUri = await plotAbsenteeToExcel(sessionData, info);

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

  useEffect(() => {
    initFetch();
    setInfoModalVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sessionData,
    createSessionPdf,
    createAttendance,
    generateAbsenteeForm,
    dateRange,
    setDateRange,
    notes,
    setNotes,
    infoModalVisible,
    setInfoModalVisible,
    weekNumber,
    plottedExcelUri,
  };
};
