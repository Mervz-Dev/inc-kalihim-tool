import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import { DateType } from "react-native-ui-datepicker";

dayjs.extend(weekday);
dayjs.extend(isoWeek);

export const getPreviousWeekWedToSun = () => {
  const today = dayjs();

  const prevWeekSun = today.subtract(1, "week").isoWeekday(7);

  const prevWeekWed = prevWeekSun.isoWeekday(3);

  return {
    startDate: prevWeekWed as DateType,
    endDate: prevWeekSun as DateType,
  };
};

export const getNumberOfWeeks = (date: DateType): number => {
  const d = dayjs(date);
  return d.isoWeek();
};

export const getRangeTextFormat = (startDate: DateType, endDate: DateType) => {
  if (!startDate || !endDate) return "";
  const start = dayjs(startDate).format("MMM D");
  const end = dayjs(endDate).format("MMM D");

  return `${start} – ${end}`;
};

export const getYearFromDate = (date: DateType): number => {
  return dayjs(date).year();
};

export const formatFullDate = (date: DateType): string => {
  return dayjs(date).format("MMM D, YYYY");
};
