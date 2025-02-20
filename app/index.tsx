import { View, StyleSheet } from "react-native";

import { NobsLocation } from "@/components/NobsLocation";
import { useEffect, useState } from "react";
import CitySearch from "@/components/CitySearch";
import { NobsCity } from "@/types/NobsCity";
import StorageService from "@/services/storageService";

export default function Index() {
  const [cities, setCities] = useState<NobsCity[]>([]);

  useEffect(() => {
    const loadCities = async () => {
      const savedCities = await StorageService.getSavedCities();
      setCities(savedCities);
    };
    loadCities();
  }, []);

  const addCityToWheel = async (city: NobsCity) => {
    if (!cities.some((c) => c.name === city.name && c.stateAbbr === city.stateAbbr)) {
      setCities((prevCities) => [...prevCities, city]);
    }
  };

  return (
    <View style={styles.container}>
      {cities.map((city) => (
        <NobsLocation key={`${city.name}-${city.stateAbbr}`} city={city} />
      ))}
      <View style={styles.searchContainer}>
        <CitySearch onCitySelected={addCityToWheel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CEECF2",
  },
  searchContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    backgroundColor: "white",
  },
});
