"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { SelectedImage } from "../types/ai-analysis";
import { withBasePath } from "../base-path";

export function SelectedImagePreview({ image, large = false }: { image: SelectedImage; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const source = image.previewUrl ?? (image.demoId ? withBasePath(`/images/species/${image.demoId}.webp`) : null);
  const canRenderImage = Boolean(source) && !failed;
  return <div className={`selected-image-preview tone-${image.imageTone} ${large ? "large" : ""}`} role="img" aria-label={`${image.fileName} 미리보기`}>
    {canRenderImage ? <img src={source ?? ""} alt={image.fileName} onError={() => setFailed(true)} /> : <div className="demo-image-art"><span>{image.imageLabel}</span><i /><i /><i /></div>}
    {failed && <small>이미지를 표시할 수 없어 안전한 placeholder를 사용합니다.</small>}
  </div>;
}
