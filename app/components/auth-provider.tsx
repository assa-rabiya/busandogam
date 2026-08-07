"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AppUser } from "../types";
import { user as demoUser } from "../data/mock-data";

type AuthContextValue = {
  user: AppUser | null;
  isReady: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  loginGuest: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const storageKey = "busan-sea-guide-demo-user";

function safelyReadUser(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppUser>;
    if (!parsed.nickname) return null;
    return {
      id: parsed.id ?? (parsed.accountType === "guest" ? "guest-explorer" : "demo-explorer-minsu"),
      accountType: parsed.accountType ?? "demo",
      nickname: parsed.nickname,
      level: parsed.level ?? 1,
      points: parsed.points ?? 0,
      discoveredSpeciesCount: parsed.discoveredSpeciesCount ?? 0,
      discoveryCount: parsed.discoveryCount ?? 0,
      visitedLocationCount: parsed.visitedLocationCount ?? 0,
      postCount: parsed.postCount ?? 0,
      experience: parsed.experience ?? 0,
      nextLevelExperience: parsed.nextLevelExperience ?? 1000,
      representativeBadge: parsed.representativeBadge ?? "첫 관찰자",
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setReady] = useState(false);
  const [isLoggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(safelyReadUser());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const commitLogin = async (nextUser: AppUser) => {
    setLoggingIn(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
    setUser(nextUser);
    setLoggingIn(false);
  };

  const login = async () => commitLogin({ ...demoUser, id: "demo-explorer-minsu", accountType: "demo" });
  const loginGuest = async () => commitLogin({
    id: "guest-explorer",
    accountType: "guest",
    nickname: "게스트 탐험가",
    level: 1,
    points: 0,
    discoveredSpeciesCount: 0,
    discoveryCount: 0,
    visitedLocationCount: 0,
    postCount: 0,
    experience: 0,
    nextLevelExperience: 300,
    representativeBadge: "첫 관찰을 시작해 보세요",
  });
  const logout = () => {
    window.localStorage.removeItem(storageKey);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isReady, isLoggingIn, login, loginGuest, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
