import { Link } from "expo-router";
import WeatherWheel from "@/components/WeatherWheel";
import { View, Text, StyleSheet } from "react-native";
import { WeatherLocation } from "@/types/WeatherLocation";
import { LatLong } from "@/types/LatLong";
import { weatherService } from "@/services/api/weatherService";
import { useEffect, useState } from "react";
import { transformCurrentWeather } from "@/services/api/transformers/transformCurrentWeather";
import { NobsWeather } from "@/types/nobsWeather";

export default function Index() {
  const [rawData, setRawData] = useState<NobsWeather | undefined>(undefined);
  // TODO: fetch weather data from API
  const location: LatLong = {
    lat: 29.6516,
    lon: -82.3248,
  };

  const getData = async () => {
    return weatherService(location);
  };

  useEffect(() => {
    getData().then((data) => {
      setRawData(transformCurrentWeather(data));
    });
  }, []);

  return (
    <View style={styles.container}>
      {rawData != undefined && <WeatherWheel data={rawData} />}
      {rawData === undefined && <Text>Loading...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
