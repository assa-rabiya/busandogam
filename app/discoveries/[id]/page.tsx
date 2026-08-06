import { publicMapDiscoveries } from "../../data/map-data";
import DiscoveryDetailClient from "./client";

export function generateStaticParams() {
  return [{ id: "view" }, ...publicMapDiscoveries.map((record) => ({ id: record.id }))];
}

export default function DiscoveryDetailPage() {
  return <DiscoveryDetailClient />;
}
