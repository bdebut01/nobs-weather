import { NativeModules, Platform } from "react-native";
import { NobsCity } from "@/types/NobsCity";

interface WidgetData {
  name: string;
  temp: number;
  uv: number;
  lastUpdated: string;
}

class WidgetService {
  static async updateWidgetData(data: WidgetData): Promise<void> {
    if (Platform.OS === "ios") {
      try {
        const { RNUserDefaults } = NativeModules;
        if (RNUserDefaults && RNUserDefaults.setSharedData) {
          await RNUserDefaults.setSharedData("group.com.anonymous.nobs.weather", "pinnedCityWeather", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error updating widget data:", error);
      }
    }
  }

  static async updatePinnedCity(city: NobsCity | null): Promise<void> {
    if (Platform.OS === "ios") {
      try {
        const { RNUserDefaults } = NativeModules;
        if (RNUserDefaults && RNUserDefaults.setSharedData) {
          if (city) {
            await RNUserDefaults.setSharedData(
              "group.com.anonymous.nobs.weather", 
              "pinnedCity", 
              JSON.stringify(city)
            );
            console.log("[WidgetService] Saved pinned city to widget:", city.name);
          } else {
            await RNUserDefaults.removeSharedData(
              "group.com.anonymous.nobs.weather", 
              "pinnedCity"
            );
            console.log("[WidgetService] Removed pinned city from widget");
          }
        }
      } catch (error) {
        console.error("[WidgetService] Error updating widget pinned city:", error);
      }
    }
  }
}

export default WidgetService;
