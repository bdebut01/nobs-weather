import { LatLong } from "@/types/LatLong";
import citiesData from "@/assets/data/us-cities.json";

export interface City {
  name: string;
  stateAbbr: string;
  location: LatLong;
  timezone: string;
}

const CITY_DATA_FILEPATH = "assets/data/us-cities.json";

/**
 * For now, cities are stored in a JSON file so are only processed into usable objects in here. In the future, this could be replaced with a call to an API.
 * @returns City[]
 */
export const cityService = async (): Promise<City[]> => {
  const cities: City[] = [];
  for (const city of citiesData) {
    cities.push({
      name: city.name,
      stateAbbr: city["admin1"],
      location: {
        lat: city.latitude,
        lon: city.longitude,
      },
      timezone: city.timezone,
    });
  }
  return cities;
};
