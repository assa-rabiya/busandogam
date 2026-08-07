"use client";
import type { ReactNode } from "react";
import { BottomNavigation, DesktopNavigation, PageHeader } from "./navigation";
import { useAuth } from "./auth-provider";
import { ProtectedPage } from "./protected-page";
import { usePathname } from "next/navigation";
import { AppLink } from "./app-link";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isSpeciesDetail = pathname.startsWith("/species");

  return <main className="app-shell"><DesktopNavigation /><section className="app-content"><PageHeader user={user} />{isSpeciesDetail && <AppLink className="detail-close" href="/collection" aria-label="도감으로 돌아가기">×</AppLink>}{children}</section><BottomNavigation /></main>;
}
export function PlaceholderPage({ title, description }: { title: string; description: string }) { return <ProtectedPage><AppShell><section className="placeholder-page"><p className="eyebrow">COMING IN NEXT STAGE</p><h1>{title}</h1><p>{description}</p><div aria-hidden="true" className="placeholder-orb">⌁</div><span>발표용 프로토타입에서 안전하게 준비 중인 화면입니다.</span></section></AppShell></ProtectedPage>; }
