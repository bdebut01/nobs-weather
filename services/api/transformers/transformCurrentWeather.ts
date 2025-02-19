import { Pollutant } from "@/types/AQIPollutant";
import { calculateAQI } from "./calculateAQI";
import { WeatherAPICurrent } from "@/types/weatherapi/WeatherAPICurrent";
import { NobsWeather } from "@/types/NobsWeather";

export const transformCurrentWeather = (data: WeatherAPICurrent): NobsWeather | undefined => {
  // Bail if data is empty object
  console.log(data);
  if (Object.keys(data).length === 0) {
    return undefined;
  }

  const pollutantData: Record<Pollutant, number> = {
    co: data.current.air_quality.co,
    no2: data.current.air_quality.no2,
    o3: data.current.air_quality.o3,
    so2: data.current.air_quality.so2,
    pm25: data.current.air_quality.pm2_5,
    pm10: data.current.air_quality.pm10,
  };

  let maxAQI = 0;
  //   let mainPollutant: Pollutant = "pm25";
  for (const [pollutant, concentration] of Object.entries(pollutantData)) {
    const aqi = calculateAQI(pollutant as Pollutant, concentration);
    if (aqi > maxAQI) {
      maxAQI = aqi;
      //   mainPollutant = pollutant as Pollutant;
    }
  }

  return {
    name: data.location.name, // tood: duplicate city names in user storage, append region/state
    icon: data.current.condition.icon,
    // temp: Math.round(data.current.feelslike_f),
    temp: 0,
    uv: Math.round(data.current.uv),
    aqi: maxAQI,
    nextTemp: "-", // todo
    nextUV: "-", // todo
  };
};
