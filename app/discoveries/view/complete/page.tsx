"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell, ProtectedPage } from "../../../components/app-shell";
import { DiscoveryImage } from "../../../components/discovery-image";
import { useDiscoveries } from "../../../components/discovery-provider";
import { withBasePath } from "../../../base-path";

export default function DiscoveryCompletePage() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");
  const { getDiscovery, records, getCollectionEntries, isReady } = useDiscoveries();
  const record = recordId ? getDiscovery(recordId) : undefined;
  if (!isReady) return <div className="page-loading">저장 결과를 불러오는 중…</div>;
  if (!record) return <ProtectedPage><AppShell><section className="not-found"><b>?</b><h1>저장 결과를 찾을 수 없어요</h1><p>이 기기에 저장된 기록만 확인할 수 있습니다.</p><Link className="primary-action" href="/collection">내 도감으로 이동</Link></section></AppShell></ProtectedPage>;
  const collectionCount = getCollectionEntries().length;
  return <ProtectedPage><AppShell><section className="complete-hero"><p className="eyebrow">DISCOVERY SAVED</p><h1>발견 기록을 저장했어요!</h1><p>내 도감과 발견 지도에 바로 반영되었습니다.</p></section><section className="complete-card"><DiscoveryImage label={record.imageLabel} tone={record.imageTone} name={record.speciesName} /><div><span className="rarity">{record.rarity}</span><h2>{record.speciesName}</h2><p>{record.locationName} · {new Date(record.discoveredAt).toLocaleDateString("ko-KR")}</p></div><strong>+{record.scoreAwarded}P</strong></section><section className="complete-summary"><article><b>{record.isNewSpecies ? "새 종 등록" : "발견 기록 추가"}</b><span>{record.isNewSpecies ? "도감에 새로운 생물이 등록됐어요." : "기존 도감 기록이 업데이트됐어요."}</span></article><article><b>{collectionCount}종</b><span>현재 나의 도감</span></article><article><b>{records.length}회</b><span>이번 기기에서 저장한 기록</span></article></section><div className="complete-actions"><a className="primary-action" href={withBasePath(`/map?discoveryId=${record.id}`)}>⌖ 지도에서 보기</a><a className="outline-action" href={withBasePath(`/species?id=${encodeURIComponent(record.speciesId)}`)}>▦ 내 도감에서 보기</a><a className="outline-action" href={withBasePath(`/discoveries/view?id=${encodeURIComponent(record.id)}`)}>발견 기록 상세 보기</a><Link className="outline-action" href="/identify">다른 생물 촬영하기</Link><Link className="text-button" href="/">홈으로 이동</Link></div></AppShell></ProtectedPage>;
}
