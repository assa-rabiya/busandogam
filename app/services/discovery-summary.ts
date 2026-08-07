import { publicMapDiscoveries } from "../data/map-data";
import type { Discovery } from "../types/discovery";

export interface PopularDiscoverySpecies {
  rank: number;
  name: string;
  count: number;
}

/** 지도·홈·도감에서 사용하는 발견 기록의 단일 집계 기준이다. */
export function getUnifiedDiscoveries(records: Discovery[]): Discovery[] {
  return [...publicMapDiscoveries, ...records];
}

export function getPopularDiscoverySpecies(records: Discovery[], limit = 5): PopularDiscoverySpecies[] {
  const grouped = new Map<string, { name: string; count: number }>();
  getUnifiedDiscoveries(records).forEach((record) => {
    const current = grouped.get(record.speciesId);
    grouped.set(record.speciesId, { name: record.speciesName, count: (current?.count ?? 0) + 1 });
  });
  return [...grouped.values()]
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name, "ko"))
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
