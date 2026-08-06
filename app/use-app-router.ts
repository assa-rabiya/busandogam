"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { pushAppRoute, replaceAppRoute } from "./client-navigation";

export function useAppRouter() {
  const router = useRouter();
  return useMemo(() => ({
    ...router,
    push: (href: string) => pushAppRoute(router, href),
    replace: (href: string) => replaceAppRoute(router, href),
  }), [router]);
}
