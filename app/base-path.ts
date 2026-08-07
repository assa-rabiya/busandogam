const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//") || !basePath) return path;
  return `${basePath}${path}`;
}

export function withAppRouteBasePath(href: string) {
  if (!href.startsWith("/") || href.startsWith("//") || !basePath) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? href;
  const suffix = match?.[2] ?? "";
  const directoryPath = pathname === "/" ? pathname : `${pathname.replace(/\/$/, "")}/`;
  return withBasePath(`${directoryPath}${suffix}`);
}
