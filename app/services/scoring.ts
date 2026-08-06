import type { Discovery, DiscoveryDraft } from "../types/discovery";

export interface ScoreResult { score: number; isNewSpecies: boolean; duplicateWarning: string | null; reason: string; }

export function calculateDiscoveryScore(draft: DiscoveryDraft, records: Discovery[]): ScoreResult {
  const speciesRecords = records.filter((record) => record.speciesId === draft.speciesId);
  const isNewSpecies = speciesRecords.length === 0;
  const sameLocation = speciesRecords.some((record) => record.locationName === draft.locationName);
  const date = draft.discoveredAt.slice(0, 10);
  const duplicate = speciesRecords.find((record) => record.locationName === draft.locationName && record.discoveredAt.slice(0, 10) === date);
  const repeatedImage = records.some((record) => record.imageFileName === draft.imageFileName);
  const rarityBonus = draft.rarity === "매우 희귀" ? 100 : draft.rarity === "희귀" ? 50 : 0;
  if (duplicate) return { score: 0, isNewSpecies: false, duplicateWarning: "같은 종을 같은 장소와 날짜에 이미 기록했어요. 기록은 저장되지만 점수는 제한됩니다.", reason: "중복 기록" };
  const base = isNewSpecies ? 100 : sameLocation ? 5 : 30;
  return { score: base + rarityBonus, isNewSpecies, duplicateWarning: repeatedImage ? "동일한 이미지 이름이 있어 중복 가능성이 있습니다." : null, reason: isNewSpecies ? "새로운 종 최초 등록" : sameLocation ? "기존 장소 재관찰" : "새로운 장소 발견" };
}
