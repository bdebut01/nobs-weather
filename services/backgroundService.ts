import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import StorageService from "./storageService";
import { weatherService } from "./api/weatherService";
import WidgetService from "./widgetService";

const BACKGROUND_FETCH_TASK = "background-fetch-weather";

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
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
});

export class BackgroundService {
  static async registerBackgroundFetch() {
    try {
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
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log("[Background] Background fetch unregistered");
    } catch (error) {
      console.error("[Background] Failed to unregister background fetch:", error);
    }
  }

  static async getBackgroundFetchStatus() {
    const status = await BackgroundFetch.getStatusAsync();
    return status;
  }
}
