import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Text, Keyboard } from "react-native";
import { useEffect, useState, useRef } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import GestureRecognizer from "react-native-swipe-gestures";

import { NobsLocation } from "@/components/NobsLocation";
import CitySearch from "@/components/CitySearch";
import { NobsCity } from "@/types/NobsCity";
import StorageService from "@/services/storageService";
import { citiesAreEqual } from "@/util/citiesAreEqual";
import { colors } from "@/util/colors";
import { TextInput } from "react-native-gesture-handler";

export default function Index() {
  const [cities, setCities] = useState<NobsCity[]>([]);
  const [pinnedCity, setPinnedCity] = useState<NobsCity | null>(null);
  const searchInputRef = useRef<TextInput | null>(null);

  const insets = useSafeAreaInsets();

  // Animation state for collapsible search
  const [isExpanded, setIsExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(50)).current; // Initial height

  useEffect(() => {
    loadCities();
    loadPinnedCity();
  }, []);

  useEffect(() => {
    loadCities();
  }, [pinnedCity]);

  const loadCities = async () => {
    const savedCities = await StorageService.getSavedCities();
    setCities(savedCities.filter((c) => !c.isPinned));
  };

  const loadPinnedCity = async () => {
    const pinnedCity = await StorageService.getPinnedCity();
    if (pinnedCity) {
      setPinnedCity(pinnedCity);
    }
  };

  const onPinCity = async (city: NobsCity) => {
    await StorageService.setPinnedCity(city);
    setPinnedCity(city);
  };

  const onRemovePin = async () => {
    await StorageService.setPinnedCity(null);
    setPinnedCity(null);
  };

  const onDeleteCity = async (city: NobsCity) => {
    await StorageService.removeCity(city);
    if (pinnedCity && citiesAreEqual(pinnedCity, city)) {
      setPinnedCity(null);
    } else {
      setCities((prevCities) => prevCities.filter((c) => !citiesAreEqual(c, city)));
    }
  };

  const addCityToWheel = async (city: NobsCity) => {
    if (!cities.some((c) => c.name === city.name && c.stateAbbr === city.stateAbbr)) {
      setCities((prevCities) => [...prevCities, city]);
    }
    // Collapse search bar
    toggleSearch();
  };

  // Expand/collapse search bar
  const toggleSearch = () => {
    const shouldExpand = !isExpanded;

    Animated.timing(heightAnim, {
      toValue: isExpanded ? 50 : 600, // Expand taller for dropdown space
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (shouldExpand && searchInputRef.current) {
        Keyboard.dismiss();
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 310); // Small delay to allow animation to finish before focusing
      }
    });
    setIsExpanded(shouldExpand);
  };

  return (
    <View style={styles.container}>
      {pinnedCity && (
        <View style={styles.pinnedContainer}>
          <NobsLocation isPinned={true} city={pinnedCity} onPin={onRemovePin} onDelete={onDeleteCity} />
        </View>
      )}
      <ScrollView style={styles.scrollableContainer}>
        <View style={styles.allCitiesContainer}>
          {cities.map((city) => (
            <NobsLocation key={`${city.name}-${city.stateAbbr}`} city={city} onPin={onPinCity} onDelete={onDeleteCity} />
          ))}
        </View>
      </ScrollView>

      {/* Animated Search Container */}
      <Animated.View style={[styles.searchContainer, { height: heightAnim, paddingBottom: insets.bottom }]}>
        {!isExpanded ? (
          <GestureRecognizer onSwipeUp={toggleSearch}>
            <TouchableOpacity style={styles.searchButton} onPress={toggleSearch}>
              <Text style={styles.searchText}>🔍 Search for a city…</Text>
            </TouchableOpacity>
          </GestureRecognizer>
        ) : (
          <GestureRecognizer onSwipeDown={toggleSearch}>
            <View style={styles.swipeIndicator} />
            <View style={styles.expandedSearch}>
              <SafeAreaView style={styles.fullWidth}>
                <CitySearch onCitySelected={addCityToWheel} ref={searchInputRef} />
              </SafeAreaView>
            </View>
          </GestureRecognizer>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 2,
    gap: 10,
    height: "100%",
    width: "100%",
    alignItems: "center",
    // backgroundColor: "#CEECF2",
    backgroundColor: colors.DEPTH_ZERO,
  },
  pinnedContainer: {
    width: "90%",
    padding: 15,
    // backgroundColor: colors.DEPTH_THREE,
    backgroundColor: "rgba(255, 255, 255, .4)",
    borderRadius: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  scrollableContainer: {
    flex: 1,
    width: "90%",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 60, // Ensures space for search bar
    paddingTop: 20,
    shadowColor: "#fff",
    shadowOffset: { width: -1, height: -2 },
    backgroundColor: "rgba(255, 255, 255, .2)",
  },
  allCitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    paddingBottom: 20,
  },
  searchContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    zIndex: 4,
  },
  swipeIndicator: {
    width: 80,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    marginVertical: 15,
    touchAction: "none", // Prevents conflicts
  },
  searchButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    fontSize: 16,
    color: "gray",
  },
  expandedSearch: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -50,
  },
  fullWidth: {
    width: "100%", // Ensures CitySearch takes full width
  },
});
