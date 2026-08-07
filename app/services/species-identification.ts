import type { AnalysisStep, SelectedImage, SpeciesAnalysisResult } from "../types/ai-analysis";

export class UncertainIdentificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UncertainIdentificationError";
  }
}

export interface SpeciesIdentificationService {
  identify(
    image: SelectedImage,
    onProgress?: (step: AnalysisStep, progress: number) => void,
  ): Promise<SpeciesAnalysisResult>;
}
