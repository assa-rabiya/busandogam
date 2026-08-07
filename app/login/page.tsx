"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth-provider";
import { replaceAppRoute } from "../client-navigation";

export default function LoginPage() {
  const { user, isReady, isLoggingIn, login, loginGuest } = useAuth();
  const router = useRouter();
  useEffect(() => { if (user) replaceAppRoute(router, "/"); }, [router, user]);
  const enter = async (kind: "demo" | "guest") => {
    await (kind === "demo" ? login() : loginGuest());
    replaceAppRoute(router, "/");
  };
  const disabled = !isReady || isLoggingIn;
  return <main className="login-page"><section className="login-card">
    <div className="login-brand"><span>🌊</span><p>BUSAN SEA FIELD GUIDE</p><h1>부산바다도감</h1><strong>부산의 바다를 발견하고 기록하세요</strong></div>
    <div className="login-actions">
      <button className="demo-login" disabled={disabled} onClick={() => void enter("demo")}>{isLoggingIn ? "계정을 준비하고 있어요…" : "데모 계정으로 둘러보기"}</button>
      <p className="login-divider"><span>또는</span></p>
      {["카카오로 시작하기", "네이버로 시작하기", "이메일로 시작하기"].map((label) => <button key={label} className="social-login" disabled={disabled} onClick={() => void enter("demo")}>{label}</button>)}
      <button className="social-login guest-login" disabled={disabled} onClick={() => void enter("guest")}>게스트로 시작하기 <small>새 기록으로 체험</small></button>
    </div>
    <p className="login-note">발표용 프로토타입입니다. 소셜 버튼은 데모 계정으로 안전하게 로그인됩니다. 게스트는 빈 도감에서 직접 기록을 시작합니다.</p>
  </section></main>;
}
