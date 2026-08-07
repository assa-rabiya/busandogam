import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./components/auth-provider";
import { IdentificationProvider } from "./components/identification-provider";
import { DiscoveryProvider } from "./components/discovery-provider";
import { CommunityProvider } from "./components/community-provider";

export const metadata: Metadata = {
  title: "부산바다도감 | 부산의 바다 생물 관찰 기록",
  description: "부산의 해양 생물을 사진으로 관찰하고 기록하는 반응형 웹앱 프로토타입",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body><AuthProvider><DiscoveryProvider><CommunityProvider><IdentificationProvider>{children}</IdentificationProvider></CommunityProvider></DiscoveryProvider></AuthProvider></body></html>;
}
