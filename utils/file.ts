import { APP_PASSWORD_KEY } from "@/constants/encryption";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import { zipWithPassword } from "react-native-zip-archive";
import { generatePasswordFromKey } from "./generate";

export async function copyExcelToDownloads(
  sourceUri: string,
  fileName: string
): Promise<string | undefined> {
  const permissions =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    // alert("Permission denied to access storage.");
    return;
  }

  try {
    // Create a target file in that folder
    const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      `${fileName}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Read original file content
    const base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Write content into the target file (this is effectively "copying")
    await FileSystem.writeAsStringAsync(targetUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return targetUri;
  } catch (error) {
    console.error("Copy failed:", error);
    alert("❌ Failed to copy file.");
  }
}

export const getFileNameWithoutExtension = (uri: string): string => {
  // Get the part after the last slash
  const fileName = uri.split("/").pop() || "";
  // Remove the extension (e.g., .xlsx, .pdf, etc.)
  return fileName.replace(/\.[^/.]+$/, "");
};

export const zipExcelFileWithPassword = async (sourceUri: string) => {
  try {
    const stored = await SecureStore.getItemAsync(APP_PASSWORD_KEY);
    const timestamp = getTimestampFromFileName(sourceUri);
    const password = generatePasswordFromKey(`${stored || "inc"}${timestamp}`);

    console.log("password", password);

    const fileName = getFileNameWithoutExtension(sourceUri);
    const targetPath = `${FileSystem.documentDirectory}/${fileName}.zip`;
    await zipWithPassword(sourceUri, targetPath, password);

    return targetPath;
  } catch (error) {
    console.log("zipExcelFileWithPassword error: ", error);
  }
};

export const getTimestampFromFileName = (fileName: string): string => {
  const match = fileName.match(/-(\d+)\.xlsx$/);
  if (match && match[1]) {
    return match[1];
  }

  const newTimeStamp = Date.now();
  return newTimeStamp.toString();
};
