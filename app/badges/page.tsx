"use client";

import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { useAuth } from "../components/auth-provider";
import { useDiscoveries } from "../components/discovery-provider";
import { getAchievements } from "../services/achievements";

export default function BadgesPage() {
  const { user } = useAuth(); const { records } = useDiscoveries(); const achievements = getAchievements(records); const earned = achievements.filter((item) => item.earned).length;
  return <ProtectedPage><AppShell><section className="badge-page"><header className="badge-header"><p className="eyebrow">SEA EXPLORER CHALLENGES</p><h1>도전과제와 배지</h1><p>{user?.nickname}님의 도감 활동으로 새로운 배지를 획득해 보세요.</p><strong>{earned} / {achievements.length} 완료</strong></header><section className="badge-grid">{achievements.map((badge) => <article className={badge.earned ? "challenge-card earned" : "challenge-card"} key={badge.id}><b>{badge.icon}</b><div><span>{badge.earned ? "획득 완료" : "도전 중"}</span><h2>{badge.title}</h2><p>{badge.description}</p><div className="challenge-progress"><i style={{ width: `${Math.min(100, badge.progress / badge.target * 100)}%` }} /></div><small>{Math.min(badge.progress, badge.target)} / {badge.target}{badge.id === "steady-explorer" ? "P" : ""}</small></div></article>)}</section></section></AppShell></ProtectedPage>;
}
