// TODO: store api key in .env file
import { WeatherLocation } from "@/types/WeatherLocation";
import axios from "axios";
import mockResponse from "./mockResponse";
import { transformCurrentWeather } from "./transformers/transformCurrentWeather";
import { WeatherAPICurrent } from "@/types/weatherapi/WeatherAPICurrent";
import { LatLong } from "@/types/LatLong";

const INCLUDE_AQI = true;
const MOCK_RESPONSE = true;

export const weatherService = async (location: WeatherLocation | LatLong): Promise<any> => {
  try {
    let data: WeatherAPICurrent;

    if (MOCK_RESPONSE) {
      console.log("Using mock response");
      data = mockResponse;
    } else {
      const apiUrl = process.env.EXPO_PUBLIC_WEATHER_API_URL;
      const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;

      // q param is `{latitude},{longitude}`
      const url = `${apiUrl}/current.json?q=${location.lat},${location.lon}${INCLUDE_AQI ? "&aqi=yes" : ""}&key=${apiKey}`;

      console.log(`Fetching weather data from ${url}`);
      const response = await axios.get(url);
      data = response.data;
    }

    return data;
  } catch (error) {
    console.error(error);
  }
};
