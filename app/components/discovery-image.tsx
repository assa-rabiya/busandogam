"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { withBasePath } from "../base-path";

const photoByName: Record<string, string> = {
  "보라성게": "purple-urchin",
  "말미잘": "sea-anemone",
  "쏨뱅이": "rockfish",
  "보라게": "purple-crab",
  "별불가사리": "sea-star",
  "고둥": "sea-snail",
  "문어": "octopus",
  "미역": "kelp",
};
const scientificNameByKoreanName: Record<string, string> = { "밤게": "Charybdis japonica", "군소": "Aplysia kurodai", "해삼": "Apostichopus japonicus", "홍합": "Mytilus galloprovincialis", "따개비": "Balanus albicostatus", "칠게": "Macrophthalmus japonicus", "소라게": "Pagurus minutus", "멍게": "Halocynthia roretzi", "모자반": "Sargassum fulvellum", "가자미": "Pseudopleuronectes yokohamae", "망둑어": "Mugilogobius abei" };

export function DiscoveryImage({ label, tone, name, className = "" }: { label: string; tone: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [observedPhoto, setObservedPhoto] = useState<string | null>(null);
  const photo = photoByName[name];
  useEffect(() => {
    const scientificName = scientificNameByKoreanName[name];
    if (!scientificName) { setObservedPhoto(null); return; }
    let active = true;
    setObservedPhoto(null);
    // Taxon default_photo is tied to the exact scientific name. Observation
    // search can return a nearby/incorrect observation, so do not use it here.
    void fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species&per_page=10`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const taxon = data?.results?.find((item: { name?: string }) => item.name === scientificName);
        const url = taxon?.default_photo?.medium_url ?? taxon?.default_photo?.original_url;
        if (active && typeof url === "string") setObservedPhoto(url.replace("square", "large"));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [name]);
  const source = observedPhoto ?? (photo ? withBasePath(`/images/species/${photo}.webp`) : null);
  return <div className={`discovery-image tone-${tone} ${className}`} role="img" aria-label={`${name} 이미지`}>
    {source && !failed
      ? <img src={source} alt="" onError={() => setFailed(true)} />
      : <><span>{label}</span><i /><i /></>}
  </div>;
}
