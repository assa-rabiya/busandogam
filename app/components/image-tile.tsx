"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { withBasePath } from "../base-path";
const speciesPhotos: Record<string, string> = { "보라게": "purple-crab", "별불가사리": "sea-star", "고둥": "sea-snail", "말미잘": "sea-anemone", "문어": "octopus", "보라성게": "purple-urchin", "쏨뱅이": "rockfish", "미역": "kelp" };
export function ImageTile({ label, alt, className = "" }: { label: string; alt: string; className?: string }) { const [failed, setFailed] = useState(false); const source = speciesPhotos[alt] ? `/images/species/${speciesPhotos[alt]}.webp` : `/images/${alt}.jpg`; return <div className={`image-tile ${className}`} role="img" aria-label={failed ? `${alt} 이미지 placeholder` : alt}>{!failed && <img src={withBasePath(source)} alt="" onError={() => setFailed(true)} />}{failed && <span aria-hidden="true">{label}</span>}<small>{failed ? "이미지 준비 중" : ""}</small></div>; }
