"use client";

import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { useAuth } from "../components/auth-provider";
import { useDiscoveries } from "../components/discovery-provider";
import { user as demoUser } from "../data/mock-data";

export default function RewardsPage() {
  const { user } = useAuth();
  const { records } = useDiscoveries();
  const entries = records.map((record) => ({ id: record.id, title: `${record.speciesName} 발견 기록`, detail: `${record.locationName} · ${new Date(record.discoveredAt).toLocaleDateString("ko-KR")}`, points: record.scoreAwarded }));
  const earned = entries.reduce((sum, entry) => sum + entry.points, 0);
  const points = (user?.points ?? 0) + earned;
  return <ProtectedPage><AppShell><section className="rewards-page"><header className="rewards-hero"><p className="eyebrow">POINT HISTORY</p><h1>포인트 내역</h1><p>{user?.nickname ?? "탐험가"}님의 발견과 관찰 활동으로 쌓인 포인트입니다.</p><strong>{points.toLocaleString()}<small>P</small></strong></header><section className="reward-summary"><article><b>{entries.length}</b><span>최근 발견 보상</span></article><article><b>{earned.toLocaleString()}P</b><span>이번 기기에서 획득</span></article><article><b>0P</b><span>사용 포인트</span></article></section><section className="point-history"><div className="section-heading"><div><p className="eyebrow">ACTIVITY LOG</p><h2>최근 적립</h2></div></div>{entries.length === 0 ? <div className="empty-state"><b>＋</b><h2>아직 새 포인트 기록이 없어요</h2><p>생물을 발견하고 기록을 저장하면 포인트가 쌓입니다.</p></div> : entries.map((entry) => <article key={entry.id}><div className="point-icon">＋</div><div><strong>{entry.title}</strong><span>{entry.detail}</span></div><b>+{entry.points.toLocaleString()}P</b></article>)}<article className="point-seed"><div className="point-icon">◈</div><div><strong>데모 탐험가 시작 포인트</strong><span>발표용 초기 계정 보상</span></div><b>+{demoUser.points.toLocaleString()}P</b></article></section><p className="rewards-note">포인트 사용 및 리워드 교환은 다음 단계에서 연결됩니다. 현재 화면은 적립 내역을 안전하게 확인하는 용도입니다.</p></section></AppShell></ProtectedPage>;
}
