export interface OpenMeteoHourly {
  //   latitude: number;
  //   longitude: number;
  //   generationtime_ms: number;
  //   utc_offset_seconds: number;
  //   timezone: string;
  //   timezone_abbreviation: string;
  //   elevation: number;
  //   hourly_units: {
  //     time: string;
  //     apparent_temperature: string;
  //     uv_index: string;
  //   };
  hourly: {
    // time: string[];
    apparent_temperature: number[];
    uv_index: number[];
  };
}
