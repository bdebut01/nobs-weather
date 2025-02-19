import { View, StyleSheet } from "react-native";

import { NobsLocation } from "@/components/NobsLocation";
import { LatLong } from "@/types/LatLong";
import { City, cityService } from "@/services/api/cityService";
import { useEffect, useState } from "react";

export default function Index() {
  const [cities, setCities] = useState<City[]>([]);

  // fetch all user data and create grid of NobsLocations
  const location: LatLong = {
    lat: 29.632886070164513,
    lon: -82.39023208593309,
  };

  // fetch cities from API
  useEffect(() => {
    cityService().then((data) => {
      setCities(data);
      console.log("set cities data");
    });
  }, []);

  if (cities.length === 0) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <NobsLocation city={cities[0]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CEECF2",
  },
});
