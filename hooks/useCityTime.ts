import { useMemo } from "react";

const convertToCityTime = (timezone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 24-hour format
  }).format(new Date());
};

// Memoized version for performance
export const useCityTime = (timezone: string) => {
  return convertToCityTime(timezone);
};
