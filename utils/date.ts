import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
import { DateType } from "react-native-ui-datepicker";

dayjs.extend(weekday);
dayjs.extend(isoWeek);

export const getWeekWedToSun = (
  weekType: "current" | "previous" = "current"
) => {
  const today = dayjs();

  const baseWeek = weekType === "previous" ? today.subtract(1, "week") : today;

  const endDate = baseWeek.isoWeekday(7);
  const startDate = endDate.isoWeekday(3);

  return {
    startDate: startDate as DateType,
    endDate: endDate as DateType,
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

export const getWeekdayBetween = (
  startDate?: DateType | null,
  endDate?: DateType | null,
  targetWeekday: number = 7 // default: Sunday
) => {
  if (!startDate || !endDate) return null;

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid()) return null;

  let current = start.startOf("day");

  while (current.isBefore(end) || current.isSame(end, "day")) {
    if (current.isoWeekday() === targetWeekday) {
      return {
        hasWeekday: true,
        date: current, // actual date (dayjs)
        dayNumber: current.date(), // e.g. 30
        day: current.format("dddd"), // e.g. "Thursday"
        month: current.format("MMM"), // e.g. "Oct"
        year: current.year(), // e.g. 2025
      };
    }
    current = current.add(1, "day");
  }

  return {
    hasWeekday: false,
    date: null,
    dayNumber: null,
    day: null,
    month: null,
    year: null,
  };
};
