export const mockResponse = {
  latitude: 29.622206,
  longitude: -82.40665,
  generationtime_ms: 0.27930736541748047,
  utc_offset_seconds: -18000,
  timezone: "America/New_York",
  timezone_abbreviation: "GMT-5",
  elevation: 24.0,
  current_units: {
    time: "iso8601",
    interval: "seconds",
    apparent_temperature: "°F",
    weather_code: "wmo code",
    uv_index: "",
  },
  current: {
    time: "2025-02-13T15:45",
    interval: 900,
    apparent_temperature: 85.6,
    weather_code: 1,
    uv_index: 3.45,
  },
  hourly_units: {
    time: "iso8601",
    apparent_temperature: "°F",
    uv_index: "",
  },
  hourly: {
    time: ["2025-02-13T15:00", "2025-02-13T16:00", "2025-02-13T17:00", "2025-02-13T18:00"],
    apparent_temperature: [85.0, 84.3, 82.2, 80.5],
    uv_index: [4.6, 3.2, 1.65, 0.5],
  },
} as const;
