import { Platform } from "react-native";
import StorageService from "./storageService";
import { weatherService } from "./api/weatherService";
import WidgetService from "./widgetService";

const BACKGROUND_FETCH_TASK = "background-fetch-weather";

// Check if we're running in a simulator - do this first before any other imports
const isSimulator = () => {
  if (Platform.OS === "ios") {
    // On iOS, check if it's a simulator by checking constants
    // Real devices have different constants than simulators
    try {
      const Constants = require("expo-constants").default;
      return Constants.platform?.ios?.simulator || false;
    } catch {
      // If expo-constants fails, assume simulator for safety
      return true;
    }
  }

  if (Platform.OS === "android") {
    // On Android, check if it's an emulator
    try {
      const Constants = require("expo-constants").default;
      return Constants.platform?.android?.isEmulator || false;
    } catch {
      // If expo-constants fails, assume emulator for safety
      return true;
    }
  }

  return false;
};

// Immediately check if we should skip everything
const SKIP_BACKGROUND_FETCH = isSimulator();

// Check if background fetch is available
const isBackgroundFetchAvailable = () => {
  // Skip background fetch in simulator
  if (SKIP_BACKGROUND_FETCH) {
    console.log("[Background] Skipping background fetch in simulator");
    return false;
  }

  try {
    // Only try to require the modules if we're not in simulator
    const BackgroundFetch = require("expo-background-fetch");
    const TaskManager = require("expo-task-manager");
    return BackgroundFetch && TaskManager;
  } catch (error) {
    console.warn("[Background] Background fetch not available:", error);
    return false;
  }
};

// Define the background task function
const backgroundTaskHandler = async () => {
  const BackgroundFetch = require("expo-background-fetch");

  try {
    console.log("[Background] Starting background weather update...");

    // Get the pinned city
    const pinnedCity = await StorageService.getPinnedCity();

    if (!pinnedCity) {
      console.log("[Background] No pinned city found");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Fetch fresh weather data using your existing API structure
    const openMeteoUrl = process.env.EXPO_PUBLIC_OPEN_METEO_URL;
    if (!openMeteoUrl) {
      console.log("[Background] No weather API URL configured");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const fullUrl = `${openMeteoUrl}/?latitude=${pinnedCity.location.lat}&longitude=${pinnedCity.location.lon}&current=apparent_temperature,weather_code,uv_index&hourly=apparent_temperature,uv_index&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_hours=4&timezone=America%2FNew_York`;

    const data = await weatherService(fullUrl);

    if (!data || !data.current) {
      console.log("[Background] Failed to fetch weather data");
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    // Process data the same way as your component
    const feelsLike = Math.round(data.current.apparent_temperature);
    const uv = Math.round(data.current.uv_index);

    // Update widget with fresh data
    await WidgetService.updateWidgetData({
      name: pinnedCity.name,
      temp: feelsLike,
      uv: uv,
      lastUpdated: new Date().toISOString(),
    });

    console.log("[Background] Successfully updated weather data");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("[Background] Background fetch failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
};

export class BackgroundService {
  static async registerBackgroundFetch() {
    try {
      // Check if background fetch is available (this also checks for simulator)
      if (SKIP_BACKGROUND_FETCH || !isBackgroundFetchAvailable()) {
        console.log("[Background] Background fetch not available, skipping registration");
        return;
      }

      const BackgroundFetch = require("expo-background-fetch");
      const TaskManager = require("expo-task-manager");

      // Define the task only when we're about to register it
      TaskManager.defineTask(BACKGROUND_FETCH_TASK, backgroundTaskHandler);

      // Check current status first
      const status = await BackgroundFetch.getStatusAsync();
      console.log("[Background] Current status:", status);

      if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        console.log("[Background] Background fetch is denied");
        return;
      }

      // Register the background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes minimum (iOS enforces this)
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log("[Background] Background fetch registered successfully");
    } catch (error) {
      console.error("[Background] Failed to register background fetch:", error);
    }
  }

  static async unregisterBackgroundFetch() {
    try {
      if (SKIP_BACKGROUND_FETCH || !isBackgroundFetchAvailable()) {
        console.log("[Background] Background fetch not available, skipping unregistration");
        return;
      }

      const BackgroundFetch = require("expo-background-fetch");
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log("[Background] Background fetch unregistered");
    } catch (error) {
      console.error("[Background] Failed to unregister background fetch:", error);
    }
  }

  static async getBackgroundFetchStatus() {
    try {
      if (SKIP_BACKGROUND_FETCH || !isBackgroundFetchAvailable()) {
        return null;
      }
      const BackgroundFetch = require("expo-background-fetch");
      const status = await BackgroundFetch.getStatusAsync();
      return status;
    } catch (error) {
      console.error("[Background] Failed to get background fetch status:", error);
      return null;
    }
  }
}
