import { getSessionAbsentees } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { generateSessionHtml } from "@/utils/generate";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const useAbsentViewer = (purok: string) => {
  const [sessionData, setSessionData] = useState<User.SessionData[]>([]);

  const db = useSQLiteContext();

  const initFetch = async () => {
    try {
      const sessionResult = await getSessionAbsentees(purok, db);

      setSessionData(sessionResult);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sessionData,
    createSessionPdf,
  };
};
