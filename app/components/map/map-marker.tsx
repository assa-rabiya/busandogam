import type { CSSProperties } from "react";
import type { MapMarkerGroup, MapPoint } from "../../types/map";

const categoryIcons: Record<string, string> = { "어류": "◇", "연체동물": "◉", "갑각류": "♢", "극피동물": "✦", "자포동물": "✺", "해조류": "≋", "기타": "●" };

export function MapMarker({ group, point, selected, onSelect }: { group: MapMarkerGroup; point: MapPoint; selected: boolean; onSelect: () => void }) {
  const representative = group.records[0];
  const style = { "--marker-x": `${point.x}%`, "--marker-y": `${point.y}%` } as CSSProperties;
  return <button
    aria-label={`${group.locationName} 발견 기록 ${group.records.length}건, ${group.rarest}`}
    aria-pressed={selected}
    className={`map-marker rarity-${group.rarest.replace(" ", "-")} ${selected ? "selected" : ""}`}
    onClick={onSelect}
    style={style}
    type="button"
  >
    <span aria-hidden="true">{categoryIcons[representative.species?.category ?? "기타"] ?? "●"}</span>
    {group.records.length > 1 && <b>{group.records.length}</b>}
    {group.hasRisk && <i aria-label="주의 생물 포함">!</i>}
    <small>{group.locationName}</small>
  </button>;
}
