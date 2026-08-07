"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { mockSpeciesIdentificationService } from "../services/mock-species-identification";
import { UncertainIdentificationError } from "../services/species-identification";
import type { AnalysisStep, DemoImageId, IdentificationSession, SelectedImage, SpeciesAnalysisResult } from "../types/ai-analysis";

const storageKey = "busan-sea-guide-identification";
const uploadSessionKey = "busan-sea-guide-identification-upload-session";
const initialState: IdentificationSession = { selectedImage: null, progress: 0, currentStep: null, completedSteps: [], isAnalyzing: false, result: null, error: null, requiresRetake: false };

interface IdentificationContextValue extends IdentificationSession {
  isReady: boolean;
  selectDemo: (demoId: DemoImageId) => void;
  selectFile: (file: File) => Promise<void>;
  analyze: () => Promise<boolean>;
  clear: () => void;
  clearError: () => void;
}

const IdentificationContext = createContext<IdentificationContextValue | null>(null);

const demoImages: Record<DemoImageId, Omit<SelectedImage, "previewUrl">> = {
  "purple-urchin": { kind: "demo", id: "demo-purple-urchin", fileName: "demo-purple-urchin.jpg", demoId: "purple-urchin", imageLabel: "✹", imageTone: "urchin" },
  "sea-anemone": { kind: "demo", id: "demo-sea-anemone", fileName: "demo-sea-anemone.jpg", demoId: "sea-anemone", imageLabel: "✺", imageTone: "anemone" },
  rockfish: { kind: "demo", id: "demo-rockfish", fileName: "demo-rockfish.jpg", demoId: "rockfish", imageLabel: "◆", imageTone: "rockfish" },
  "purple-crab": { kind: "demo", id: "demo-purple-crab", fileName: "demo-purple-crab.jpg", demoId: "purple-crab", imageLabel: "♧", imageTone: "urchin" },
  "sea-star": { kind: "demo", id: "demo-sea-star", fileName: "demo-sea-star.jpg", demoId: "sea-star", imageLabel: "★", imageTone: "anemone" },
  "sea-snail": { kind: "demo", id: "demo-sea-snail", fileName: "demo-sea-snail.jpg", demoId: "sea-snail", imageLabel: "◉", imageTone: "rockfish" },
  octopus: { kind: "demo", id: "demo-octopus", fileName: "demo-octopus.jpg", demoId: "octopus", imageLabel: "◌", imageTone: "anemone" },
  "night-crab": { kind: "demo", id: "demo-night-crab", fileName: "demo-night-crab.jpg", demoId: "night-crab", imageLabel: "♢", imageTone: "urchin" },
  kelp: { kind: "demo", id: "demo-kelp", fileName: "demo-kelp.jpg", demoId: "kelp", imageLabel: "♧", imageTone: "upload" },
  "sea-hare": { kind: "demo", id: "demo-sea-hare", fileName: "demo-sea-hare.jpg", demoId: "sea-hare", imageLabel: "◒", imageTone: "anemone" },
};

