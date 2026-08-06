"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { withBasePath } from "../base-path";
export function ImageTile({ label, alt, className = "" }: { label: string; alt: string; className?: string }) { const [failed, setFailed] = useState(false); return <div className={`image-tile ${className}`} role="img" aria-label={failed ? `${alt} 이미지 placeholder` : alt}>{!failed && <img src={withBasePath(`/images/${alt}.jpg`)} alt="" onError={() => setFailed(true)} />}{failed && <span aria-hidden="true">{label}</span>}<small>{failed ? "이미지 준비 중" : ""}</small></div>; }
