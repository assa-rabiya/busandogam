import DiscoveryCompleteClient from "./client";

export function generateStaticParams() {
  return [{ id: "view" }];
}

export default function DiscoveryCompletePage() {
  return <DiscoveryCompleteClient />;
}
