import type { AnchorHTMLAttributes, ReactNode } from "react";
import { withAppRouteBasePath } from "../base-path";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export function AppLink({ href, children, onClick, ...props }: AppLinkProps) {
  const speciesId = href.startsWith("/species?") ? new URLSearchParams(href.slice(href.indexOf("?") + 1)).get("id") : null;
  return <a href={withAppRouteBasePath(href)} {...props} onClick={(event) => {
    if (speciesId && typeof window !== "undefined") window.sessionStorage.setItem("busan-sea-guide-selected-species", speciesId);
    onClick?.(event);
  }}>{children}</a>;
}
