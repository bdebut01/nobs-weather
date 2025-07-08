import { NativeModules, Platform } from "react-native";

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
}

export default WidgetService;
