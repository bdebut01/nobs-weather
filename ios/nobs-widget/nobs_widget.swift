//
//  nobs_widget.swift
//  nobs-widget
//
//  Created by Ben on 7/7/25.
//

import WidgetKit
import SwiftUI

struct WeatherData: Codable {
    let name: String
    let temp: Int
    let uv: Int
    let lastUpdated: Date
    
    static let placeholder = WeatherData(
        name: "Loading...",
        temp: 0,
        uv: 0,
        lastUpdated: Date()
    )
    
    static let noData = WeatherData(
        name: "No Data",
        temp: 0,
        uv: 0,
        lastUpdated: Date()
    )
    
    static let testData = WeatherData(
        name: "Test Mode",
        temp: 72,
        uv: 5,
        lastUpdated: Date()
    )
}

struct PinnedCityData: Codable {
    let name: String
    let stateAbbr: String
    let location: LocationData
    let timezone: String
    let isPinned: Bool
}

struct LocationData: Codable {
    let lat: Double
    let lon: Double
}

// Open-Meteo API Response structures
struct OpenMeteoResponse: Codable {
    let current: CurrentWeather
}

struct CurrentWeather: Codable {
    let apparent_temperature: Double
    let uv_index: Double
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry {
        print("[Widget] placeholder called")
        return WeatherEntry(date: Date(), weatherData: WeatherData.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> ()) {
        print("[Widget] getSnapshot called")
        
        // For snapshots, try to load cached data first
        if let cachedData = loadCachedWeatherData() {
            let entry = WeatherEntry(date: Date(), weatherData: cachedData)
            completion(entry)
            return
        }
        
        // If no cached data, use placeholder
        let entry = WeatherEntry(date: Date(), weatherData: WeatherData.placeholder)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        print("[Widget] getTimeline called")
        
        // Try to fetch fresh data
        Task {
            let weatherData = await fetchFreshWeatherData()
            let entry = WeatherEntry(date: Date(), weatherData: weatherData)
            
            // Schedule next update in 15 minutes (Apple's recommended minimum for widgets)
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            
            await MainActor.run {
                completion(timeline)
            }
        }
    }
    
    private func loadCachedWeatherData() -> WeatherData? {
        guard let sharedContainer = UserDefaults(suiteName: "group.com.anonymous.nobs.weather") else {
            return nil
        }
        
        guard let data = sharedContainer.data(forKey: "pinnedCityWeather") else {
            return nil
        }
        
        let decoder = JSONDecoder()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        decoder.dateDecodingStrategy = .formatted(formatter)
        
        do {
            return try decoder.decode(WeatherData.self, from: data)
        } catch {
            // Try manual parsing as fallback
            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let name = json["name"] as? String,
                   let temp = json["temp"] as? Int,
                   let uv = json["uv"] as? Int,
                   let lastUpdatedString = json["lastUpdated"] as? String {
                    
                    let lastUpdated = formatter.date(from: lastUpdatedString) ?? Date()
                    return WeatherData(name: name, temp: temp, uv: uv, lastUpdated: lastUpdated)
                }
            } catch {
                return nil
            }
            
            return nil
        }
    }
    
    private func loadPinnedCity() -> PinnedCityData? {
        guard let sharedContainer = UserDefaults(suiteName: "group.com.anonymous.nobs.weather") else {
            print("[Widget] Failed to access shared container")
            return nil
        }
        
        guard let data = sharedContainer.data(forKey: "pinnedCity") else {
            print("[Widget] No pinned city data found")
            return nil
        }
        
        let decoder = JSONDecoder()
        do {
            return try decoder.decode(PinnedCityData.self, from: data)
        } catch {
            print("[Widget] Failed to decode pinned city: \(error)")
            return nil
        }
    }
    
    private func fetchFreshWeatherData() async -> WeatherData {
        // First try to get the pinned city
        guard let pinnedCity = loadPinnedCity() else {
            print("[Widget] No pinned city available")
            return loadCachedWeatherData() ?? WeatherData.noData
        }
        
        // Construct the Open-Meteo API URL
        let urlString = "https://api.open-meteo.com/v1/forecast?latitude=\(pinnedCity.location.lat)&longitude=\(pinnedCity.location.lon)&current=apparent_temperature,uv_index&temperature_unit=fahrenheit&timezone=America%2FNew_York"
        
        guard let url = URL(string: urlString) else {
            print("[Widget] Invalid URL")
            return loadCachedWeatherData() ?? WeatherData.noData
        }
        
        do {
            print("[Widget] Fetching fresh weather data from: \(urlString)")
            let (data, _) = try await URLSession.shared.data(from: url)
            
            let decoder = JSONDecoder()
            let response = try decoder.decode(OpenMeteoResponse.self, from: data)
            
            let temp = Int(response.current.apparent_temperature.rounded())
            let uv = Int(response.current.uv_index.rounded())
            
            let freshData = WeatherData(
                name: pinnedCity.name,
                temp: temp,
                uv: uv,
                lastUpdated: Date()
            )
            
            // Cache the fresh data for the app to use
            saveCachedWeatherData(freshData)
            
            print("[Widget] Successfully fetched fresh weather data: \(temp)°, UV \(uv)")
            return freshData
            
        } catch {
            print("[Widget] Failed to fetch weather data: \(error)")
            // Fall back to cached data if available
            return loadCachedWeatherData() ?? WeatherData.noData
        }
    }
    
