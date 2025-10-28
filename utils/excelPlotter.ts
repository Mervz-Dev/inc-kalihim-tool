import { ALL_SESSION_CODES, ALPHABET_CODES } from "@/constants/percent";
import { Percent } from "@/types/percent";
import { Buffer } from "buffer";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { generatePercentFileName } from "./generate";
import { roundDecimal } from "./number";

export const plotPercentToExcel = async (
  data: Percent.ComputedPercent,
  prevData?: Percent.ComputedPercent
): Promise<string | null> => {
  const ExcelJS = await import("exceljs");
  const asset = Asset.fromModule(require("@/assets/forms/R1-04-Form.xlsx"));
  await asset.downloadAsync();

  const generatedFileName = generatePercentFileName(data);

  const fileUri = FileSystem.documentDirectory + `${generatedFileName}.xlsx`;
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

  // Main R1-04 Form
  const r104ws = workbook.worksheets[0];

  // --- Helper ---
  const setCell = (ws: any, address: string, value: any) => {
    const cell = ws.getCell(address);
    cell.value = value ?? 0;
  };

  // --- Start plotting ---
  const startRow = 8;

  data.groupValues.forEach((group, idx) => {
    const row = startRow + idx;

    // Column A = group number
    setCell(r104ws, `A${row}`, group.group);

    // KABUUAN
    setCell(
      r104ws,
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
    ALL_SESSION_CODES.forEach((key, keyIndex) => {
      const colLetter = String.fromCharCode("B".charCodeAt(0) + keyIndex);

      if (key === "m") {
        setCell(r104ws, `${colLetter}${row}`, 0);
      } else {
        setCell(r104ws, `${colLetter}${row}`, group.firstSession[key]);
      }
    });

    // --- Second Session (Columns T–AG)
    ALL_SESSION_CODES.forEach((key, keyIndex) => {
      const colIndex = 20 + keyIndex; // T=20
      const colLetter = r104ws.getColumn(colIndex).letter;

      if (key === "m") {
        setCell(r104ws, `${colLetter}${row}`, 0);
      } else {
        setCell(r104ws, `${colLetter}${row}`, group.secondSession[key]);
      }
    });
  });

  // --- Plot First Session Code Totals (B39–S39)
  const totalRow = 39;
  ALL_SESSION_CODES.forEach((key, keyIndex) => {
    const colLetter = String.fromCharCode("B".charCodeAt(0) + keyIndex);
    setCell(r104ws, `${colLetter}${totalRow}`, data.firstSessionCodeTotal[key]);
  });

  // --- Plot Second Session Code Totals (T39–AK39)
  ALL_SESSION_CODES.forEach((key, keyIndex) => {
    const colIndex = 20 + keyIndex; // T = 20
    const colLetter = r104ws.getColumn(colIndex).letter;
    setCell(
      r104ws,
      `${colLetter}${totalRow}`,
      data.secondSessionCodeTotal[key]
    );
  });

  // TOTAL PERCENTAGE
  setCell(r104ws, `AL39`, data.overAllPercentage);

  data.sNumber.forEach((value, keyIndex) => {
    const rowIndex = 8 + keyIndex;

    const firstValues =
      value.count +
      data.groupValues[keyIndex].firstSession.in -
      data.groupValues[keyIndex].firstSession.out;

    const secondValues =
      firstValues +
      data.groupValues[keyIndex].secondSession.in -
      data.groupValues[keyIndex].secondSession.out;

    // WED/THU
    setCell(r104ws, `AN${rowIndex}`, value.count);
    setCell(r104ws, `AO${rowIndex}`, value.count);
    setCell(
      r104ws,
      `AP${rowIndex}`,
      data.groupValues[keyIndex].firstSession.in
    );
    setCell(
      r104ws,
      `AQ${rowIndex}`,
      data.groupValues[keyIndex].secondSession.in
    );
    setCell(
      r104ws,
      `AR${rowIndex}`,
      data.groupValues[keyIndex].firstSession.out
    );
    setCell(
      r104ws,
      `AS${rowIndex}`,
      data.groupValues[keyIndex].secondSession.out
    );

    setCell(r104ws, `AT${rowIndex}`, firstValues);
    setCell(r104ws, `AU${rowIndex}`, secondValues);
  });

  const totalSNumber = data.sNumber.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const firstSessionTotalSNumber =
    totalSNumber +
    data.firstSessionCodeTotal.in -
    data.firstSessionCodeTotal.out;
  const secondSessionTotalSNumber =
    firstSessionTotalSNumber +
    data.secondSessionCodeTotal.in -
    data.secondSessionCodeTotal.out;

  // S NUMBER TOTALS
  setCell(r104ws, `AN39`, totalSNumber);
  setCell(r104ws, `AO39`, totalSNumber);

  setCell(r104ws, `AP39`, data.firstSessionCodeTotal.in);
  setCell(r104ws, `AQ39`, data.secondSessionCodeTotal.in);

  setCell(r104ws, `AR39`, data.firstSessionCodeTotal.out);
  setCell(r104ws, `AS39`, data.secondSessionCodeTotal.out);

  setCell(r104ws, `AT39`, firstSessionTotalSNumber);
  setCell(r104ws, `AU39`, secondSessionTotalSNumber);

  // HEADERS

  if (data.info) {
    // Distrito
    setCell(r104ws, "AE2", data.info?.distrito || "");
    // Lokal
    setCell(r104ws, "AE1", data.info?.lokal || "");
    // Distrito Code
    setCell(r104ws, "AK2", data.info?.distritoCode || "");
    // Lokal Code
    setCell(r104ws, "AK1", data.info?.lokalCode || "");

    // Purok
    setCell(r104ws, "AL2", data.info?.purok || "");
    // Week
    setCell(r104ws, "AN2", data.info?.week || "");
    // Month
    setCell(r104ws, "AQ2", data.info?.month || "");
    // Year
    setCell(r104ws, "AU2", data.info?.year || "");
  }

  // Weekly Monitoring Report

  const wmrws = workbook.worksheets[1];

  //  M/H
  ALPHABET_CODES.forEach((key, ki) => {
    const rowIndex = 6 + ki;
    setCell(wmrws, `G${rowIndex}`, data.firstSessionCodeTotal[key]);
  });

  //  S/L
  ALPHABET_CODES.forEach((key, ki) => {
    const rowIndex = 6 + ki;
    setCell(wmrws, `I${rowIndex}`, data.secondSessionCodeTotal[key]);
  });

  // Others
  setCell(wmrws, `G20`, data.firstSessionCodeTotal.totalCoded);
  setCell(wmrws, `I20`, data.secondSessionCodeTotal.totalCoded);

  setCell(wmrws, `G21`, firstSessionTotalSNumber);
  setCell(wmrws, `I21`, secondSessionTotalSNumber);

  setCell(wmrws, `G22`, data.firstSessionCodeTotal.percent);
  setCell(wmrws, `I22`, data.secondSessionCodeTotal.percent);

  setCell(wmrws, `G23`, data.overAllPercentage);

  setCell(wmrws, "C2", data.info?.lokal || "");

  setCell(wmrws, "I2", data.info?.week || "");
  setCell(wmrws, "R2", data.info?.dateString || "");

  setCell(wmrws, "L5", data.info?.purok || "");

  setCell(wmrws, "R5", data.groupValues.length || "");

  data.groupValues.forEach((value, index) => {
    const hasNoPrevData = !prevData;
    const thisWeekPercentage =
      roundDecimal(
        (value.firstSession.percent! + value.secondSession.percent!) / 2
      ) || 0;

    const lastWeekPercentage =
      roundDecimal(
        ((prevData?.groupValues[index].firstSession?.percent || 0) +
          (prevData?.groupValues[index].secondSession?.percent || 0)) /
          2
      ) || 0;

    const differencePercentage = roundDecimal(
      thisWeekPercentage - lastWeekPercentage
    );
    let diffValue =
      differencePercentage > 0
        ? `↑ +${differencePercentage}%`
        : `↓ ${differencePercentage}%`;

    if (differencePercentage === 0) {
      diffValue = "";
    }

    if (index < 15) {
      let rowIndex = 28 + index;
      setCell(wmrws, `A${rowIndex}`, data.newSNumber[index].group);
      setCell(wmrws, `B${rowIndex}`, data.newSNumber[index].count);
      setCell(wmrws, `E${rowIndex}`, thisWeekPercentage);
      setCell(wmrws, `D${rowIndex}`, hasNoPrevData ? "" : lastWeekPercentage);
      setCell(wmrws, `H${rowIndex}`, hasNoPrevData ? "" : diffValue);
    } else {
      let rowIndex = 28 + index - 15;

      setCell(wmrws, `K${rowIndex}`, data.newSNumber[index].group);
      setCell(wmrws, `M${rowIndex}`, data.newSNumber[index].count);
      setCell(wmrws, `Q${rowIndex}`, thisWeekPercentage);
      setCell(wmrws, `N${rowIndex}`, hasNoPrevData ? "" : lastWeekPercentage);

      setCell(wmrws, `U${rowIndex}`, hasNoPrevData ? "" : diffValue);
    }
  });

  // --- Save back to same file ---
  const stream = await workbook.xlsx.writeBuffer();
  const updatedBase64 = Buffer.from(stream).toString("base64");
  await FileSystem.writeAsStringAsync(fileUri, updatedBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log("✅ Excel data plotted (including code totals):", fileUri);

  if (!fileUri) {
    alert("Error output file");
    return null;
  }

  // from internal documents uri
  return fileUri;
};
