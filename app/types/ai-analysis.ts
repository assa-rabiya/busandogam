import type { Rarity } from "./index";

export type DemoImageId = "purple-urchin" | "sea-anemone" | "rockfish";
export type AnalysisStep = "quality" | "shape" | "similarity" | "safety";
export type RiskLevel = "낮음" | "주의" | "위험";

export interface SelectedImage {
  kind: "demo" | "upload";
  id: string;
  fileName: string;
  previewUrl: string | null;
  demoId?: DemoImageId;
  imageLabel: string;
  imageTone: string;
}

export interface SpeciesCandidate {
  id: string;
  koreanName: string;
  scientificName: string;
  confidence: number;
  imageLabel: string;
}

export interface SpeciesAnalysisResult extends SpeciesCandidate {
  category: string;
  rarity: Rarity;
  summary: string;
  features: string[];
  toxic: boolean;
  riskLevel: RiskLevel;
  touchable: boolean;
  habitat: string;
  activeSeasons: string[];
  commonLocations: string[];
  precautions: string[];
  candidates: SpeciesCandidate[];
}

export interface IdentificationSession {
  selectedImage: SelectedImage | null;
  progress: number;
  currentStep: AnalysisStep | null;
  completedSteps: AnalysisStep[];
  isAnalyzing: boolean;
  result: SpeciesAnalysisResult | null;
  error: string | null;
}
