import { View, StyleSheet, Text } from "react-native";
import WeatherWheel from "./WeatherWheel";
import { NobsWeather } from "@/types/NobsWeather";
import { useEffect, useState } from "react";
import { weatherService } from "@/services/api/weatherService";
import OpenMeteoCodeToWeatherAPIIcon from "@/constants/OpenMeteoCodeToWeatherAPIIcon";
import { City } from "@/services/api/cityService";
import { useCityTime } from "@/hooks/useCityTime";

const initialNobsWeather: NobsWeather = {
  name: "",
  icon: "",
  temp: 0,
  uv: 0,
  aqi: 0,
  nextTemp: "-",
  nextUV: "-",
};

interface NobsLocationProps {
  city: City;
}

export const NobsLocation = ({ city }: NobsLocationProps) => {
  const [rawData, setRawData] = useState<NobsWeather>(initialNobsWeather);
  const time: string = useCityTime(city.timezone).split(" ").join("").toLocaleLowerCase();
  // TODO: fetch location from API or storage

  const getData = async (apiUrl: string, apiKey: string) => {
    return weatherService(apiUrl);
  };

  useEffect(() => {
    const openMeteoUrl = process.env.EXPO_PUBLIC_OPEN_METEO_URL;
    // is unauthenticated
    if (openMeteoUrl) {
      const fullUrl = `${openMeteoUrl}/?latitude=${city.location.lat}&longitude=${city.location.lon}&current=apparent_temperature,weather_code,uv_index&hourly=apparent_temperature,uv_index&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_hours=4&timezone=America%2FNew_York`;
      getData(fullUrl, "").then((data) => {
        // console.log(data.hourly.apparent_temperature[3]);
        // For now just do this manipulation here, can move to transformer later if it gets more complicated
        const weatherCode = data.current.weather_code as keyof typeof OpenMeteoCodeToWeatherAPIIcon;
        console.log(`Weather code: ${weatherCode}`);
        const icon = `//cdn.weatherapi.com/weather/64x64/day/${OpenMeteoCodeToWeatherAPIIcon[weatherCode].icon}.png`;
        const feelsLike = Math.round(data.current.apparent_temperature);
        const uv = Math.round(data.current.uv_index);
        const nextFeelsLike = Math.round(data.hourly.apparent_temperature[3]).toFixed();
        const nextUV = Math.round(data.hourly.uv_index[3]).toFixed();
        // console.log(nextFeelsLike, nextUV);

        setRawData((prevRawData) => ({
          ...prevRawData,
          ...{ temp: feelsLike, icon: icon, uv: uv, nextTemp: nextFeelsLike, nextUV: nextUV },
        }));
      });
    } else {
      console.error("Open Meteo API URL is not defined");
    }

    // Add air quality data
    const openMeteoAQIUrl = process.env.EXPO_PUBLIC_OPEN_METEO_AQI_URL;
    if (openMeteoAQIUrl) {
      const fullUrl = `${openMeteoAQIUrl}/?latitude=${city.location.lat}&longitude=${city.location.lon}&current=us_aqi`;
      getData(fullUrl, "").then((data) => {
        const aqi = data.current.us_aqi;
        setRawData((prevRawData) => ({
          ...prevRawData,
          ...{ aqi: aqi },
        }));
      });
    } else {
      console.error("Open Meteo AQI API URL is not defined");
    }

    // console.log(getLoadedFonts());
  }, []);

  if (!rawData || rawData === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{city.name}</Text>
      <Text style={styles.time}>{time}</Text>
      <WeatherWheel data={rawData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 40,
    boxShadow: "0 0 8px rgba(0, 0, 0, 0.4)",
  },
  title: {
    fontSize: 20,
  },
  time: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
