import type { AnchorHTMLAttributes, ReactNode } from "react";
import { withBasePath } from "../base-path";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export function AppLink({ href, children, ...props }: AppLinkProps) {
  return <a href={withBasePath(href)} {...props}>{children}</a>;
}
