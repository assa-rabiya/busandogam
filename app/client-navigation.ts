import { withAppRouteBasePath } from "./base-path";

type AppRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

const usesStaticBasePath = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);

export function pushAppRoute(router: AppRouter, href: string) {
  if (usesStaticBasePath && typeof window !== "undefined") {
    window.location.assign(withAppRouteBasePath(href));
    return;
  }
  router.push(href);
}

export function replaceAppRoute(router: AppRouter, href: string) {
  if (usesStaticBasePath && typeof window !== "undefined") {
    window.location.replace(withAppRouteBasePath(href));
    return;
  }
  router.replace(href);
}
