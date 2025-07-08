import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Keyboard, Modal, Image, RefreshControl } from "react-native";
import { useEffect, useState, useRef } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { NobsLocation } from "@/components/NobsLocation";
import CitySearch from "@/components/CitySearch";
import { NobsCity } from "@/types/NobsCity";
import StorageService from "@/services/storageService";
import WidgetService from "@/services/widgetService";
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
    // Clear widget data when no city is pinned
    WidgetService.updateWidgetData({
      name: "No pinned city",
      temp: 0,
      uv: 0,
      lastUpdated: new Date().toISOString(),
    });
  };

  const onDeleteCity = async (city: NobsCity) => {
    await StorageService.removeCity(city);
    if (pinnedCity && citiesAreEqual(pinnedCity, city)) {
      setPinnedCity(null);
      // Clear widget data when pinned city is deleted
      WidgetService.updateWidgetData({
        name: "No pinned city",
        temp: 0,
        uv: 0,
        lastUpdated: new Date().toISOString(),
      });
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
              <Text style={styles.pinnedTitle}>📌 PINNED</Text>
              <NobsLocation city={pinnedCity} includeState={false} isPinned={true} onPin={onRemovePin} onDelete={onDeleteCity} refreshTrigger={refreshTrigger} />
            </View>
          )}

          <View style={styles.grid}>
            {cities.map((city, index) => (
              <NobsLocation key={index} city={city} includeState={false} isPinned={false} onPin={onPinCity} onDelete={onDeleteCity} refreshTrigger={refreshTrigger} />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Help Modal */}
      <Modal animationType="fade" transparent={true} visible={showHelp} onRequestClose={() => setShowHelp(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={require("../assets/images/explainer.png")} style={styles.explainerImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowHelp(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal animationType="slide" transparent={true} visible={showSearchModal} onRequestClose={() => setShowSearchModal(false)}>
        <View style={styles.searchModalOverlay}>
          <View style={styles.searchModalContent}>
            <TouchableOpacity style={styles.searchModalCloseButton} onPress={() => setShowSearchModal(false)}>
              <Text style={styles.searchModalCloseText}>✕</Text>
            </TouchableOpacity>
            <CitySearch ref={searchInputRef} onCitySelected={addCityToWheel} />
          </View>
        </View>
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
    marginBottom: 20,
  },
  pinnedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.DEPTH_ZERO,
    marginBottom: 10,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingBottom: 50,
  },
  helpButton: {
    position: "absolute",
    right: 15,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  helpButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  explainerImage: {
    width: "100%",
    height: 400,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: colors.DEPTH_TWO,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  searchModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
    position: "relative",
  },
  searchModalCloseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  searchModalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  searchInput: {
    marginTop: 40,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.DEPTH_TWO,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  plusIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "300",
  },
});
