import { getUserAttendance } from "@/services/sql-lite/db";
import { User } from "@/types/user";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";

export const useAttendanceViewer = (purok: string) => {
  const [attendanceData, setAttendanceData] = useState<User.AttendanceData[]>(
    []
  );

  const db = useSQLiteContext();

  const initFetch = async () => {
    try {
      const attendanceResult = await getUserAttendance(purok, db);

      setAttendanceData(attendanceResult);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    initFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    attendanceData,
  };
};
