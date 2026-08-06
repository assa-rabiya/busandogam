import { speciesCatalog } from "../../data/discovery-data";
import SpeciesDetailClient from "./client";

export function generateStaticParams() {
  return speciesCatalog.map((species) => ({ id: species.id }));
}

export default function SpeciesDetailPage() {
  return <SpeciesDetailClient />;
}
