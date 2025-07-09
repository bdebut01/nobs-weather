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

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WeatherEntry {
        print("[Widget] placeholder called")
        return WeatherEntry(date: Date(), weatherData: WeatherData.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WeatherEntry) -> ()) {
        print("[Widget] getSnapshot called")
        let weatherData = loadWeatherData() ?? WeatherData.noData
        let entry = WeatherEntry(date: Date(), weatherData: weatherData)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        print("[Widget] getTimeline called")
        let weatherData = loadWeatherData() ?? WeatherData.noData
        let entry = WeatherEntry(date: Date(), weatherData: weatherData)

        // Refresh every 10 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 10, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadWeatherData() -> WeatherData? {
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
