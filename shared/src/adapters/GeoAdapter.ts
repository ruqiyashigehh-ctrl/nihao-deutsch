export interface GeoLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

export interface GeoAdapter {
  getLocation(): Promise<GeoLocation>;
}