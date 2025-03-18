import React, { useState, useEffect, forwardRef } from "react";
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Keyboard } from "react-native";
import { NobsCity } from "@/types/NobsCity";
import StorageService from "@/services/storageService";

const MAX_SEARCH_RESULTS = 6;

const CitySearch = forwardRef<TextInput, { onCitySelected: (city: NobsCity) => void }>(({ onCitySelected }, ref) => {
  const [cityData, setCityData] = useState<NobsCity[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredCities, setFilteredCities] = useState<{ label: string; value: NobsCity }[]>([]);

  useEffect(() => {
    const loadCities = async () => {
      const allCities = await StorageService.getAllCities();
      setCityData(allCities);
    };
    loadCities();
  }, []);

  const handleSelectCity = async (city: NobsCity) => {
    Keyboard.dismiss();
    setSearchText(""); // Clear search bar
    setFilteredCities([]); // Hide suggestions
    await StorageService.saveCity(city); // Save city to storage
    onCitySelected(city); // Notify parent component
  };

  useEffect(() => {
    if (searchText.length > 0) {
      const lowerText = searchText.toLowerCase();
      const results = cityData
        .filter((city) => city.name.toLowerCase().includes(lowerText))
        .map((city) => ({
          label: `${city.name}, ${city.stateAbbr}`,
          value: city,
        }))
        .slice(0, MAX_SEARCH_RESULTS);
      setFilteredCities(results);
    } else {
      setFilteredCities([]);
    }
  }, [searchText]);

  return (
    <View>
      <TextInput
        ref={ref}
        style={styles.input}
        placeholder="Search city..."
        value={searchText}
        onChangeText={setSearchText}
        autoCorrect={false} // 🚀 Disables autocorrect
        autoCapitalize="none" // 🚀 Prevents unwanted capitalization
        keyboardType="default"
        textContentType="none" // 🚀 Ensures no autofill suggestions
      />
      {filteredCities.length > 0 && (
        <FlatList
          data={filteredCities}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => `${item.value.name}-${item.value.stateAbbr}`} // Unique key
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelectCity(item.value)}>
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});

export default CitySearch;
