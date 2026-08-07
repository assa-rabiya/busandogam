import type { AppUser } from "../types";
import type { Discovery } from "../types/discovery";

export interface ExplorerStats {
  speciesCount: number;
  discoveryCount: number;
  locationCount: number;
  points: number;
  rareCount: number;
}

export function getExplorerStats(records: Discovery[], user: AppUser | null | undefined): ExplorerStats {
  const isDemo = user?.accountType !== "guest";
  const baseline = isDemo ? user : undefined;
  const addedSpecies = new Set(records.map((record) => record.speciesId)).size;
  const addedLocations = new Set(records.map((record) => record.locationName)).size;
  const addedPoints = records.reduce((total, record) => total + record.scoreAwarded, 0);
  const rareCount = records.filter((record) => record.rarity === "희귀" || record.rarity === "매우 희귀").length;
  return {
    speciesCount: (baseline?.discoveredSpeciesCount ?? 0) + addedSpecies,
    discoveryCount: (baseline?.discoveryCount ?? 0) + records.length,
    locationCount: (baseline?.visitedLocationCount ?? 0) + addedLocations,
    points: (baseline?.points ?? 0) + addedPoints,
    rareCount,
  };
}
