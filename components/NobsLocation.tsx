import { View, StyleSheet, Text, Pressable } from "react-native";
import { SymbolView } from "expo-symbols";
import WeatherWheel from "./WeatherWheel";
import { NobsWeather } from "@/types/NobsWeather";
import { useEffect, useState } from "react";
import { weatherService } from "@/services/api/weatherService";
import OpenMeteoCodeToWeatherAPIIcon from "@/constants/OpenMeteoCodeToWeatherAPIIcon";
import { useCityTime } from "@/hooks/useCityTime";
import { NobsCity } from "@/types/NobsCity";

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
  city: NobsCity;
  isPinned?: boolean;
  onPin: Function;
  onDelete: Function;
}

export const NobsLocation = ({ city, isPinned = false, onPin, onDelete }: NobsLocationProps) => {
  const [rawData, setRawData] = useState<NobsWeather>(initialNobsWeather);
  const time: string = useCityTime(city.timezone).split(" ").join("").toLocaleLowerCase();

  const scaleFactor = isPinned ? 0.9 : 0.7;

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
    <View
      style={[
        styles.container,
        {
          width: 215 * scaleFactor, // Adjust width dynamically
          height: 250 * scaleFactor,
        },
      ]}
    >
      <View style={[styles.scaledContent, { transform: [{ scale: scaleFactor }] }, isPinned ? styles.pinned : styles.notPinned]}>
        <Pressable style={styles.pin} onPress={() => onPin(city)}>
          <SymbolView name="mappin" size={18} />
        </Pressable>
        <Pressable style={styles.delete} onPress={() => onDelete(city)}>
          <SymbolView name="trash" size={18} />
        </Pressable>

        <Text style={styles.title}>{city.name}</Text>
        <Text style={styles.time}>{time}</Text>
        <WeatherWheel data={rawData} isPinned={isPinned} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    padding: 5, // Keep padding consistent
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 30,
    shadowColor: "#000", // Fix for shadows in React Native
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5, // Android shadow
  },
  scaledContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Keep layout consistent
  },
  pinned: {
    // backgroundColor: "rgba(182, 26, 26, 0.8)",
  },
  notPinned: {
    width: "140%", // hacks to make the scaling happen
    height: "140%",
  },
  pin: {
    position: "absolute",
    top: 5,
    left: 10,
  },
  delete: {
    position: "absolute",
    top: 5,
    right: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  time: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
