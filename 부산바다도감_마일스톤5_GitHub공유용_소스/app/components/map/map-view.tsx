import { busanPlaces } from "../../data/discovery-data";
import { mockMapAdapter } from "../../services/mock-map-adapter";
import type { Coordinates, MapCenter, MapMarkerGroup } from "../../types/map";
import { MapMarker } from "./map-marker";

export type LocationStatus = "idle" | "loading" | "success" | "denied" | "unsupported" | "outside";

export function MapView({ groups, center, zoom, selectedGroupId, currentLocation, locationStatus, onSelectGroup, onZoom, onReset, onRequestLocation, onMovePlace, failed }: {
  groups: MapMarkerGroup[];
  center: MapCenter;
  zoom: number;
  selectedGroupId: string | null;
  currentLocation: Coordinates | null;
  locationStatus: LocationStatus;
  onSelectGroup: (group: MapMarkerGroup) => void;
  onZoom: (next: number) => void;
  onReset: () => void;
  onRequestLocation: () => void;
  onMovePlace: (placeId: string) => void;
  failed: boolean;
}) {
  if (failed) return <section className="map-error" role="alert"><b>!</b><h2>지도를 초기화하지 못했어요</h2><p>발견 목록은 계속 사용할 수 있습니다. 잠시 후 다시 시도해 주세요.</p><button className="outline-action" onClick={onReset}>지도 다시 불러오기</button></section>;
  const currentPoint = currentLocation && mockMapAdapter.isInsideBusan(currentLocation.latitude, currentLocation.longitude)
    ? mockMapAdapter.project(currentLocation.latitude, currentLocation.longitude, center, zoom)
    : null;
  return <section className="mock-map" aria-label="부산 발견 지도">
    <div className="map-sea-grid" aria-hidden="true" />
    <div className="map-land land-west" aria-hidden="true" />
    <div className="map-land land-east" aria-hidden="true" />
    <div className="map-title" aria-hidden="true"><b>BUSAN</b><span>부산 연안 발견 지도</span></div>
    {groups.map((group) => <MapMarker key={group.id} group={group} point={mockMapAdapter.project(group.latitude, group.longitude, center, zoom)} selected={selectedGroupId === group.id} onSelect={() => onSelectGroup(group)} />)}
    {currentPoint && <div className="current-location-marker" style={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%` }}><span />내 위치</div>}
    {groups.length === 0 && <div className="map-empty-overlay"><b>⌕</b><span>표시할 마커가 없습니다</span></div>}
    <div className="map-zoom-controls" aria-label="지도 확대 축소">
      <button aria-label="지도 확대" disabled={zoom >= 2.4} onClick={() => onZoom(Math.min(2.4, zoom + .35))}>＋</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button aria-label="지도 축소" disabled={zoom <= .75} onClick={() => onZoom(Math.max(.75, zoom - .35))}>−</button>
    </div>
    <div className="map-floating-actions">
      <select aria-label="지역으로 지도 이동" defaultValue="" onChange={(event) => { if (event.target.value) onMovePlace(event.target.value); }}>
        <option value="" disabled>지역으로 이동</option>
        {busanPlaces.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
      </select>
      <button onClick={onReset}>부산 전체</button>
      <button disabled={locationStatus === "loading"} onClick={onRequestLocation}>{locationStatus === "loading" ? "위치 확인 중…" : "⌾ 내 위치"}</button>
    </div>
    {locationStatus === "denied" && <p className="map-location-notice error">위치 권한이 거부되었습니다. 지역을 직접 선택해 주세요.</p>}
    {locationStatus === "unsupported" && <p className="map-location-notice error">이 브라우저에서는 위치 기능을 사용할 수 없습니다.</p>}
    {locationStatus === "outside" && <p className="map-location-notice">현재 위치가 부산 지도 범위 밖에 있어 부산 전체 보기를 유지합니다.</p>}
  </section>;
}