export function IdentificationProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<IdentificationSession>(initialState);
  const [isReady, setReady] = useState(false);
  const analysisLock = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey) ?? window.sessionStorage.getItem(uploadSessionKey);
      if (saved) {
        const restored = JSON.parse(saved) as Pick<IdentificationSession, "selectedImage" | "result">;
        if (restored.selectedImage) setSession({ ...initialState, ...restored });
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persistDemoSession = useCallback((next: IdentificationSession) => {
    if (next.selectedImage?.kind === "demo") {
      window.localStorage.setItem(storageKey, JSON.stringify({ selectedImage: next.selectedImage, result: next.result }));
      window.sessionStorage.removeItem(uploadSessionKey);
    } else if (next.selectedImage) {
      window.localStorage.removeItem(storageKey);
      try {
        window.sessionStorage.setItem(uploadSessionKey, JSON.stringify({ selectedImage: next.selectedImage, result: next.result }));
      } catch {
        window.sessionStorage.removeItem(uploadSessionKey);
      }
    } else {
      window.localStorage.removeItem(storageKey);
      window.sessionStorage.removeItem(uploadSessionKey);
    }
  }, []);

  const selectDemo = useCallback((demoId: DemoImageId) => {
    const next = { ...initialState, selectedImage: { ...demoImages[demoId], previewUrl: null } };
    setSession(next);
    persistDemoSession(next);
  }, [persistDemoSession]);

  const selectFile = useCallback(async (file: File) => {
    if (!(["image/jpeg", "image/png", "image/webp"] as string[]).includes(file.type)) { setSession((current) => ({ ...current, error: "JPG, PNG, WEBP 이미지 파일만 사용할 수 있어요." })); return; }
    if (file.size > 10 * 1024 * 1024) { setSession((current) => ({ ...current, error: "이미지는 10MB 이하로 선택해 주세요." })); return; }
    let previewUrl: string;
    try {
      previewUrl = await readFileAsDataUrl(file);
    } catch {
      setSession((current) => ({ ...current, error: "사진을 불러오지 못했습니다. 다른 사진을 선택해 주세요." }));
      return;
    }
    setSession((current) => {
      if (current.selectedImage?.kind === "upload" && current.selectedImage.previewUrl) URL.revokeObjectURL(current.selectedImage.previewUrl);
      return { ...initialState, selectedImage: { kind: "upload", id: `upload-${file.name}-${file.size}`, fileName: file.name, previewUrl: URL.createObjectURL(file), imageLabel: "◉", imageTone: "upload", fileSize: file.size } };
    });
    setSession((current) => current.selectedImage?.kind === "upload" ? {
      ...current,
      selectedImage: { ...current.selectedImage, previewUrl, imageLabel: "사진" },
    } : current);
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.setItem(uploadSessionKey, JSON.stringify({ selectedImage: { kind: "upload", id: `upload-${file.name}-${file.size}`, fileName: file.name, previewUrl: null, imageLabel: "사진", imageTone: "upload", fileSize: file.size }, result: null }));
    try {
      window.sessionStorage.setItem(uploadSessionKey, JSON.stringify({
        selectedImage: { kind: "upload", id: `upload-${file.name}-${file.size}`, fileName: file.name, previewUrl, imageLabel: "사진", imageTone: "upload", fileSize: file.size },
        result: null,
      }));
    } catch {
      setSession((current) => ({ ...current, error: "사진이 너무 커서 분석 화면으로 보관할 수 없습니다. 더 작은 사진을 선택해 주세요." }));
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!session.selectedImage || session.isAnalyzing || analysisLock.current) return false;
    const image = session.selectedImage;
    analysisLock.current = true;
    setSession((current) => ({ ...current, isAnalyzing: true, progress: 4, currentStep: "quality", completedSteps: [], result: null, error: null }));
    try {
      const result = await new Promise<SpeciesAnalysisResult>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("analysis-timeout")), 7_000);
        void mockSpeciesIdentificationService.identify(image, (step, progress) => {
          setSession((current) => ({ ...current, currentStep: step, progress, completedSteps: stepsBefore(step) }));
        }).then((value) => { window.clearTimeout(timeout); resolve(value); }, (cause: unknown) => { window.clearTimeout(timeout); reject(cause); });
      });
      setSession((current) => {
        const next = { ...current, isAnalyzing: false, result, progress: 100, currentStep: "safety" as AnalysisStep, completedSteps: ["quality", "shape", "similarity", "safety"] as AnalysisStep[] };
        persistDemoSession(next);
        return next;
      });
      analysisLock.current = false;
      return true;
    } catch (caught) {
      analysisLock.current = false;
      const uncertain = caught instanceof UncertainIdentificationError || caught instanceof Error;
      setSession((current) => ({ ...current, isAnalyzing: false, result: null, requiresRetake: uncertain, error: uncertain ? caught.message : "분석 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." }));
      return false;
    }
  }, [persistDemoSession, session.isAnalyzing, session.selectedImage]);

  const clear = useCallback(() => {
    analysisLock.current = false;
    setSession((current) => {
      if (current.selectedImage?.kind === "upload" && current.selectedImage.previewUrl) URL.revokeObjectURL(current.selectedImage.previewUrl);
      return initialState;
    });
    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem(uploadSessionKey);
  }, []);

  const value = useMemo(() => ({ ...session, isReady, selectDemo, selectFile, analyze, clear, clearError: () => setSession((current) => ({ ...current, error: null })) }), [analyze, clear, isReady, selectDemo, selectFile, session]);
  return <IdentificationContext.Provider value={value}>{children}</IdentificationContext.Provider>;
}

function stepsBefore(step: AnalysisStep): AnalysisStep[] {
  const ordered: AnalysisStep[] = ["quality", "shape", "similarity", "safety"];
  return ordered.slice(0, ordered.indexOf(step));
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("image-read-failed"));
    reader.readAsDataURL(file);
  });
}

export function useIdentification() {
  const context = useContext(IdentificationContext);
  if (!context) throw new Error("useIdentification must be used within IdentificationProvider");
  return context;
}
