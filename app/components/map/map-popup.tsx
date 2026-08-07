import { DiscoveryImage } from "../discovery-image";
import type { MapDiscovery, MapMarkerGroup } from "../../types/map";
import { withBasePath } from "../../base-path";

export function MapPopup({ group, selected, onPick, onClose }: { group: MapMarkerGroup; selected: MapDiscovery; onPick: (record: MapDiscovery) => void; onClose: () => void }) {
  const danger = selected.species?.toxic || selected.species?.riskLevel === "?�험";
  return <aside className="map-popup" aria-live="polite">
    <button className="map-popup-close" aria-label="발견 ?�약 ?�기" onClick={onClose}>×</button>
    {group.records.length > 1 && <div className="map-group-summary"><span>그룹 마커 · {group.records.length}�?/span><b>{group.locationName}</b><small>{group.speciesCount}�?· 최근 {new Date(group.latestAt).toLocaleDateString("ko-KR")}</small></div>}
    <div className="map-popup-main">
      <DiscoveryImage label={selected.imageLabel} tone={selected.imageTone} name={selected.speciesName} />
      <div>
        <span className={`rarity ${selected.rarity}`}>{selected.rarity}</span>
        {danger && <span className="map-risk-label">??주의</span>}
        <h2>{selected.speciesName}</h2>
        <p className="scientific">{selected.scientificName}</p>
        <dl>
          <div><dt>?�소</dt><dd>{selected.locationName}</dd></div>
          <div><dt>발견</dt><dd>{new Date(selected.discoveredAt).toLocaleString("ko-KR")}</dd></div>
          <div><dt>?�경</dt><dd>{selected.environment}</dd></div>
          <div><dt>AI</dt><dd>?�뢰??{selected.aiConfidence}%</dd></div>
        </dl>
        <small className="map-owner">{selected.isMine ? "???�의 기록" : `??${selected.ownerLabel}`}</small>
      </div>
    </div>
    {selected.memo && <p className="map-popup-memo">??selected.memo}??/p>}
    {group.records.length > 1 && <div className="map-group-records" aria-label="???�소??발견 기록">{group.records.map((record) => <button className={record.id === selected.id ? "active" : ""} key={record.id} onClick={() => onPick(record)}>{record.speciesName}<small>{new Date(record.discoveredAt).toLocaleDateString("ko-KR")}</small></button>)}</div>}
    <div className="map-popup-actions"><a className="primary-action" href={withBasePath(`/discoveries/view?id=${encodeURIComponent(selected.id)}`)}>발견 ?�세</a><a className="outline-action" href={withBasePath(`/species?id=${encodeURIComponent(selected.speciesId)}`)}>?�물 ?�보</a></div>
  </aside>;
}
