"use client";

import { useState } from "react";
import { useAppRouter as useRouter } from "../use-app-router";
import { AppLink as Link } from "../components/app-link";
import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { useAuth } from "../components/auth-provider";
import { useDiscoveries } from "../components/discovery-provider";
import { recentActivities } from "../data/mock-data";
import { getAchievements } from "../services/achievements";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { records } = useDiscoveries();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!user) return <ProtectedPage><></></ProtectedPage>;

  const isGuest = user.accountType === "guest";
  const progress = Math.round((user.experience / user.nextLevelExperience) * 100);
  const addedSpecies = new Set(records.map((record) => record.speciesId)).size;
  const addedLocations = new Set(records.map((record) => record.locationName)).size;
  const addedPoints = records.reduce((sum, record) => sum + record.scoreAwarded, 0);
  const activities = [
    ...records.slice(0, 5).map((record) => ({ id: record.id, icon: "⌖", text: `${record.locationName}에서 ${record.speciesName} 발견 기록을 저장했어요.`, time: new Date(record.createdAt).toLocaleDateString("ko-KR") })),
    ...(isGuest ? [] : recentActivities),
  ].slice(0, 5);
  const recentBadge = getAchievements(records, user).find((badge) => badge.earned) ?? null;
  const leave = () => { logout(); router.replace("/login"); };

  return <ProtectedPage><AppShell>
    <section className="profile-hero"><div className="avatar-large">{isGuest ? "게" : "민"}</div><div><p className="eyebrow">LEVEL {user.level} EXPLORER</p><h1>{user.nickname}</h1><span className="badge-pill">◈ {user.representativeBadge}</span></div></section>
    <section className="experience-card"><div><strong>다음 레벨까지</strong><span>{user.experience} / {user.nextLevelExperience} XP</span></div><div className="progress" aria-label={`경험치 ${progress}%`}><i style={{ width: `${progress}%` }} /></div><p>발견 기록을 남기면 레벨업에 가까워져요. <b>{progress}% 진행</b></p></section>
    <section className="profile-stats">{[[user.discoveredSpeciesCount + addedSpecies, "발견한 종", "종"], [user.discoveryCount + records.length, "총 발견 기록", "회"], [user.visitedLocationCount + addedLocations, "방문 지역", "곳"], [user.postCount, "작성 게시물", "개"], [(user.points + addedPoints).toLocaleString(), "보유 포인트", "P"]].map(([value, label, unit]) => <article key={label as string}><strong>{value}<small>{unit}</small></strong><span>{label}</span></article>)}</section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">RECENT BADGE</p><h2>최근 획득 배지</h2></div></div>{recentBadge ? <article className="earned-badge"><b>{recentBadge.icon}</b><div><h3>{recentBadge.title}</h3><p>{recentBadge.description}</p></div></article> : <div className="empty-state"><b>◈</b><h3>아직 획득한 배지가 없어요</h3><p>첫 발견 기록을 남기면 첫 배지가 열립니다.</p></div>}</section>
    <section className="home-section"><div className="section-heading"><div><p className="eyebrow">ACTIVITY</p><h2>최근 활동</h2></div></div>{activities.length === 0 ? <div className="empty-state"><b>⌖</b><h3>아직 활동 기록이 없어요</h3><p>생물을 발견하고 기록을 저장해 보세요.</p></div> : <div className="activity-list">{activities.map((activity) => <article key={activity.id}><b>{activity.icon}</b><div><p>{activity.text}</p><small>{activity.time}</small></div></article>)}</div>}</section>
    <section className="profile-actions"><Link className="outline-button" href="/badges">배지 전체 보기 <small>도전과제</small></Link><Link className="outline-button" href="/rewards">포인트 내역 <small>적립 확인</small></Link><button className="logout-button" onClick={() => setConfirm(true)}>로그아웃</button></section>
    {confirm && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-title"><div className="confirm-modal"><p className="eyebrow">ACCOUNT</p><h2 id="logout-title">로그아웃할까요?</h2><p>이 기기에서만 로그인 상태가 해제됩니다.</p><div><button className="secondary-button" onClick={() => setConfirm(false)}>취소</button><button className="logout-button" onClick={leave}>로그아웃</button></div></div></div>}
  </AppShell></ProtectedPage>;
}
