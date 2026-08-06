import type { AnalysisStep, SelectedImage, SpeciesAnalysisResult } from "../types/ai-analysis";

export interface SpeciesIdentificationService {
  identify(
    image: SelectedImage,
    onProgress?: (step: AnalysisStep, progress: number) => void,
  ): Promise<SpeciesAnalysisResult>;
}
