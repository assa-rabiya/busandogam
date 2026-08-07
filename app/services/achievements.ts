import type { Discovery } from "../types/discovery";
import type { AppUser } from "../types";
import { getExplorerStats } from "./explorer-stats";

export interface Achievement { id: string; title: string; description: string; icon: string; earned: boolean; progress: number; target: number; }
export interface LeaderboardEntry { rank: number; name: string; points: number; speciesCount: number; isCurrentUser?: boolean; }

export function getAchievements(records: Discovery[], user?: AppUser | null): Achievement[] {
  const explorer = getExplorerStats(records, user);
  const species = explorer.speciesCount;
  const locations = explorer.locationCount;
  const rare = records.filter((record) => record.rarity === "희귀" || record.rarity === "매우 희귀").length;
  const points = explorer.points;
  return [
    { id: "first-discovery", title: "첫 발자국", description: "첫 발견 기록을 남기세요.", icon: "◌", earned: records.length >= 1, progress: records.length, target: 1 },
    { id: "cataloger", title: "초보 도감가", description: "서로 다른 생물 10종을 발견하세요.", icon: "▦", earned: species >= 10, progress: species, target: 10 },
    { id: "coast-explorer", title: "부산 해안 탐험가", description: "서로 다른 지역 8곳을 방문하세요.", icon: "⌖", earned: locations >= 8, progress: locations, target: 8 },
    { id: "rare-observer", title: "희귀종 관찰자", description: "희귀 생물을 3회 관찰하세요.", icon: "✦", earned: rare >= 3, progress: rare, target: 3 },
    { id: "steady-explorer", title: "성실한 탐험가", description: "발견 점수 500P를 모으세요.", icon: "★", earned: points >= 500, progress: points, target: 500 },
  ];
}
export function getLeaderboard(records: Discovery[], currentName: string, user?: AppUser | null): LeaderboardEntry[] {
  const explorer = getExplorerStats(records, user);
  const current = { name: currentName, points: explorer.points, speciesCount: explorer.speciesCount, isCurrentUser: true };
  const samples = [{ name: "해운대 관찰자", points: 860, speciesCount: 18 }, { name: "기장 탐험대", points: 640, speciesCount: 14 }, { name: "송도 바다친구", points: 420, speciesCount: 9 }];
  return [...samples, current].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }));
}
