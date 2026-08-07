import { UncertainIdentificationError, type SpeciesIdentificationService } from "./species-identification";
import type { AnalysisStep, DemoImageId, SelectedImage, SpeciesAnalysisResult } from "../types/ai-analysis";

const candidates = {
  purpleUrchin: { id: "purple-urchin", koreanName: "보라성게", scientificName: "Heliocidaris crassispina", confidence: 94, imageLabel: "✹" },
  anemone: { id: "sea-anemone", koreanName: "말미잘", scientificName: "Actiniaria", confidence: 91, imageLabel: "✺" },
  rockfish: { id: "rockfish", koreanName: "쏨뱅이", scientificName: "Sebastiscus marmoratus", confidence: 87, imageLabel: "◆" },
};

const results: Record<DemoImageId, SpeciesAnalysisResult> = {
  "purple-urchin": { ...candidates.purpleUrchin, category: "극피동물", rarity: "보통", summary: "짙은 보라색 가시가 촘촘한 부산 연안의 대표적인 성게입니다.", features: ["짙은 보라색 또는 검은빛의 몸", "길고 단단한 가시", "바위 틈에 몸을 숨김"], toxic: false, riskLevel: "주의", touchable: false, habitat: "수심이 얕은 암반과 조간대 바위 틈", activeSeasons: ["봄", "여름", "가을"], commonLocations: ["이기대 해안", "청사포", "기장 대변항"], precautions: ["가시에 찔리지 않도록 가까이 손을 대지 마세요.", "바위에서 떼어내거나 채집하지 마세요."], candidates: [{ ...candidates.purpleUrchin }, { ...candidates.anemone, confidence: 4 }, { ...candidates.rockfish, confidence: 2 }] },
  "sea-anemone": { ...candidates.anemone, category: "자포동물", rarity: "희귀", summary: "꽃처럼 보이는 촉수를 펼쳐 작은 먹이를 잡는 바다 생물입니다.", features: ["방사형으로 펼쳐진 촉수", "바위에 붙어 생활", "물 밖에서는 몸을 오므림"], toxic: true, riskLevel: "주의", touchable: false, habitat: "파도가 닿는 조간대 바위와 웅덩이", activeSeasons: ["봄", "여름"], commonLocations: ["이기대 해안", "청사포", "태종대"], precautions: ["촉수의 자포가 피부를 자극할 수 있어 만지지 마세요.", "사진만 남기고 서식 위치를 그대로 보존하세요."], candidates: [{ ...candidates.anemone }, { ...candidates.purpleUrchin, confidence: 6 }, { ...candidates.rockfish, confidence: 3 }] },
  rockfish: { ...candidates.rockfish, category: "어류", rarity: "보통", summary: "바위와 비슷한 무늬로 위장하는 연안성 물고기입니다.", features: ["갈색 얼룩무늬", "머리와 등지느러미의 날카로운 가시", "바위 주변에서 움직임"], toxic: true, riskLevel: "위험", touchable: false, habitat: "연안 암초와 방파제 아래", activeSeasons: ["봄", "여름", "가을", "겨울"], commonLocations: ["기장 대변항", "청사포", "영도 흰여울 해안"], precautions: ["등지느러미 가시에 독성이 있어 절대 맨손으로 만지지 마세요.", "낚시 중 발견했다면 도구를 사용하고 전문가의 안내를 따르세요."], candidates: [{ ...candidates.rockfish }, { ...candidates.anemone, confidence: 8 }, { ...candidates.purpleUrchin, confidence: 5 }] },
};

const steps: Array<{ id: AnalysisStep; progress: number }> = [
  { id: "quality", progress: 24 }, { id: "shape", progress: 52 }, { id: "similarity", progress: 78 }, { id: "safety", progress: 100 },
];

const wait = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

function chooseDemoId(image: SelectedImage): DemoImageId | null {
  if (image.demoId) return image.demoId;
  const normalized = image.fileName.toLowerCase();
  if (normalized.includes("anemone") || normalized.includes("말미잘")) return "sea-anemone";
  if (normalized.includes("rockfish") || normalized.includes("쏨뱅이")) return "rockfish";
  if (normalized.includes("urchin") || normalized.includes("성게")) return "purple-urchin";
  return null;
}

export const mockSpeciesIdentificationService: SpeciesIdentificationService = {
  async identify(image, onProgress) {
    for (const step of steps) {
      await wait(450);
      onProgress?.(step.id, step.progress);
    }
    if (image.kind === "upload" && (image.fileSize ?? 0) < 20 * 1024) {
      throw new UncertainIdentificationError("사진의 해상도나 정보가 부족해 생물을 확인하기 어렵습니다. 생물 전체가 선명하게 보이도록 다시 촬영해 주세요.");
    }
    const matchedId = chooseDemoId(image);
    if (!matchedId) {
      throw new UncertainIdentificationError("도감에 있는 생물과 충분히 일치하지 않습니다. 다른 각도에서 더 가까이 촬영한 사진을 다시 업로드해 주세요.");
    }
    return structuredClone(results[matchedId]);
  },
};
