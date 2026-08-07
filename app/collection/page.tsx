"use client";

import { useMemo, useState } from "react";
import { AppLink as Link } from "../components/app-link";
import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { DiscoveryImage } from "../components/discovery-image";
import { useDiscoveries } from "../components/discovery-provider";
import { useAuth } from "../components/auth-provider";
import { baselineDiscoveredSpeciesIds, speciesCatalog } from "../data/discovery-data";

type StatusFilter = "전체" | "발견 완료" | "미발견" | "희귀 생물" | "독성 생물";
type SortType = "최근 발견순" | "발견 횟수순" | "희귀도순" | "이름순";
const rarityWeight = { "흔함": 0, "보통": 1, "희귀": 2, "매우 희귀": 3 };

export default function CollectionPage() {
  const { records, getCollectionEntries } = useDiscoveries();
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusFilter>("전체");
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState<SortType>("최근 발견순");
  const entries = getCollectionEntries();
  const customIds = new Set(entries.map((entry) => entry.speciesId));
  const usesDemoBaseline = user?.accountType !== "guest";
  const unlockedIds = new Set([...(usesDemoBaseline ? baselineDiscoveredSpeciesIds : []), ...customIds]);

  const items = useMemo(() => speciesCatalog.map((species) => {
    const entry = entries.find((item) => item.speciesId === species.id);
    const baseline = usesDemoBaseline && baselineDiscoveredSpeciesIds.includes(species.id);
    return {
      species,
      unlocked: baseline || Boolean(entry),
      count: entry?.discoveryCount ?? (baseline ? 2 : 0),
      first: entry?.firstDiscoveredAt ?? (baseline ? "2026-07-12T10:00:00" : ""),
      last: entry?.lastDiscoveredAt ?? (baseline ? "2026-08-02T10:00:00" : ""),
      locations: entry?.locationCount ?? (baseline ? 2 : 0),
    };
  }).filter((item) => category === "전체" || item.species.category === category)
    .filter((item) => status === "전체"
      || (status === "발견 완료" && item.unlocked)
      || (status === "미발견" && !item.unlocked)
      || (status === "희귀 생물" && ["희귀", "매우 희귀"].includes(item.species.rarity))
      || (status === "독성 생물" && item.species.toxic))
    .sort((a, b) => sort === "발견 횟수순" ? b.count - a.count
      : sort === "희귀도순" ? rarityWeight[b.species.rarity] - rarityWeight[a.species.rarity]
      : sort === "이름순" ? a.species.koreanName.localeCompare(b.species.koreanName, "ko")
      : b.last.localeCompare(a.last)), [category, entries, sort, status, usesDemoBaseline]);

  const discovered = unlockedIds.size;
  const rareCount = speciesCatalog.filter((item) => unlockedIds.has(item.id) && ["희귀", "매우 희귀"].includes(item.rarity)).length;

  return <ProtectedPage><AppShell>
    <header className="collection-header"><p className="eyebrow">MY SEA COLLECTION</p><h1>나의 바다 도감</h1><p>미발견 생물도 이름과 흑백 사진을 확인할 수 있어 다음 탐험의 목표를 정할 수 있습니다.</p></header>
    <section className="collection-summary"><article><strong>{discovered}</strong><span>발견한 생물</span></article><article><strong>{speciesCatalog.length}</strong><span>전체 생물</span></article><article><strong>{Math.round((discovered / speciesCatalog.length) * 100)}%</strong><span>달성률</span></article><article><strong>{48 + records.length}</strong><span>총 발견 횟수</span></article><article><strong>{customIds.size}</strong><span>이번 달 새 종</span></article><article><strong>{rareCount}</strong><span>희귀 생물</span></article></section>
    <section className="collection-controls"><div className="filter-tabs">{(["전체", "발견 완료", "미발견", "희귀 생물", "독성 생물"] as StatusFilter[]).map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => setStatus(item)}>{item}</button>)}</div><div><select aria-label="카테고리 필터" value={category} onChange={(event) => setCategory(event.target.value)}>{["전체", "어류", "연체동물", "갑각류", "극피동물", "자포동물", "해조류", "기타"].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="도감 정렬" value={sort} onChange={(event) => setSort(event.target.value as SortType)}>{(["최근 발견순", "발견 횟수순", "희귀도순", "이름순"] as SortType[]).map((item) => <option key={item}>{item}</option>)}</select></div></section>
    {items.length === 0 ? <section className="empty-state"><b>⌕</b><h2>조건에 맞는 생물이 없어요</h2><p>필터를 바꾸거나 새로운 관찰 기록을 남겨 보세요.</p></section> : <section className="collection-grid">{items.map(({ species, unlocked, count, first, last, locations }) => <article key={species.id} className={`collection-card ${unlocked ? "" : "locked"}`}>
      <DiscoveryImage label={species.imageLabel} tone={species.imageTone ?? "upload"} name={species.koreanName} />
      <div><div className="collection-card-top"><span className={`rarity ${species.rarity}`}>{species.rarity}</span><small>{unlocked ? "✓ 도감 등록" : "▣ 미발견"}</small></div><h2>{species.koreanName}</h2><p>{unlocked ? species.scientificName : `${species.category} · 아직 발견하지 못했어요`}</p>{unlocked && <dl><div><dt>분류</dt><dd>{species.category}</dd></div><div><dt>발견</dt><dd>{count}회 · {locations}곳</dd></div><div><dt>최초</dt><dd>{new Date(first).toLocaleDateString("ko-KR")}</dd></div><div><dt>최근</dt><dd>{new Date(last).toLocaleDateString("ko-KR")}</dd></div></dl>}<Link className={unlocked ? "card-link" : "card-link disabled"} href={unlocked ? `/species?id=${encodeURIComponent(species.id)}` : "/identify"}>{unlocked ? "상세보기 →" : "촬영해서 발견하기 →"}</Link></div>
    </article>)}</section>}
  </AppShell></ProtectedPage>;
}
