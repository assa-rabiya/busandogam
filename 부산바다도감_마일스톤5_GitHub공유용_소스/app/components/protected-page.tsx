"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
export function ProtectedPage({ children }: { children: React.ReactNode }) { const { user, isReady } = useAuth(); const router = useRouter(); useEffect(() => { if (isReady && !user) router.replace("/login"); }, [isReady, router, user]); if (!isReady || !user) return <div className="page-loading" aria-live="polite">로그인 상태를 확인하는 중…</div>; return <>{children}</>; }
