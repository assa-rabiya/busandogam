import { speciesCatalog } from "../data/discovery-data";
import { UncertainIdentificationError, type SpeciesIdentificationService } from "./species-identification";
import type { AnalysisStep, DemoImageId, SelectedImage, SpeciesAnalysisResult } from "../types/ai-analysis";

const confidence: Record<DemoImageId, number> = { "purple-urchin": 94, "sea-anemone": 91, rockfish: 87, "purple-crab": 92, "sea-star": 90, "sea-snail": 93, octopus: 89, "night-crab": 88, kelp: 90, "sea-hare": 86 };
const steps: Array<{ id: AnalysisStep; progress: number }> = [{ id: "quality", progress: 24 }, { id: "shape", progress: 52 }, { id: "similarity", progress: 78 }, { id: "safety", progress: 100 }];
const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

function demoIdFromImage(image: SelectedImage): DemoImageId | null {
  if (image.demoId) return image.demoId;
  const filename = image.fileName.toLowerCase();
  const found = speciesCatalog.find((item) => filename.includes(item.id) || filename.includes(item.koreanName));
  return found && found.id in confidence ? found.id as DemoImageId : null;
}
function resultFor(id: DemoImageId): SpeciesAnalysisResult {
  const species = speciesCatalog.find((item) => item.id === id);
  if (!species) throw new UncertainIdentificationError("도감에서 생물 정보를 찾지 못했습니다. 사진을 다시 업로드해 주세요.");
  const primary = { id: species.id, koreanName: species.koreanName, scientificName: species.scientificName, confidence: confidence[id], imageLabel: species.imageLabel };
  const alternatives = speciesCatalog.filter((item) => item.id !== id).slice(0, 2).map((item, index) => ({ id: item.id, koreanName: item.koreanName, scientificName: item.scientificName, confidence: Math.max(3, 12 - index * 5), imageLabel: item.imageLabel }));
  return { ...primary, category: species.category, rarity: species.rarity, summary: species.description ?? "부산 연안에서 관찰할 수 있는 생물입니다.", features: species.features ?? [], toxic: species.toxic ?? false, riskLevel: species.riskLevel ?? "낮음", touchable: species.touchable ?? false, habitat: species.habitat ?? "부산 연안", activeSeasons: species.activeSeasons ?? ["사계절"], commonLocations: species.commonLocations ?? [], precautions: species.precautions ?? ["생물을 만지지 말고 안전 거리를 유지하세요."], candidates: [primary, ...alternatives] };
}

export const mockSpeciesIdentificationService: SpeciesIdentificationService = {
  async identify(image, onProgress) {
    for (const step of steps) { await wait(450); onProgress?.(step.id, step.progress); }
    if (image.kind === "upload" && (image.fileSize ?? 0) < 20 * 1024) throw new UncertainIdentificationError("사진 정보가 부족해 생물을 확인하기 어렵습니다. 생물 전체와 무늬가 보이게 다시 촬영해 주세요.");
    const id = demoIdFromImage(image);
    if (!id) throw new UncertainIdentificationError("도감에 있는 생물과 충분히 일치하지 않습니다. 다른 각도에서 더 가까이 촬영한 사진을 업로드해 주세요.");
    return resultFor(id);
  },
};
