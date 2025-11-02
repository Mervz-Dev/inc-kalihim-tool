import { APP_PASSWORD_KEY } from "@/constants/encryption";
import * as Clipboard from "expo-clipboard"; // ✅ correct import
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import mime from "mime";
import { zipWithPassword } from "react-native-zip-archive";
import { generatePasswordFromKey } from "./generate";

export async function copyFileToDownloads(
  sourceUri: string,
  fileName?: string
): Promise<string | undefined> {
  const permissions =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    return;
  }

  try {
    // Extract extension and mime type
    const extension = sourceUri.split(".").pop() || "";
    const mimeType = mime.getType(extension) || "application/octet-stream"; // fallback if unknown

    // Use provided name or fallback to last segment of the source URI
    const finalName =
      fileName?.replace(/\.[^/.]+$/, "") ||
      sourceUri.split("/").pop()?.split(".")[0] ||
      "file";

    // Create target file
    const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      `${finalName}.${extension}`,
      mimeType
    );

    // Read original file content
    const base64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Write content into the new file
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

    await Clipboard.setStringAsync(timestamp.toString());

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
