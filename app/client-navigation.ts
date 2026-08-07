type AppRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

export function pushAppRoute(router: AppRouter, href: string) {
  // Keep React providers alive during GitHub Pages navigation. A full-page
  // navigation discards the in-memory selected photo before the analysis
  // screen can consume it.
  router.push(href);
}

export function replaceAppRoute(router: AppRouter, href: string) {
  router.replace(href);
}
