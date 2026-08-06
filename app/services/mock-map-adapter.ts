import type { Rarity } from "../types";
import type { MapCenter, MapDiscovery, MapMarkerGroup, MapPoint } from "../types/map";
import type { MapAdapter, MapBounds } from "./map-adapter";

const rarityWeight: Record<Rarity, number> = { "흔함": 0, "보통": 1, "희귀": 2, "매우 희귀": 3 };

export const mockMapAdapter: MapAdapter = {
  bounds: { minLatitude: 35.03, maxLatitude: 35.28, minLongitude: 128.92, maxLongitude: 129.26 } satisfies MapBounds,
  defaultCenter: { latitude: 35.145, longitude: 129.105 },
  project(latitude: number, longitude: number, center: MapCenter, zoom: number): MapPoint {
    const { bounds } = this;
    const baseX = (longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude) * 100;
    const baseY = (bounds.maxLatitude - latitude) / (bounds.maxLatitude - bounds.minLatitude) * 100;
    const centerX = (center.longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude) * 100;
    const centerY = (bounds.maxLatitude - center.latitude) / (bounds.maxLatitude - bounds.minLatitude) * 100;
    return { x: 50 + (baseX - centerX) * zoom, y: 50 + (baseY - centerY) * zoom };
  },
  isValidCoordinate(latitude, longitude) {
    return latitude !== null && longitude !== null && Number.isFinite(latitude) && Number.isFinite(longitude)
      && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  },
  isInsideBusan(latitude, longitude) {
    const { bounds } = this;
    return latitude >= bounds.minLatitude && latitude <= bounds.maxLatitude
      && longitude >= bounds.minLongitude && longitude <= bounds.maxLongitude;
  },
  groupRecords(records: MapDiscovery[]): MapMarkerGroup[] {
    const grouped = new Map<string, MapDiscovery[]>();
    records.forEach((record) => {
      if (!this.isValidCoordinate(record.latitude, record.longitude)) return;
      const key = record.locationName.trim() || `${record.latitude}:${record.longitude}`;
      grouped.set(key, [...(grouped.get(key) ?? []), record]);
    });
    return [...grouped.entries()].map(([locationName, found]) => {
      const sorted = [...found].sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
      const rarest = sorted.reduce<Rarity>((current, record) => rarityWeight[record.rarity] > rarityWeight[current] ? record.rarity : current, "흔함");
      return {
        id: `group-${encodeURIComponent(locationName)}`,
        locationName,
        latitude: sorted[0].latitude as number,
        longitude: sorted[0].longitude as number,
        records: sorted,
        latestAt: sorted[0].discoveredAt,
        speciesCount: new Set(sorted.map((record) => record.speciesId)).size,
        rarest,
        hasRisk: sorted.some((record) => record.species?.toxic || record.species?.riskLevel === "위험"),
      };
    });
  },
};
