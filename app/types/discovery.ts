import type { Rarity } from "./index";

export type DiscoveryEnvironment = "갯벌" | "바위틈" | "조수 웅덩이" | "모래 해변" | "방파제" | "얕은 바다" | "수중" | "기타";
export type DiscoveryWeather = "맑음" | "흐림" | "비" | "바람 강함" | "기타";
export type TideState = "만조" | "썰물 진행 중" | "간조" | "밀물 진행 중" | "알 수 없음";
export type SizeUnit = "cm" | "mm";
export type DiscoveryVisibility = "public" | "private";

export interface Discovery {
  id: string;
  userId: string;
  speciesId: string;
  speciesName: string;
  scientificName: string;
  imageUrl: string;
  imageLabel: string;
  imageTone: string;
  imageFileName: string;
  imageSourceType: "demo" | "upload-session" | "placeholder";
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  discoveredAt: string;
  size: number | null;
  sizeUnit: SizeUnit;
  environment: DiscoveryEnvironment;
  weather: DiscoveryWeather;
  tide: TideState;
  memo: string;
  visibility: DiscoveryVisibility;
  aiConfidence: number;
  rarity: Rarity;
  scoreAwarded: number;
  duplicateWarning: string | null;
  isNewSpecies: boolean;
  createdAt: string;
}

export type DiscoveryDraft = Omit<Discovery, "id" | "scoreAwarded" | "duplicateWarning" | "isNewSpecies" | "createdAt">;

export interface CollectionEntry {
  speciesId: string;
  speciesName: string;
  discoveryCount: number;
  firstDiscoveredAt: string;
  lastDiscoveredAt: string;
  locationCount: number;
  maxRecordedSize: number | null;
  unlocked: boolean;
}

export interface BusanPlace { id: string; name: string; latitude: number; longitude: number; }
