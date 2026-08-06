"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { SelectedImagePreview } from "../components/selected-image-preview";
import { useIdentification } from "../components/identification-provider";
import type { DemoImageId } from "../types/ai-analysis";
import { pushAppRoute } from "../client-navigation";

const demos: Array<{ id: DemoImageId; name: string; note: string; label: string; tone: string }> = [
  { id: "purple-urchin", name: "보라성게", note: "신뢰도 94% 데모", label: "✹", tone: "urchin" },
  { id: "sea-anemone", name: "말미잘", note: "신뢰도 91% 데모", label: "✺", tone: "anemone" },
  { id: "rockfish", name: "쏨뱅이", note: "신뢰도 87% 데모", label: "◆", tone: "rockfish" },
];

export default function IdentifyPage() {
  const { selectedImage, error, selectDemo, selectFile, analyze, clear, clearError } = useIdentification();
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const chooseFile = (file?: File) => { if (file) { clearError(); selectFile(file); } };
  const startAnalysis = () => { if (!selectedImage) return; void analyze(); pushAppRoute(router, "/identify/result"); };

  return <ProtectedPage><AppShell>
    <header className="identify-heading"><p className="eyebrow">AI SPECIES FINDER</p><h1>바다 생물 사진을<br />선택해 주세요</h1><p>몸 전체와 무늬가 선명하게 보이는 사진일수록 더 정확한 후보를 안내할 수 있어요.</p></header>
    {error && <div className="upload-error" role="alert"><b>!</b><span>{error}</span><button onClick={clearError} aria-label="오류 닫기">×</button></div>}
    {!selectedImage ? <>
      <section className="capture-panel" aria-labelledby="capture-title"><div className="capture-symbol">◎</div><h2 id="capture-title">어떤 방식으로 촬영할까요?</h2><p>카메라를 사용하거나 기기에 저장된 사진을 선택할 수 있습니다.</p><div className="capture-actions"><button className="primary-action" onClick={() => cameraInput.current?.click()}>▣ 카메라로 촬영</button><button className="outline-action" onClick={() => fileInput.current?.click()}>▤ 갤러리·파일 선택</button></div><input ref={cameraInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} /><input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} /></section>
      <section className="demo-section"><div className="section-heading"><div><p className="eyebrow">QUICK DEMO</p><h2>준비된 데모 이미지</h2></div><span>발표 추천</span></div><div className="demo-image-grid">{demos.map((demo) => <button key={demo.id} className="demo-image-card" onClick={() => selectDemo(demo.id)}><div className={`demo-thumb tone-${demo.tone}`}><span>{demo.label}</span></div><strong>{demo.name}</strong><small>{demo.note}</small></button>)}</div></section>
      <section className="photo-guide"><h2>선명한 결과를 위한 촬영 팁</h2><ul><li><b>01</b><span>생물 전체가 화면 중앙에 오도록 촬영하세요.</span></li><li><b>02</b><span>그림자가 적고 무늬가 보이는 밝은 환경이 좋아요.</span></li><li><b>03</b><span>정체를 모르는 생물은 손으로 움직이지 마세요.</span></li></ul></section>
    </> : <section className="selected-panel"><SelectedImagePreview image={selectedImage} large /><div className="selected-meta"><p className="eyebrow">PHOTO READY</p><h2>사진을 확인해 주세요</h2><p className="file-name">▣ {selectedImage.fileName}</p><div className="selected-actions"><button className="primary-action" onClick={startAnalysis}>✦ AI로 생물 확인하기</button><button className="outline-action" onClick={() => selectedImage.kind === "demo" ? clear() : fileInput.current?.click()}>↻ 다시 선택하기</button><button className="text-button danger" onClick={clear}>취소하기</button></div><input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} /></div></section>}
    <aside className="identify-safety">⚠ <span><b>안전 안내</b> 독성이 의심되거나 정체를 알 수 없는 생물은 직접 만지지 마세요.</span></aside>
  </AppShell></ProtectedPage>;
}
