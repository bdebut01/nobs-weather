import { NobsCity } from "@/types/NobsCity";

export const citiesAreEqual = (city1: NobsCity, city2: NobsCity): boolean => {
  return city1.name === city2.name && city1.stateAbbr === city2.stateAbbr && city1.location.lat === city2.location.lat && city1.location.lon === city2.location.lon && city1.timezone === city2.timezone;
};