    private func saveCachedWeatherData(_ weatherData: WeatherData) {
        guard let sharedContainer = UserDefaults(suiteName: "group.com.anonymous.nobs.weather") else {
            return
        }
        
        let encoder = JSONEncoder()
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        encoder.dateEncodingStrategy = .formatted(formatter)
        
        do {
            let data = try encoder.encode(weatherData)
            sharedContainer.set(data, forKey: "pinnedCityWeather")
            print("[Widget] Cached fresh weather data")
        } catch {
            print("[Widget] Failed to cache weather data: \(error)")
        }
    }
}

struct WeatherEntry: TimelineEntry {
    let date: Date
    let weatherData: WeatherData
}

struct nobs_widgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryInline:
            inlineView
        case .accessoryCircular:
            circularView
        case .accessoryRectangular:
            rectangularView
        default:
            rectangularView
        }
    }
    
    private var inlineView: some View {
        HStack(spacing: 2) {
            Text("\(entry.weatherData.temp)°")
                .font(.body)
                .fontWeight(.medium)
            Text("UV \(entry.weatherData.uv)")
                .font(.subheadline)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
    
    private var circularView: some View {
        VStack(spacing: 1) {
            Text("\(entry.weatherData.temp)°")
                .font(.caption)
                .fontWeight(.bold)
            Text("UV\(entry.weatherData.uv)")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
    
    private var rectangularView: some View {
        VStack(spacing: 3) {
            // City name
            Text(entry.weatherData.name)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.primary)
                .lineLimit(1)
            
            // Temperature
            HStack(spacing: 2) {
                Image(systemName: "thermometer")
                    .font(.caption2)
                    .foregroundColor(.orange)
                Text("\(entry.weatherData.temp)°")
                    .font(.headline)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
            }
            
            // UV Index
            HStack(spacing: 2) {
                Image(systemName: "sun.max")
                    .font(.caption2)
                    .foregroundColor(.yellow)
                Text("UV \(entry.weatherData.uv)")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
            
            // Last updated
            Text(timeAgoString(from: entry.weatherData.lastUpdated))
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
    
    private func timeAgoString(from date: Date) -> String {
        let now = Date()
        let interval = now.timeIntervalSince(date)
        
        if interval < 60 {
            return "Just now"
        } else if interval < 3600 {
            let minutes = Int(interval / 60)
            return "\(minutes)m ago"
        } else if interval < 86400 {
            let hours = Int(interval / 3600)
            return "\(hours)h ago"
        } else {
            let days = Int(interval / 86400)
            return "\(days)d ago"
        }
    }
}

struct nobs_widget: Widget {
    let kind: String = "nobs_widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                nobs_widgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                nobs_widgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("NOBS Weather")
        .description("Shows current temperature and UV index for your pinned city.")
        .supportedFamilies([.accessoryRectangular, .accessoryInline, .accessoryCircular])
        .contentMarginsDisabled()
    }
}

#Preview("Rectangular", as: .accessoryRectangular) {
    nobs_widget()
} timeline: {
    WeatherEntry(date: .now, weatherData: WeatherData(name: "New York", temp: 72, uv: 3, lastUpdated: .now))
    WeatherEntry(date: .now, weatherData: WeatherData(name: "San Francisco", temp: 68, uv: 5, lastUpdated: .now))
}

#Preview("Inline", as: .accessoryInline) {
    nobs_widget()
} timeline: {
    WeatherEntry(date: .now, weatherData: WeatherData(name: "NYC", temp: 72, uv: 3, lastUpdated: .now))
}

#Preview("Circular", as: .accessoryCircular) {
    nobs_widget()
} timeline: {
    WeatherEntry(date: .now, weatherData: WeatherData(name: "NYC", temp: 72, uv: 3, lastUpdated: .now))
}
