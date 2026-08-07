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
  "밤게": "https://loremflickr.com/900/700/crab,sea",
  "군소": "https://loremflickr.com/900/700/sea-hare,marine",
  "해삼": "https://loremflickr.com/900/700/sea-cucumber,underwater",
  "홍합": "https://loremflickr.com/900/700/mussel,shellfish",
  "따개비": "https://loremflickr.com/900/700/barnacle,rock",
  "칠게": "https://loremflickr.com/900/700/shore-crab,tidal-flat",
  "소라게": "https://loremflickr.com/900/700/hermit-crab",
  "멍게": "https://loremflickr.com/900/700/sea-squirt,underwater",
  "모자반": "https://loremflickr.com/900/700/seaweed,underwater",
  "가자미": "https://loremflickr.com/900/700/flounder,fish",
  "망둑어": "https://loremflickr.com/900/700/goby,fish",
};

export function DiscoveryImage({ label, tone, name, className = "" }: { label: string; tone: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const photo = photoByName[name];
  return <div className={`discovery-image tone-${tone} ${className}`} role="img" aria-label={`${name} 이미지`}>
    {photo && !failed
      ? <img src={withBasePath(photo.startsWith("http") ? photo : `/images/species/${photo}.webp`)} alt="" onError={() => setFailed(true)} />
      : <><span>{label}</span><i /><i /></>}
  </div>;
}
