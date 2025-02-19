import { LatLong } from "@/types/LatLong";
import citiesData from "@/assets/data/us-cities.json";
import timezoneMap from "@/assets/data/timezone-map.json";

export interface City {
  name: string;
  stateAbbr: string;
  location: LatLong;
  timezone: string;
}

/**
 * For now, cities are stored in a JSON file so are only processed into usable objects in here. In the future, this could be replaced with a call to an API.
 * @returns City[]
 */
export const cityService = async (): Promise<City[]> => {
  const cities: City[] = [];
  for (const city of citiesData) {
    cities.push({
      name: city.name,
      stateAbbr: city.state,
      location: {
        lat: city.lat,
        lon: city.lon,
      },
      timezone: timezoneMap[city.tz],
    });
  }
  return cities;
};
