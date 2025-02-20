import { LatLong } from "./LatLong";

export interface NobsCity {
  name: string;
  stateAbbr: string;
  location: LatLong;
  timezone: string;
}
