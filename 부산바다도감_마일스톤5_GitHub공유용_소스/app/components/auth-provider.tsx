"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { AppUser } from "../types";
import { user as demoUser } from "../data/mock-data";
type AuthContextValue = { user: AppUser | null; isReady: boolean; isLoggingIn: boolean; login: () => Promise<void>; logout: () => void; };
const AuthContext = createContext<AuthContextValue | null>(null);
const storageKey = "busan-sea-guide-demo-user";
export function AuthProvider({ children }: { children: React.ReactNode }) { const [user, setUser] = useState<AppUser | null>(null); const [isReady, setReady] = useState(false); const [isLoggingIn, setLoggingIn] = useState(false); useEffect(() => { const timer = window.setTimeout(() => { const saved = window.localStorage.getItem(storageKey); if (saved) setUser(JSON.parse(saved) as AppUser); setReady(true); }, 0); return () => window.clearTimeout(timer); }, []); const login = async () => { setLoggingIn(true); await new Promise((resolve) => setTimeout(resolve, 650)); window.localStorage.setItem(storageKey, JSON.stringify(demoUser)); setUser(demoUser); setLoggingIn(false); }; const logout = () => { window.localStorage.removeItem(storageKey); setUser(null); }; return <AuthContext.Provider value={{ user, isReady, isLoggingIn, login, logout }}>{children}</AuthContext.Provider>; }
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }
