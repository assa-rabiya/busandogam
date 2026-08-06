import type { Discovery } from "./discovery";
import type { Rarity, Species } from "./index";

export type MapViewMode = "map" | "list";
export type MapOwnerFilter = "public" | "mine";
export type MapSafetyFilter = "all" | "safe" | "caution" | "danger";
export type MapDatePreset = "all" | "today" | "7days" | "30days" | "month" | "season" | "custom";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type MapSort = "newest" | "oldest" | "distance" | "rarity" | "name";

export interface Coordinates { latitude: number; longitude: number; }
export interface MapPoint { x: number; y: number; }
export type MapCenter = Coordinates;

export interface MapDiscovery extends Discovery {
  source: "mock" | "user";
  ownerLabel: string;
  isMine: boolean;
  species: Species | null;
}

export interface MapMarkerGroup {
  id: string;
  locationName: string;
  latitude: number;
  longitude: number;
  records: MapDiscovery[];
  latestAt: string;
  speciesCount: number;
  rarest: Rarity;
  hasRisk: boolean;
}

export interface MapFilters {
  speciesId: string;
  category: string;
  rarity: string;
  datePreset: MapDatePreset;
  season: Season;
  dateFrom: string;
  dateTo: string;
  location: string;
  safety: MapSafetyFilter;
  owner: MapOwnerFilter;
  search: string;
}

export interface MapStatistics {
  recordCount: number;
  speciesCount: number;
  locationCount: number;
  rareCount: number;
  topSpecies: string;
  topLocation: string;
}
