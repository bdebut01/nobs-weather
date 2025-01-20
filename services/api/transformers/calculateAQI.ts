import { AQI_BREAKPOINTS } from "@/constants/AQIConstants";
import { Pollutant } from "@/types/AQIPollutant";

const convertToPpm = (micrograms: number, conversionFactor: number): number => {
  return micrograms / conversionFactor;
};

const convertToPpb = (micrograms: number, conversionFactor: number): number => {
  return micrograms / conversionFactor;
};

/**
 * Note for weatherapi we need to convert to ppm/ppb for a few fields
 * If ever switching to different provider check units!
 * @param pollutant
 * @param concentration
 * @returns
 */
export const calculateAQI = (pollutant: Pollutant, concentration: number): number => {
  // Apply conversions based on pollutant
  switch (pollutant) {
    case "co":
      concentration = convertToPpm(concentration, 1240); // µg/m³ -> ppm
      break;
    case "o3":
      concentration = convertToPpm(concentration, 2000); // µg/m³ -> ppm
      break;
    case "no2":
      concentration = convertToPpb(concentration, 1.88); // µg/m³ -> ppb
      break;
    case "so2":
      concentration = convertToPpb(concentration, 2.62); // µg/m³ -> ppb
      break;
    // PM2.5 and PM10 are already in µg/m³, no conversion needed
  }

  // Get AQI breakpoints for the pollutant
  const breakpoints = AQI_BREAKPOINTS[pollutant];
  if (!breakpoints) {
    throw new Error(`Unknown pollutant: ${pollutant}`);
  }

  // Find the AQI range and calculate AQI
  for (const { C_low, C_high, I_low, I_high } of breakpoints) {
    if (concentration >= C_low && concentration <= C_high) {
      return Math.round(((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low);
    }
  }

  return -1; // If concentration is out of range
};
