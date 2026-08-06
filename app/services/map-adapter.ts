import type { MapCenter, MapDiscovery, MapMarkerGroup, MapPoint } from "../types/map";

export interface MapBounds { minLatitude: number; maxLatitude: number; minLongitude: number; maxLongitude: number; }

export interface MapAdapter {
  readonly bounds: MapBounds;
  readonly defaultCenter: MapCenter;
  project(latitude: number, longitude: number, center: MapCenter, zoom: number): MapPoint;
  isValidCoordinate(latitude: number | null, longitude: number | null): boolean;
  isInsideBusan(latitude: number, longitude: number): boolean;
  groupRecords(records: MapDiscovery[]): MapMarkerGroup[];
}

export function haversineDistance(a: MapCenter, b: MapCenter): number {
  const radius = 6371;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(b.latitude - a.latitude);
  const longitudeDelta = toRadians(b.longitude - a.longitude);
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
