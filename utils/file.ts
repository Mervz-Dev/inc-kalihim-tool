import * as FileSystem from "expo-file-system";

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
