import { NobsCity } from "@/types/NobsCity";
import { citiesAreEqual } from "@/util/citiesAreEqual";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cityService } from "./cityService";

const STORAGE_KEY = "savedCities";

export default class StorageService {
  static async getAllCities(): Promise<NobsCity[]> {
    return cityService();
  }

  static async getSavedCities(): Promise<NobsCity[]> {
    try {
      const cities = await AsyncStorage.getItem(STORAGE_KEY);
      return cities ? JSON.parse(cities) : [];
    } catch (error) {
      console.error("Error fetching saved cities: ", error);
      return [];
    }
  }

  static async saveCity(city: NobsCity): Promise<void> {
    try {
      const cities = await this.getSavedCities();
      if (!cities.includes(city)) {
        const updatedCities = [...cities, city];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCities));
      }
    } catch (error) {
      console.error("Error saving city: ", error);
    }
  }

  static async setPinnedCity(city: NobsCity | null): Promise<void> {
    try {
      if (city) {
        // Update city to pinned
        city.isPinned = true;
        // Remove pin from all others
        const cities = await this.getSavedCities();
        const updatedCities = cities.map((c) => {
          c.isPinned = citiesAreEqual(c, city);
          return c;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCities));
      } else {
        // Remove pin from all
        const cities = await this.getSavedCities();
        const updatedCities = cities.map((c) => {
          c.isPinned = false;
          return c;
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCities));
      }
    } catch (error) {
      console.error("Error setting pinned city: ", error);
    }
  }

  static async getPinnedCity(): Promise<NobsCity | null> {
    try {
      const cities = await this.getSavedCities();
      return cities.find((c) => c.isPinned) || null;
    } catch (error) {
      console.error("Error fetching pinned city: ", error);
      return null;
    }
  }

  static async removeCity(city: NobsCity): Promise<void> {
    try {
      const cities = await this.getSavedCities();
      const updatedCities = cities.filter((c) => !citiesAreEqual(c, city));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCities));
    } catch (error) {
      console.error("Error removing city: ", error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing saved cities:", error);
    }
  }
}
