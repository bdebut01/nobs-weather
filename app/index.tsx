import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Keyboard, Modal, Image, RefreshControl } from "react-native";
import { useEffect, useState, useRef } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchInputRef = useRef<TextInput | null>(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadCities();
    loadPinnedCity();
  }, []);

  useEffect(() => {
    loadCities();
  }, [pinnedCity]);

  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      // Small delay to allow modal animation to complete
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [showSearchModal]);

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
    // Close search modal
    setShowSearchModal(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCities(), loadPinnedCity()]);
    // Trigger weather data refresh by incrementing the refresh trigger
    setRefreshTrigger((prev) => prev + 1);
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

      <View style={[styles.contentWrapper, { paddingBottom: insets.bottom + 80 }]}>
        <ScrollView style={styles.outerScrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={["#fff"]} progressBackgroundColor={colors.DEPTH_TWO} />} scrollEnabled={true} nestedScrollEnabled={true}>
          {pinnedCity && (
            <View style={styles.pinnedContainer}>
              <NobsLocation isPinned={true} city={pinnedCity} onPin={onRemovePin} onDelete={onDeleteCity} refreshTrigger={refreshTrigger} />
            </View>
          )}

          {cities.length > 0 ? (
            <View style={styles.citiesScrollContainer}>
              <ScrollView style={styles.citiesScrollView} nestedScrollEnabled={true} showsVerticalScrollIndicator={true} scrollEventThrottle={16}>
                <View style={styles.citiesContainer}>
                  <View style={styles.allCitiesContainer}>
                    {cities.map((city) => (
                      <NobsLocation key={`${city.name}-${city.stateAbbr}`} city={city} onPin={onPinCity} onDelete={onDeleteCity} refreshTrigger={refreshTrigger} />
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : !pinnedCity ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>Add a city using the + button!</Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <Modal animationType="fade" transparent={true} visible={showHelp} onRequestClose={() => setShowHelp(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowHelp(false)}>
          <View style={styles.modalContent}>
            <Image source={require("../assets/images/explainer.png")} style={styles.explainerImage} resizeMode="contain" />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal animationType="slide" transparent={true} visible={showSearchModal} onRequestClose={() => setShowSearchModal(false)}>
        <TouchableOpacity style={styles.searchModalOverlay} activeOpacity={1} onPress={() => setShowSearchModal(false)}>
          <TouchableOpacity style={styles.searchModalContent} activeOpacity={1} onPress={() => {}}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Add a City</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <SafeAreaView style={styles.fullWidth}>
              <CitySearch onCitySelected={addCityToWheel} ref={searchInputRef} />
            </SafeAreaView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Floating Plus Button */}
      <TouchableOpacity style={[styles.floatingButton, { bottom: insets.bottom + 20 }]} onPress={() => setShowSearchModal(true)}>
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>
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
  contentWrapper: {
    flex: 1,
    width: "100%",
  },
  outerScrollView: {
    flex: 1,
    width: "100%",
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
    marginBottom: 15,
  },
  mainScrollView: {
    flex: 1,
    width: "100%",
  },
  citiesScrollContainer: {
    flex: 1,
    minHeight: 200, // Minimum height to ensure scrolling works
  },
  citiesScrollView: {
    flex: 1,
    maxHeight: 400, // Maximum height to constrain the scroll area
  },
  citiesContainer: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 20, // Reduced since we no longer have the search bar
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
  // Floating Button Styles
  floatingButton: {
    position: "absolute",
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.DEPTH_TWO,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  plusIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 24,
  },
  // Search Modal Styles
  searchModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  searchModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 300,
    maxHeight: "80%",
  },
  searchModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
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
    width: "100%",
    maxHeight: "100%",
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
