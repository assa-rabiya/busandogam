"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLink as Link } from "../../components/app-link";
import { AppShell } from "../../components/app-shell";
import { ProtectedPage } from "../../components/protected-page";
import { SelectedImagePreview } from "../../components/selected-image-preview";
import { useIdentification } from "../../components/identification-provider";
import type { AnalysisStep } from "../../types/ai-analysis";
import { pushAppRoute, replaceAppRoute } from "../../client-navigation";

const stepInfo: Array<{ id: AnalysisStep; label: string; icon: string }> = [
  { id: "quality", label: "이미지 품질 확인", icon: "▣" }, { id: "shape", label: "생물 형태 분석", icon: "◌" }, { id: "similarity", label: "유사 종 비교", icon: "≋" }, { id: "safety", label: "안전 정보 확인", icon: "⚠" },
];

export default function IdentifyResultPage() {
  const { selectedImage, isReady, isAnalyzing, progress, currentStep, completedSteps, result, error, clear } = useIdentification();
  const router = useRouter();
  const [showCandidates, setShowCandidates] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { if (isReady && (!selectedImage || (!isAnalyzing && !result))) replaceAppRoute(router, "/identify"); }, [isAnalyzing, isReady, result, router, selectedImage]);
  if (!isReady || !selectedImage) return <div className="page-loading">분석 데이터를 확인하는 중…</div>;

  const shootAgain = () => { clear(); pushAppRoute(router, "/identify"); };
  if (isAnalyzing || !result) return <ProtectedPage><AppShell><section className="analysis-layout"><SelectedImagePreview image={selectedImage} large /><div className="analysis-progress"><p className="eyebrow">AI ANALYSIS</p><h1>생물의 특징을<br />살펴보고 있어요</h1><p>사진을 닫지 말고 잠시만 기다려 주세요.</p><div className="progress analysis-bar"><i style={{ width: `${progress}%` }} /></div><div className="progress-label"><b>{progress}%</b><span>예상 소요 시간 약 2초</span></div><ol>{stepInfo.map((step) => { const done = completedSteps.includes(step.id); const active = currentStep === step.id && !done; return <li key={step.id} className={done ? "done" : active ? "active" : ""}><b>{done ? "✓" : step.icon}</b><span>{step.label}</span><small>{done ? "완료" : active ? "분석 중" : "대기"}</small></li>; })}</ol>{error && <p className="upload-error">{error}</p>}</div></section></AppShell></ProtectedPage>;

  return <ProtectedPage><AppShell><div className="result-label">✦ AI 분석 결과</div><section className="result-layout"><div className="result-photo"><SelectedImagePreview image={selectedImage} large /><div className="confidence-card"><span>AI 추정 신뢰도</span><strong>{result.confidence}%</strong><div className="progress"><i style={{ width: `${result.confidence}%` }} /></div></div></div><div className="result-info"><p className="eyebrow">MOST LIKELY SPECIES</p><h1>{result.koreanName}</h1><p className="scientific-name">{result.scientificName}</p><div className="result-tags"><span>{result.category}</span><span>{result.rarity}</span><span>신뢰도 {result.confidence}%</span></div><Link className="card-link" href={`/species?id=${encodeURIComponent(result.id)}`}>생물 상세 보기 →</Link><p className="result-summary">{result.summary}</p><h2>주요 특징</h2><ul className="feature-list">{result.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul></div></section>
    {(result.riskLevel !== "낮음" || result.toxic) && <section className={`risk-card risk-${result.riskLevel}`}><b>⚠ {result.riskLevel === "위험" ? "위험 생물 주의" : "관찰 시 주의"}</b><p>{result.toxic ? "독성 또는 독침 가능성이 있습니다. " : ""}{result.touchable ? "조심해서 관찰하세요." : "맨손으로 만지지 말고 충분한 거리를 유지하세요."}</p></section>}
    <section className="result-details"><h2>관찰 정보</h2><dl><div><dt>독성 여부</dt><dd>{result.toxic ? "⚠ 독성 가능성 있음" : "✓ 알려진 독성 없음"}</dd></div><div><dt>위험도</dt><dd>⚠ {result.riskLevel}</dd></div><div><dt>접촉 가능</dt><dd>{result.touchable ? "✓ 조심해서 가능" : "× 만지지 않기"}</dd></div><div><dt>주요 서식지</dt><dd>{result.habitat}</dd></div><div><dt>활동 계절</dt><dd>{result.activeSeasons.join(" · ")}</dd></div><div><dt>부산 발견 지역</dt><dd>{result.commonLocations.join(" · ")}</dd></div></dl></section>
    <section className="precautions"><h2>관찰 시 주의사항</h2><ul>{result.precautions.map((item) => <li key={item}>⚠ {item}</li>)}</ul></section>
    <section className="ai-disclaimer">ⓘ AI 분석 결과는 참고용이며 실제 종과 다를 수 있습니다. 정체를 알 수 없거나 독성이 의심되는 생물은 직접 만지지 마세요.</section>
    <div className="result-actions"><button className="primary-action" onClick={() => pushAppRoute(router, "/discoveries/new")}>⌖ 발견 기록 저장하기</button><button className="outline-action" onClick={() => { setNotice("도감 등록을 위해 발견 정보를 입력해 주세요."); window.setTimeout(() => pushAppRoute(router, "/discoveries/new"), 650); }}>▦ 내 도감에 추가하기</button><button className="outline-action" onClick={() => setShowCandidates((value) => !value)}>≋ 다른 후보 보기</button><button className="text-button" onClick={shootAgain}>↻ 다시 촬영하기</button></div>
    {notice && <div className="result-notice" role="status">{notice}<button onClick={() => setNotice(null)}>확인</button></div>}
    {showCandidates && <section className="candidate-panel"><div className="section-heading"><div><p className="eyebrow">OTHER CANDIDATES</p><h2>비슷한 생물 후보</h2></div><button className="text-button" onClick={() => setShowCandidates(false)}>닫기</button></div>{result.candidates.map((candidate, index) => <article key={`${candidate.id}-${index}`}><b>{index + 1}</b><span className="candidate-icon">{candidate.imageLabel}</span><div><strong>{candidate.koreanName}</strong><small>{candidate.scientificName}</small></div><em>{candidate.confidence}%</em></article>)}</section>}
  </AppShell></ProtectedPage>;
}
