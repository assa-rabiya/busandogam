import { haversineDistance } from "../../services/map-adapter";
import type { Coordinates, MapDiscovery, MapSort } from "../../types/map";
import { DiscoveryImage } from "../discovery-image";
import { withBasePath } from "../../base-path";

const rarityWeight = { "흔함": 0, "보통": 1, "희귀": 2, "매우 희귀": 3 } as const;

export function MapListView({ records, sort, currentLocation, onSort, onSelect }: { records: MapDiscovery[]; sort: MapSort; currentLocation: Coordinates | null; onSort: (sort: MapSort) => void; onSelect: (record: MapDiscovery) => void }) {
  const sorted = [...records].sort((a, b) => {
    if (sort === "oldest") return a.discoveredAt.localeCompare(b.discoveredAt);
    if (sort === "rarity") return rarityWeight[b.rarity] - rarityWeight[a.rarity];
    if (sort === "name") return a.speciesName.localeCompare(b.speciesName, "ko");
    if (sort === "distance" && currentLocation) {
      const aDistance = a.latitude === null || a.longitude === null ? Infinity : haversineDistance(currentLocation, { latitude: a.latitude, longitude: a.longitude });
      const bDistance = b.latitude === null || b.longitude === null ? Infinity : haversineDistance(currentLocation, { latitude: b.latitude, longitude: b.longitude });
      return aDistance - bDistance;
    }
    return b.discoveredAt.localeCompare(a.discoveredAt);
  });
  return <section className="map-list-view">
    <div className="map-list-toolbar"><b>{records.length}개의 발견</b><select aria-label="발견 목록 정렬" value={sort} onChange={(event) => onSort(event.target.value as MapSort)}><option value="newest">최근 발견순</option><option value="oldest">오래된 발견순</option><option value="distance" disabled={!currentLocation}>가까운 장소순{!currentLocation ? " · 위치 필요" : ""}</option><option value="rarity">희귀도순</option><option value="name">생물 이름순</option></select></div>
    <div className="map-record-grid">{sorted.map((record) => {
      const distance = currentLocation && record.latitude !== null && record.longitude !== null ? haversineDistance(currentLocation, { latitude: record.latitude, longitude: record.longitude }) : null;
      const coordinateState = record.latitude === null || record.longitude === null ? "좌표 없음 · 목록에만 표시" : Number.isFinite(record.latitude) && Number.isFinite(record.longitude) ? distance === null ? "좌표 기록됨" : `${distance.toFixed(1)}km` : "잘못된 좌표";
      return <article className="map-record-card" key={record.id}>
        <DiscoveryImage label={record.imageLabel} tone={record.imageTone} name={record.speciesName} />
        <div><span className={`rarity ${record.rarity}`}>{record.rarity}</span><h3>{record.speciesName}</h3><p>{record.locationName}</p><dl><div><dt>발견일</dt><dd>{new Date(record.discoveredAt).toLocaleDateString("ko-KR")}</dd></div><div><dt>환경</dt><dd>{record.environment}</dd></div><div><dt>위치</dt><dd>{coordinateState}</dd></div></dl><div className="map-card-actions"><button className="card-link" onClick={() => onSelect(record)}>지도에서 보기</button><a className="card-link" href={withBasePath(`/discoveries/view?id=${encodeURIComponent(record.id)}`)}>상세 보기 →</a></div></div>
      </article>;
    })}</div>
  </section>;
}
