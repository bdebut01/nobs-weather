// Determined by EPA
// See https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf
export const AQI_BREAKPOINTS = {
  o3: [
    { C_low: 0.0, C_high: 0.054, I_low: 0, I_high: 50 },
    { C_low: 0.055, C_high: 0.07, I_low: 51, I_high: 100 },
    { C_low: 0.071, C_high: 0.085, I_low: 101, I_high: 150 },
    { C_low: 0.086, C_high: 0.105, I_low: 151, I_high: 200 },
    { C_low: 0.106, C_high: 0.2, I_low: 201, I_high: 300 },
    { C_low: 0.201, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
  pm25: [
    { C_low: 0.0, C_high: 9.0, I_low: 0, I_high: 50 },
    { C_low: 9.1, C_high: 35.4, I_low: 51, I_high: 100 },
    { C_low: 35.5, C_high: 55.4, I_low: 101, I_high: 150 },
    { C_low: 55.5, C_high: 125.4, I_low: 151, I_high: 200 },
    { C_low: 125.5, C_high: 225.4, I_low: 201, I_high: 300 },
    { C_low: 225.5, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
  pm10: [
    { C_low: 0, C_high: 54, I_low: 0, I_high: 50 },
    { C_low: 55, C_high: 154, I_low: 51, I_high: 100 },
    { C_low: 155, C_high: 254, I_low: 101, I_high: 150 },
    { C_low: 255, C_high: 354, I_low: 151, I_high: 200 },
    { C_low: 355, C_high: 424, I_low: 201, I_high: 300 },
    { C_low: 425, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
  co: [
    { C_low: 0.0, C_high: 4.4, I_low: 0, I_high: 50 },
    { C_low: 4.5, C_high: 9.4, I_low: 51, I_high: 100 },
    { C_low: 9.5, C_high: 12.4, I_low: 101, I_high: 150 },
    { C_low: 12.5, C_high: 15.4, I_low: 151, I_high: 200 },
    { C_low: 15.5, C_high: 30.4, I_low: 201, I_high: 300 },
    { C_low: 30.5, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
  so2: [
    { C_low: 0, C_high: 35, I_low: 0, I_high: 50 },
    { C_low: 36, C_high: 75, I_low: 51, I_high: 100 },
    { C_low: 76, C_high: 185, I_low: 101, I_high: 150 },
    { C_low: 186, C_high: 304, I_low: 151, I_high: 200 },
    { C_low: 305, C_high: 604, I_low: 201, I_high: 300 },
    { C_low: 605, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
  no2: [
    { C_low: 0, C_high: 53, I_low: 0, I_high: 50 },
    { C_low: 54, C_high: 100, I_low: 51, I_high: 100 },
    { C_low: 101, C_high: 360, I_low: 101, I_high: 150 },
    { C_low: 361, C_high: 649, I_low: 151, I_high: 200 },
    { C_low: 650, C_high: 1249, I_low: 201, I_high: 300 },
    { C_low: 1250, C_high: Infinity, I_low: 301, I_high: 500 },
  ],
};
