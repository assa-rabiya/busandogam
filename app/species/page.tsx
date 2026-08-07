"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { speciesCatalog } from "../data/discovery-data";
import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { DiscoveryImage } from "../components/discovery-image";
import { useDiscoveries } from "../components/discovery-provider";
import { AppLink as Link } from "../components/app-link";

const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function SpeciesDetailPage() {
  const searchParams = useSearchParams();
  const [browserQuery, setBrowserQuery] = useState<{ checked: boolean; speciesId: string | null }>({ checked: false, speciesId: null });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBrowserQuery({ checked: true, speciesId: new URLSearchParams(window.location.search).get("id") ?? window.sessionStorage.getItem("busan-sea-guide-selected-species") });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const speciesId = searchParams.get("id") ?? browserQuery.speciesId;
  const species = speciesCatalog.find((item) => item.id === speciesId);
  const { getDiscoveriesBySpecies, isReady } = useDiscoveries();

  if (!isReady) return <div className="page-loading">생물 정보를 불러오는 중…</div>;
  if (!species) return <ProtectedPage><AppShell><section className="not-found"><b>?</b><h1>생물 정보를 찾을 수 없어요</h1><p>도감에서 생물을 선택해 다시 열어 주세요.</p><Link className="primary-action" href="/collection">도감으로 돌아가기</Link></section></AppShell></ProtectedPage>;

  const records = getDiscoveriesBySpecies(species.id).sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
  const locations = new Set(records.map((record) => record.locationName)).size;
  const maxSize = Math.max(...records.map((record) => record.size ?? 0)) || null;

  return <ProtectedPage><AppShell><section className="species-hero"><DiscoveryImage label={species.imageLabel} tone={species.imageTone ?? "upload"} name={species.koreanName} /><div><p className="eyebrow">SPECIES GUIDE</p><h1>{species.koreanName}</h1><p className="scientific-name">{species.scientificName}</p><div className="result-tags"><span>{species.category}</span><span>{species.rarity}</span><span>{species.toxic ? "⚠ 독성 가능" : "✓ 독성 없음"}</span></div><p>{species.description}</p></div></section>{(species.toxic || species.riskLevel === "위험") && <aside className={`risk-card risk-${species.riskLevel}`}><b>⚠ 안전 주의</b><p>{species.touchable ? "조심해서 관찰하세요." : "직접 만지지 말고 충분한 거리를 유지하세요."}</p></aside>}<section className="species-info"><div><h2>주요 특징</h2><ul>{species.features?.map((item) => <li key={item}>✓ {item}</li>)}</ul></div><dl><div><dt>위험도</dt><dd>{species.riskLevel}</dd></div><div><dt>접촉</dt><dd>{species.touchable ? "가능" : "만지지 않기"}</dd></div><div><dt>서식 환경</dt><dd>{species.habitat}</dd></div><div><dt>활동 계절</dt><dd>{species.activeSeasons?.join(" · ")}</dd></div><div><dt>부산 발견 지역</dt><dd>{species.commonLocations?.join(" · ")}</dd></div></dl></section><section className="precautions"><h2>관찰 시 주의사항</h2><ul>{species.precautions?.map((item) => <li key={item}>⚠ {item}</li>)}</ul></section><section className="season-chart"><div className="section-heading"><div><p className="eyebrow">SEASONAL DATA</p><h2>월별 출현 정보</h2></div></div><div>{months.map((month, index) => <article key={month}><span>{month}</span><i><b style={{ height: `${(species.monthlyAppearance?.[index] ?? 0) * 10}%` }} /></i></article>)}</div></section><section className="my-species-records"><div className="section-heading"><div><p className="eyebrow">MY DISCOVERIES</p><h2>나의 발견 기록</h2></div><span>{records.length}회</span></div><div className="species-stats"><article><strong>{records[0] ? new Date(records.at(-1)?.discoveredAt ?? "").toLocaleDateString("ko-KR") : "–"}</strong><span>최초 발견</span></article><article><strong>{records[0] ? new Date(records[0].discoveredAt).toLocaleDateString("ko-KR") : "–"}</strong><span>최근 발견</span></article><article><strong>{locations}</strong><span>발견 장소</span></article><article><strong>{maxSize ? `${maxSize}cm` : "–"}</strong><span>최대 크기</span></article></div>{records.length === 0 ? <div className="empty-state"><b>◎</b><h3>아직 직접 저장한 기록이 없어요</h3><Link className="primary-action" href="/identify">첫 기록 남기기</Link></div> : <div className="record-list">{records.slice(0, 5).map((record) => <Link href={`/discoveries/view?id=${encodeURIComponent(record.id)}`} key={record.id}><DiscoveryImage label={record.imageLabel} tone={record.imageTone} name={record.speciesName} /><div><strong>{record.locationName}</strong><span>{new Date(record.discoveredAt).toLocaleString("ko-KR")}</span></div><em>+{record.scoreAwarded}P</em></Link>)}</div>}</section></AppShell></ProtectedPage>;
}
