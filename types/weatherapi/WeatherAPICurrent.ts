import { WeatherAPILocation } from "./WeatherAPILocation";

export interface WeatherAPICurrent {
  location: WeatherAPILocation;
  // incomplete listing of properties
  current: {
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      pm10: number;
      pm2_5: number;
      so2: number;
    };
    feelslike_f: number;
    uv: number;
    condition: {
      text: string;
      icon: string; // eg: "//cdn.weatherapi.com/weather/64x64/day/113.png"
    };
  };
}
