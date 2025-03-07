import citiesData from "@/assets/data/us-cities.json";
import timezoneMap from "@/assets/data/timezone-map.json";
import { NobsCity } from "@/types/NobsCity";

/**
 * For now, cities are stored in a JSON file so are only processed into usable objects in here. In the future, this could be replaced with a call to an API.
 * @returns City[]
 */
export const cityService = async (): Promise<NobsCity[]> => {
  const cities: NobsCity[] = [];
  for (const city of citiesData) {
    cities.push({
      name: city.name,
      stateAbbr: city.state,
      location: {
        lat: city.lat,
        lon: city.lon,
      },
      isPinned: false,
      timezone: timezoneMap[city.tz],
    });
  }
  return cities;
};
