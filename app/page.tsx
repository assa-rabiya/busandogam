"use client";
import { AppLink as Link } from "./components/app-link";
import { AppShell } from "./components/app-shell";
import { ImageTile } from "./components/image-tile";
import { locations, popularSpecies, recentDiscoveries } from "./data/mock-data";
import { user } from "./data/mock-data";
import { useDiscoveries } from "./components/discovery-provider";
import { DiscoveryImage } from "./components/discovery-image";
import { withBasePath } from "./base-path";

export default function Home() {
  const { records, getRecentDiscoveries } = useDiscoveries();
  const recentRecords = getRecentDiscoveries(6);
  const addedSpecies = new Set(records.map((record) => record.speciesId)).size;
  const addedLocations = new Set(records.map((record) => record.locationName)).size;
  const addedPoints = records.reduce((sum, record) => sum + record.scoreAwarded, 0);
  return <AppShell>
    <section className="hero"><p className="eyebrow">BUSAN SEA FIELD GUIDE</p><h1>사진으로 발견하고,<br />지도에 기록하는 부산의 바다 생물 도감</h1><p>바다에서 만난 생물을 촬영하면 AI가 종을 추정하고 특징과 주의사항을 알려드립니다.</p><div className="hero-actions"><Link className="primary-button" href="/identify">◎ 생물 촬영하기</Link><a className="secondary-button" href={withBasePath("/map")}>⌖ 발견 지도 보기</a></div><div className="wave" aria-hidden="true"><i /><i /><i /></div></section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">MY ACTIVITY</p><h2>내 활동 요약</h2></div><Link className="text-link" href="/profile">프로필 보기 →</Link></div><div className="activity-grid">{[[(user.discoveredSpeciesCount + addedSpecies).toString(), "발견한 생물", "종"], [(user.discoveryCount + records.length).toString(), "발견 기록", "회"], [(user.visitedLocationCount + addedLocations).toString(), "방문 지역", "곳"], [(user.points + addedPoints).toLocaleString(), "보유 포인트", "P"]].map(([value, label, unit]) => <article key={label}><strong>{value}<small>{unit}</small></strong><span>{label}</span></article>)}</div></section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">TODAY&apos;S SPOTS</p><h2>오늘의 추천 탐험지</h2></div><a className="text-link" href={withBasePath("/map")}>지도에서 보기 →</a></div><div className="spot-grid">{locations.map((spot) => <article className="spot-card" key={spot.id}><ImageTile label={spot.imageLabel} alt={spot.name} imageUrl={spot.imageUrl} /><div><span className={`difficulty ${spot.difficulty}`}>● {spot.difficulty}</span><h3>{spot.name}</h3><p>{spot.speciesHint}</p><dl><div><dt>추천 시간</dt><dd>{spot.bestTime}</dd></div><div><dt>환경</dt><dd>{spot.habitat}</dd></div></dl><a href={withBasePath("/map")} className="card-link">상세보기 →</a></div></article>)}</div></section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">RECENT DISCOVERIES</p><h2>최근 발견</h2></div></div><div className="discoveries-row">{recentRecords.map((item) => <article className="discovery-card" key={item.id}><DiscoveryImage label={item.imageLabel} tone={item.imageTone} name={item.speciesName} /><div><span className={`rarity ${item.rarity}`}>{item.rarity}</span><h3>{item.speciesName}</h3><p>{item.locationName} · {new Date(item.discoveredAt).toLocaleDateString("ko-KR")}</p></div></article>)}{recentDiscoveries.slice(0, Math.max(0, 6 - recentRecords.length)).map((item) => <article className="discovery-card" key={item.id}><ImageTile label={item.imageLabel} alt={item.speciesName} /><div><span className={`rarity ${item.rarity}`}>{item.rarity}</span><h3>{item.speciesName}</h3><p>{item.location} · {item.discoveredAt}</p></div></article>)}</div></section>
    <section className="home-section popularity"><div className="section-heading"><div><p className="eyebrow">AUGUST TREND</p><h2>이번 달 인기 생물</h2></div></div><ol>{popularSpecies.map((item) => <li key={item.rank}><b>{item.rank}</b><strong>{item.name}</strong><span>{item.count}회 발견</span><em className={item.trend}>↗ {item.change}</em></li>)}</ol></section>
    <section className="safety-card" aria-labelledby="safety-title"><p className="eyebrow">SAFETY FIRST</p><h2 id="safety-title">안전한 관찰을 위한 약속</h2><ul><li>⚠ 독성이 의심되는 생물은 만지지 않기</li><li>◈ 미끄러운 바위와 파도 주의</li><li>◷ 조수 시간을 먼저 확인하기</li><li>♧ 보호종과 어린 개체는 채집하지 않기</li></ul></section>
  </AppShell>;
}
