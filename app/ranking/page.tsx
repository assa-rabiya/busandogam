"use client";

import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { useAuth } from "../components/auth-provider";
import { useDiscoveries } from "../components/discovery-provider";
import { getLeaderboard } from "../services/achievements";

export default function RankingPage() {
  const { user } = useAuth();
  const { records } = useDiscoveries();
  const leaderboard = getLeaderboard(records, user?.nickname ?? "나");
  return <ProtectedPage><AppShell><section className="ranking-page">
    <header className="ranking-hero"><p className="eyebrow">BUSAN SEA LEADERBOARD</p><h1>탐험가 랭킹</h1><p>발견 기록 점수와 도감에 등록한 생물 수를 기준으로 이번 달의 탐험가를 소개합니다.</p></header>
    <section className="ranking-podium" aria-label="상위 탐험가">{leaderboard.slice(0, 3).map((entry) => <article className={`place-${entry.rank}`} key={entry.name}><span>{entry.rank}위</span><div className="ranking-medal" aria-hidden="true">{entry.rank === 1 ? "◉" : entry.rank === 2 ? "○" : "◇"}</div><b>{entry.name}{entry.isCurrentUser ? " (나)" : ""}</b><small>{entry.points.toLocaleString()}P · {entry.speciesCount}종</small></article>)}</section>
    <section className="ranking-list"><h2>전체 순위</h2><ol>{leaderboard.map((entry) => <li className={entry.isCurrentUser ? "current" : ""} key={entry.name}><b>{entry.rank}</b><div><strong>{entry.name}{entry.isCurrentUser ? " (나)" : ""}</strong><span>도감 {entry.speciesCount}종</span></div><strong>{entry.points.toLocaleString()}P</strong></li>)}</ol></section>
    <p className="ranking-note">ⓘ 현재 랭킹은 이 기기의 발견 기록과 발표용 탐험가 데이터를 사용합니다. 모든 사용자 랭킹은 계정 기반 발견 기록 연동 단계에서 확장됩니다.</p>
  </section></AppShell></ProtectedPage>;
}
