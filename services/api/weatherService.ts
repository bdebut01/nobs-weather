import axios from "axios";
import { mockResponse as mockWeatherAPIResponse } from "./mock-data/mockWeatherAPIResponse";
import { mockResponse as mockOpenMeteoResponse } from "./mock-data/mockOpenMeteoResponse";
import { mockResponse as mockAirQualityResponse } from "./mock-data/mockOpenMeteoAQIResponse";

const MOCK_RESPONSE = false;

export const weatherService = async (apiUrl: string): Promise<any> => {
  try {
    let data: any;

    if (MOCK_RESPONSE) {
      console.log("Using mock response for url: " + apiUrl.split("https://")[1]);
      if (apiUrl.includes("weatherapi")) {
        data = mockWeatherAPIResponse;
      } else if (apiUrl.includes("air-quality")) {
        data = mockAirQualityResponse;
      } else {
        data = mockOpenMeteoResponse;
      }
    } else {
      console.log(`Fetching weather data from ${apiUrl}`);
      const response = await axios.get(apiUrl);
      data = response.data;
    }

    return data;
  } catch (error: any) {
    console.error(error.toJSON());
    return error;
  }
};
