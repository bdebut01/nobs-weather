import { Link } from "expo-router";
import WeatherWheel from "@/components/WeatherWheel";
import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  const data = {
    currentIcon: "🌞",
    currentTemp: 70,
    currentUV: 5,
    aqi: 25,
    nextTemp: 75,
    nextUV: 6,
  };
  return (
    <View style={styles.container}>
      <WeatherWheel location="Gainesville" data={data} />
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
