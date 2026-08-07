export type NavigationId = "home" | "map" | "camera" | "community" | "collection";
export type Rarity = "흔함" | "보통" | "희귀" | "매우 희귀";

export interface AppUser {
  nickname: string; level: number; points: number; discoveredSpeciesCount: number;
  discoveryCount: number; visitedLocationCount: number; postCount: number;
  experience: number; nextLevelExperience: number; representativeBadge: string;
}
export interface Species { id: string; koreanName: string; scientificName: string; category: string; rarity: Rarity; imageLabel: string; imageTone?: string; toxic?: boolean; riskLevel?: "낮음" | "주의" | "위험"; touchable?: boolean; description?: string; features?: string[]; habitat?: string; activeSeasons?: string[]; commonLocations?: string[]; precautions?: string[]; monthlyAppearance?: number[]; }
export interface Location { id: string; name: string; district: string; habitat: string; imageLabel: string; imageUrl?: string; speciesHint: string; bestTime: string; difficulty: "쉬움" | "보통" | "주의"; }
export interface RecentDiscovery { id: string; speciesName: string; location: string; discoveredAt: string; rarity: Rarity; imageLabel: string; }
export interface PopularSpecies { rank: number; name: string; count: number; change: string; trend: "up" | "down" | "same"; }
export interface Activity { id: string; text: string; time: string; icon: string; }
