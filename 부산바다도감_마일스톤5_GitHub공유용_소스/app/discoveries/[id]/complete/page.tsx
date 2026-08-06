"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { ProtectedPage } from "../../../components/protected-page";
import { DiscoveryImage } from "../../../components/discovery-image";
import { useDiscoveries } from "../../../components/discovery-provider";
import { user } from "../../../data/mock-data";

export default function DiscoveryCompletePage() {
  const params = useParams<{ id: string }>();
  const { getDiscovery, records, isReady } = useDiscoveries();
  const record = getDiscovery(params.id);
  if (!isReady) return <div className="page-loading">저장 결과를 확인하는 중…</div>;
  if (!record) return <ProtectedPage><AppShell><section className="not-found"><b>?</b><h1>발견 기록을 찾을 수 없어요</h1><p>기록이 삭제되었거나 주소가 올바르지 않습니다.</p><Link className="primary-action" href="/collection">내 도감으로 이동</Link></section></AppShell></ProtectedPage>;

  const addedSpecies = new Set(records.map((item) => item.speciesId)).size;
  const speciesCount = user.discoveredSpeciesCount + addedSpecies;
  const totalCount = user.discoveryCount + records.length;
  return <ProtectedPage><AppShell>
    <section className="complete-hero"><div className="complete-check">✓</div><p className="eyebrow">DISCOVERY SAVED</p><h1>발견 기록을 저장했어요!</h1><p>{record.isNewSpecies ? "새로운 생물이 내 도감에 자동으로 등록되었습니다." : "기존 도감의 발견 횟수와 최근 발견일을 갱신했습니다."}</p></section>
    <section className="complete-card"><DiscoveryImage label={record.imageLabel} tone={record.imageTone} name={record.speciesName} /><div><span className="rarity 보통">{record.rarity}</span><h2>{record.speciesName}</h2><p>{record.locationName} · {new Date(record.discoveredAt).toLocaleDateString("ko-KR")}</p><strong>+{record.scoreAwarded}P</strong>{record.duplicateWarning && <small>⚠ {record.duplicateWarning}</small>}</div></section>
    <section className="complete-stats"><article><strong>{speciesCount}</strong><span>현재 발견 종</span></article><article><strong>{totalCount}</strong><span>총 발견 기록</span></article><article><strong>{Math.min(100, Math.round((speciesCount / 30) * 100))}%</strong><span>컬렉션 진행률</span></article></section>
    <aside className="map-preview">⌖ <span><b>{record.locationName}</b>{record.latitude ? `${record.latitude.toFixed(4)}, ${record.longitude?.toFixed(4)}` : "좌표가 없어 지도 목록에만 표시됩니다."}</span></aside>
    <div className="complete-actions"><a className="primary-action" href={`/map?discoveryId=${record.id}`}>⌖ 지도에서 보기</a><Link className="outline-action" href={`/species/${record.speciesId}`}>▦ 내 도감에서 보기</Link><Link className="outline-action" href={`/discoveries/${record.id}`}>발견 기록 상세 보기</Link><button className="outline-action" onClick={() => window.alert("커뮤니티 공유는 마일스톤 6에서 연결됩니다.")}>커뮤니티에 공유하기</button><Link className="outline-action" href="/identify">다른 생물 촬영하기</Link><Link className="text-button" href="/">홈으로 이동</Link></div>
  </AppShell></ProtectedPage>;
}
