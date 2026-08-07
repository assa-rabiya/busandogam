"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
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

export function DiscoveryImage({ label, tone, name, className = "" }: { label: string; tone: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const photo = photoByName[name];
  return <div className={`discovery-image tone-${tone} ${className}`} role="img" aria-label={`${name} 이미지`}>
    {photo && !failed
      ? <img src={withBasePath(`/images/species/${photo}.webp`)} alt="" onError={() => setFailed(true)} />
      : <><span>{label}</span><i /><i /></>}
  </div>;
}
