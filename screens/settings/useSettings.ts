import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { RefObject, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import XLSX from "xlsx";

import {
  addBulkUsers,
  clearDatabase,
  getAllUsers,
} from "@/services/sql-lite/db";
import { useSettingsStore } from "@/stores/settingsStore";
import { User } from "@/types/user";
import { delay } from "@/utils/delay";
import { zipExcelFileWithPassword } from "@/utils/file";
import { useLoading } from "@/utils/hooks/useLoading";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

export function useSettingsScreen(
  saveBottomRef: RefObject<BottomSheetModal | null>
) {
  const db = useSQLiteContext();
  const loader = useLoading();

  const {
    distrito,
    lokal,
    lokalCode,
    distritoCode,
    setField,
    reset,
    setBiometrics,
    biometricsEnabled,
    toggleShowDetailedFullName,
    showDetailedFullName,
  } = useSettingsStore();

  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileUri, setExportFileUri] = useState("");

  // --- Toggle Biometrics ---
  const toggleBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setBiometrics(false);
      Toast.show({
        type: "error",
        text1: "Unavailable",
        text2: "Biometric authentication not available on this device",
      });
      return;
    }

    setBiometrics(!biometricsEnabled);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: `Biometrics ${!biometricsEnabled ? "enabled" : "disabled"}`,
    });
  };

  // --- Reset Settings Only ---
  const handleReset = () => {
    reset();
    Toast.show({
      type: "success",
      text1: "Settings Reset",
      text2: "All settings have been cleared",
    });
  };

  // --- Clear All App Data ---
  const handleClearAllData = () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to clear all data (database, cache, and local files)? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, clear all",
          style: "destructive",
          onPress: async () => {
            try {
              loader.show("Clearing...");
              await clearDatabase(db);
              await AsyncStorage.clear();

              const files = await FileSystem.readDirectoryAsync(
                FileSystem.documentDirectory || ""
              );
              for (const file of files) {
                await FileSystem.deleteAsync(
                  FileSystem.documentDirectory + file,
                  { idempotent: true }
                );
              }

              await delay(600);

              Toast.show({
                type: "success",
                text1: "All Data Cleared",
                text2: "Database, cache, and files removed successfully.",
              });
            } catch (err) {
              console.error("Full clear error:", err);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to clear all data.",
              });
            } finally {
              loader.hide();
            }
          },
        },
      ]
    );
  };

  // --- Import Excel/CSV ---
  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ],
      });

      if (!result.assets || result.assets.length === 0) {
        Toast.show({
          type: "info",
          text1: "Cancelled",
          text2: "File import cancelled.",
        });
        return;
      }

      setShowImportModal(false);

      const file = result.assets[0];
      const fileUri = file.uri;

      loader.show("Importing...");

      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileBase64, { type: "base64" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const data: User.UserFormData[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      await addBulkUsers(data, db);
      await delay(1000);

      Toast.show({
        type: "success",
        text1: "Import Successful",
        text2: `Imported ${data.length} rows.`,
      });
    } catch (error) {
      console.error("File import error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to read file.",
      });
    } finally {
      loader.hide();
    }
  };

  // --- Export Users to Excel ---
  const exportUsersToExcel = async () => {
    try {
      setShowExportModal(false);
      loader.show("Preparing data...");

      // Step 1: Fetch all users
      const result = await getAllUsers(db);

      await delay(700);

      if (!result || result.length === 0) {
        loader.hide();
        Toast.show({
          type: "info",
          text1: "No Data",
          text2: "There are no users to export.",
        });
        return;
      }

      loader.show("Generating Excel...");

      // Step 2: Create Excel sheet from data
      const worksheet = XLSX.utils.json_to_sheet(result);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const wbout = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      const fileName = `users-export-${Date.now()}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Step 3: Write Excel file
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      loader.show("Zipping file...");

      // Step 4: Zip Excel file with password (same helper as percent)
      const zippedUri = await zipExcelFileWithPassword(fileUri);

      if (!zippedUri) {
        return;
      }

      setExportFileUri(zippedUri);

      await delay(500);

      loader.hide();

      // Step 5: Open save bottom sheet
      saveBottomRef?.current?.present();

      console.log("Exported users data:", result.length, "records");
    } catch (error) {
      loader.hide();
      console.error("Export error:", error);

      Toast.show({
        type: "error",
        text1: "Export Failed",
        text2: "Could not export users.",
      });
    }
  };

  return {
    // store data
    distrito,
    lokal,
    lokalCode,
    distritoCode,
    biometricsEnabled,

    // state
    showImportModal,
    setShowImportModal,
    showExportModal,
    setShowExportModal,
    exportFileUri,
    showDetailedFullName,
    toggleShowDetailedFullName,

    // actions
    setField,
    toggleBiometrics,
    handleReset,
    handleClearAllData,
    handleImportFile,
    exportUsersToExcel,

    // navigation
    goToPassword: () => router.push("/set-password"),
  };
}
