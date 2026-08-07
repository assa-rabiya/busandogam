import type { AnchorHTMLAttributes, ReactNode } from "react";
import { withAppRouteBasePath } from "../base-path";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export function AppLink({ href, children, ...props }: AppLinkProps) {
  return <a href={withAppRouteBasePath(href)} {...props}>{children}</a>;
}
