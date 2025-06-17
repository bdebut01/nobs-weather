import { View, StyleSheet, ScrollView, Animated, TouchableOpacity, Text, Keyboard, Modal, Image, RefreshControl } from "react-native";
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
  const [showHelp, setShowHelp] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      toValue: isExpanded ? 50 : 600,
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCities(), loadPinnedCity()]);
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOBS Weather</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => setShowHelp(true)}>
          <Text style={styles.helpButtonText}>❔</Text>
        </TouchableOpacity>
      </View>

      {pinnedCity || cities.length > 0 ? (
        <ScrollView style={styles.mainScrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={["#fff"]} progressBackgroundColor={colors.DEPTH_TWO} />}>
          {pinnedCity && (
            <View style={styles.pinnedContainer}>
              <NobsLocation isPinned={true} city={pinnedCity} onPin={onRemovePin} onDelete={onDeleteCity} />
            </View>
          )}

          <View style={styles.citiesContainer}>
            <View style={styles.allCitiesContainer}>
              {cities.map((city) => (
                <NobsLocation key={`${city.name}-${city.stateAbbr}`} city={city} onPin={onPinCity} onDelete={onDeleteCity} />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Add a city via the bar at the bottom!</Text>
        </View>
      )}

      <Modal animationType="fade" transparent={true} visible={showHelp} onRequestClose={() => setShowHelp(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHelp(false)}>
          <View style={styles.modalContent}>
            <Image source={require("../assets/images/explainer.png")} style={styles.explainerImage} resizeMode="contain" />
          </View>
        </TouchableOpacity>
      </Modal>

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
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: colors.DEPTH_ZERO,
  },
  header: {
    width: "100%",
    height: 44,
    backgroundColor: colors.DEPTH_ZERO,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  pinnedContainer: {
    position: "relative",
    width: "90%",
    padding: 15,
    alignSelf: "center",
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
  mainScrollView: {
    flex: 1,
    width: "100%",
  },
  citiesContainer: {
    width: "90%",
    alignSelf: "center",
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
  helpButton: {
    position: "absolute",
    top: 6, // Center vertically in header (44 - 32) / 2
    right: 18,
    zIndex: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.DEPTH_TWO,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  helpButtonText: {
    fontSize: 16,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  explainerImage: {
    width: "75%",
    height: undefined,
    aspectRatio: 1,
  },
  emptyStateContainer: {
    width: "90%",
    alignSelf: "center",
    paddingVertical: 40,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    padding: 30,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  emptyStateText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
