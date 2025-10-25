import * as FileSystem from "expo-file-system";

export async function copyExcelToDownloads(
  sourceUri: string,
  fileName: string
): Promise<string | undefined> {
  //   const internalFileUri = FileSystem.documentDirectory + `${fileName}.xlsx`;
  //   await FileSystem.copyAsync({
  //     from: sourceUri,
  //     to: internalFileUri,
  //   });
  // Ask for access to a folder (user can pick Downloads)
  const permissions =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    alert("Permission denied to access storage.");
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
