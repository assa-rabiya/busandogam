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
  { id: "quality", label: "?´ë?ì§€ ?ˆì§ˆ ?•ì¸", icon: "?? }, { id: "shape", label: "?ë¬¼ ?•íƒœ ë¶„ì„", icon: "?? }, { id: "similarity", label: "? ì‚¬ ì¢?ë¹„êµ", icon: "?? }, { id: "safety", label: "?ˆì „ ?•ë³´ ?•ì¸", icon: "?? },
];

export default function IdentifyResultPage() {
  const { selectedImage, isReady, isAnalyzing, progress, currentStep, completedSteps, result, error, clear } = useIdentification();
  const router = useRouter();
  const [showCandidates, setShowCandidates] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { if (isReady && (!selectedImage || (!isAnalyzing && !result))) replaceAppRoute(router, "/identify"); }, [isAnalyzing, isReady, result, router, selectedImage]);
  if (!isReady || !selectedImage) return <div className="page-loading">ë¶„ì„ ?°ì´?°ë? ?•ì¸?˜ëŠ” ì¤‘â€?/div>;

  const shootAgain = () => { clear(); pushAppRoute(router, "/identify"); };
  if (isAnalyzing || !result) return <ProtectedPage><AppShell><section className="analysis-layout"><SelectedImagePreview image={selectedImage} large /><div className="analysis-progress"><p className="eyebrow">AI ANALYSIS</p><h1>?ë¬¼???¹ì§•??br />?´í´ë³´ê³  ?ˆì–´??/h1><p>?¬ì§„???«ì? ë§ê³  ? ì‹œë§?ê¸°ë‹¤??ì£¼ì„¸??</p><div className="progress analysis-bar"><i style={{ width: `${progress}%` }} /></div><div className="progress-label"><b>{progress}%</b><span>?ˆìƒ ?Œìš” ?œê°„ ??2ì´?/span></div><ol>{stepInfo.map((step) => { const done = completedSteps.includes(step.id); const active = currentStep === step.id && !done; return <li key={step.id} className={done ? "done" : active ? "active" : ""}><b>{done ? "?? : step.icon}</b><span>{step.label}</span><small>{done ? "?„ë£Œ" : active ? "ë¶„ì„ ì¤? : "?€ê¸?}</small></li>; })}</ol>{error && <p className="upload-error">{error}</p>}</div></section></AppShell></ProtectedPage>;

  return <ProtectedPage><AppShell><div className="result-label">??AI ë¶„ì„ ê²°ê³¼</div><section className="result-layout"><div className="result-photo"><SelectedImagePreview image={selectedImage} large /><div className="confidence-card"><span>AI ì¶”ì • ? ë¢°??/span><strong>{result.confidence}%</strong><div className="progress"><i style={{ width: `${result.confidence}%` }} /></div></div></div><div className="result-info"><p className="eyebrow">MOST LIKELY SPECIES</p><h1>{result.koreanName}</h1><p className="scientific-name">{result.scientificName}</p><div className="result-tags"><span>{result.category}</span><span>{result.rarity}</span><span>? ë¢°??{result.confidence}%</span></div><Link className="card-link" href={`/species?id=${encodeURIComponent(result.id)}`}>?ë¬¼ ?ì„¸ ë³´ê¸° ??/Link><p className="result-summary">{result.summary}</p><h2>ì£¼ìš” ?¹ì§•</h2><ul className="feature-list">{result.features.map((feature) => <li key={feature}>??{feature}</li>)}</ul></div></section>
    {(result.riskLevel !== "??Œ" || result.toxic) && <section className={`risk-card risk-${result.riskLevel}`}><b>??{result.riskLevel === "?„í—˜" ? "?„í—˜ ?ë¬¼ ì£¼ì˜" : "ê´€ì°???ì£¼ì˜"}</b><p>{result.toxic ? "?…ì„± ?ëŠ” ?…ì¹¨ ê°€?¥ì„±???ˆìŠµ?ˆë‹¤. " : ""}{result.touchable ? "ì¡°ì‹¬?´ì„œ ê´€ì°°í•˜?¸ìš”." : "ë§¨ì†?¼ë¡œ ë§Œì?ì§€ ë§ê³  ì¶©ë¶„??ê±°ë¦¬ë¥?? ì??˜ì„¸??"}</p></section>}
    <section className="result-details"><h2>ê´€ì°??•ë³´</h2><dl><div><dt>?…ì„± ?¬ë?</dt><dd>{result.toxic ? "???…ì„± ê°€?¥ì„± ?ˆìŒ" : "???Œë ¤ì§??…ì„± ?†ìŒ"}</dd></div><div><dt>?„í—˜??/dt><dd>??{result.riskLevel}</dd></div><div><dt>?‘ì´‰ ê°€??/dt><dd>{result.touchable ? "??ì¡°ì‹¬?´ì„œ ê°€?? : "Ã— ë§Œì?ì§€ ?Šê¸°"}</dd></div><div><dt>ì£¼ìš” ?œì‹ì§€</dt><dd>{result.habitat}</dd></div><div><dt>?œë™ ê³„ì ˆ</dt><dd>{result.activeSeasons.join(" Â· ")}</dd></div><div><dt>ë¶€??ë°œê²¬ ì§€??/dt><dd>{result.commonLocations.join(" Â· ")}</dd></div></dl></section>
    <section className="precautions"><h2>ê´€ì°???ì£¼ì˜?¬í•­</h2><ul>{result.precautions.map((item) => <li key={item}>??{item}</li>)}</ul></section>
    <section className="ai-disclaimer">??AI ë¶„ì„ ê²°ê³¼??ì°¸ê³ ?©ì´ë©??¤ì œ ì¢…ê³¼ ?¤ë? ???ˆìŠµ?ˆë‹¤. ?•ì²´ë¥??????†ê±°???…ì„±???˜ì‹¬?˜ëŠ” ?ë¬¼?€ ì§ì ‘ ë§Œì?ì§€ ë§ˆì„¸??</section>
    <div className="result-actions"><button className="primary-action" onClick={() => pushAppRoute(router, "/discoveries/new")}>??ë°œê²¬ ê¸°ë¡ ?€?¥í•˜ê¸?/button><button className="outline-action" onClick={() => { setNotice("?„ê° ?±ë¡???„í•´ ë°œê²¬ ?•ë³´ë¥??…ë ¥??ì£¼ì„¸??"); window.setTimeout(() => pushAppRoute(router, "/discoveries/new"), 650); }}>?????„ê°??ì¶”ê??˜ê¸°</button><button className="outline-action" onClick={() => setShowCandidates((value) => !value)}>???¤ë¥¸ ?„ë³´ ë³´ê¸°</button><button className="text-button" onClick={shootAgain}>???¤ì‹œ ì´¬ì˜?˜ê¸°</button></div>
    {notice && <div className="result-notice" role="status">{notice}<button onClick={() => setNotice(null)}>?•ì¸</button></div>}
    {showCandidates && <section className="candidate-panel"><div className="section-heading"><div><p className="eyebrow">OTHER CANDIDATES</p><h2>ë¹„ìŠ·???ë¬¼ ?„ë³´</h2></div><button className="text-button" onClick={() => setShowCandidates(false)}>?«ê¸°</button></div>{result.candidates.map((candidate, index) => <article key={`${candidate.id}-${index}`}><b>{index + 1}</b><span className="candidate-icon">{candidate.imageLabel}</span><div><strong>{candidate.koreanName}</strong><small>{candidate.scientificName}</small></div><em>{candidate.confidence}%</em></article>)}</section>}
  </AppShell></ProtectedPage>;
}
