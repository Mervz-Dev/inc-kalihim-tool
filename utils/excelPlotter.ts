import { Percent } from "@/types/percent";
import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { copyExcelToDownloads } from "./file";
import { generatePercentFileName } from "./generate";
import { roundDecimal } from "./number";

export const plotPercentToExcel = async (
  data: Percent.ComputedPercent
): Promise<string | null> => {
  const ExcelJS = await import("exceljs");
  const asset = Asset.fromModule(require("@/assets/forms/percent-format.xlsx"));
  await asset.downloadAsync();

  const fileUri = FileSystem.documentDirectory + "porsyento_template.xlsx";
  await FileSystem.copyAsync({
    from: asset.localUri || asset.uri,
    to: fileUri,
  });

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const buffer = Buffer.from(base64, "base64");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const ws = workbook.worksheets[0];

  // --- Helper ---
  const setCell = (
    ws: any,
    address: string,
    value: any,
    options?: {
      alignment?: { horizontal?: string; vertical?: string };
      fontSize?: number;
      bold?: boolean;
      color?: string;
    }
  ) => {
    const cell = ws.getCell(address);
    cell.value = value ?? 0;
    cell.alignment = options?.alignment ?? {
      horizontal: "center",
      vertical: "middle",
    };

    // Font styling
    cell.font = {
      size: options?.fontSize ?? 10, // Default 12pt
      bold: options?.bold ?? false,
      color: options?.color ? { argb: options.color } : undefined, // e.g. "FF0000" for red
    };
  };

  // --- Start plotting ---
  const startRow = 6;
  const codeKeys = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "totalCoded",
    "percent",
    "r107",
    "totalDalaw",
  ] as const;

  data.groupValues.forEach((group, idx) => {
    const row = startRow + idx;

    // Column A = group number
    setCell(ws, `A${row}`, group.group);

    // KABUUAN
    setCell(
      ws,
      `AL${row}`,
      roundDecimal(
        (group.firstSession.percent! + group.secondSession.percent!) / 2
      ) || "0"
    );

    // ws.getCell(`AL${row}`).value =
    //   roundDecimal(
    //     (group.firstSession.percent! + group.secondSession.percent!) / 2
    //   ) || "0";

    // Columns B–O = firstSession a–n
    codeKeys.forEach((key, keyIndex) => {
      const colLetter = String.fromCharCode("B".charCodeAt(0) + keyIndex);

      if (key === "m") {
        setCell(ws, `${colLetter}${row}`, 0);
      } else {
        setCell(ws, `${colLetter}${row}`, group.firstSession[key]);
      }
    });

    // --- Second Session (Columns T–AG)
    codeKeys.forEach((key, keyIndex) => {
      const colIndex = 20 + keyIndex; // T=20
      const colLetter = ws.getColumn(colIndex).letter;

      if (key === "m") {
        setCell(ws, `${colLetter}${row}`, 0);
      } else {
        setCell(ws, `${colLetter}${row}`, group.secondSession[key]);
      }
    });
  });

  // --- Plot First Session Code Totals (B26–S26)
  const totalRow = 26;
  codeKeys.forEach((key, keyIndex) => {
    const colLetter = String.fromCharCode("B".charCodeAt(0) + keyIndex);
    setCell(ws, `${colLetter}${totalRow}`, data.firstSessionCodeTotal[key]);
  });

  // --- Plot Second Session Code Totals (T26–AK26)
  codeKeys.forEach((key, keyIndex) => {
    const colIndex = 20 + keyIndex; // T = 20
    const colLetter = ws.getColumn(colIndex).letter;
    setCell(ws, `${colLetter}${totalRow}`, data.secondSessionCodeTotal[key]);
  });

  // TOTAL PERCENTAGE
  setCell(ws, `AL26`, data.overAllPercentage);

  data.sNumber.forEach((value, keyIndex) => {
    const rowIndex = 6 + keyIndex;

    const betweenValues =
      value.count +
      data.groupValues[keyIndex].firstSession.in -
      data.groupValues[keyIndex].firstSession.out;

    // WED/THU
    setCell(ws, `AN${rowIndex}`, value.count);
    setCell(ws, `AO${rowIndex}`, data.groupValues[keyIndex].firstSession.in);
    setCell(ws, `AP${rowIndex}`, data.groupValues[keyIndex].firstSession.out);
    setCell(ws, `AQ${rowIndex}`, betweenValues);

    // SAT/SUN
    setCell(ws, `AR${rowIndex}`, betweenValues);
    setCell(ws, `AS${rowIndex}`, data.groupValues[keyIndex].secondSession.in);
    setCell(ws, `AT${rowIndex}`, data.groupValues[keyIndex].secondSession.out);
    setCell(ws, `AU${rowIndex}`, data.newSNumber[keyIndex].count);
  });

  const totalSNumber = data.sNumber.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const totalNewSNumber = data.newSNumber.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  // S NUMBER TOTALS
  setCell(ws, `AN26`, totalSNumber);
  setCell(ws, `AQ26`, totalNewSNumber);

  // HEADERS

  if (data.info) {
    // Distrito
    setCell(ws, "V1", data.info?.distrito || "", { fontSize: 12 });
    // Lokal
    setCell(ws, "V2", data.info?.lokal || "", { fontSize: 12 });
    // Distrito Code
    setCell(ws, "AC1", data.info?.distritoCode || "", { fontSize: 12 });
    // Lokal Code
    setCell(ws, "AC2", data.info?.lokalCode || "", { fontSize: 12 });

    // Purok
    setCell(ws, "AI1", data.info?.purok || "", { fontSize: 12 });
    // Week
    setCell(ws, "AL2", data.info?.week || "", { fontSize: 12 });
    // Month
    setCell(ws, "AO2", data.info?.month || "", { fontSize: 12 });
  }

  // --- Save back to same file ---
  const stream = await workbook.xlsx.writeBuffer();
  const updatedBase64 = Buffer.from(stream).toString("base64");
  await FileSystem.writeAsStringAsync(fileUri, updatedBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const generatedFileName = generatePercentFileName(data);
  const outputUri = await copyExcelToDownloads(fileUri, generatedFileName);

  console.log("✅ Excel data plotted (including code totals):", outputUri);

  if (!outputUri) {
    alert("Error output file");
    return null;
  }

  return outputUri;
};
