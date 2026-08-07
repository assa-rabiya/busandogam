"use client";

import { useEffect, useRef, useState } from "react";
import { busanPlaces } from "../../data/discovery-data";
import { mockMapAdapter } from "../../services/mock-map-adapter";
import type { Coordinates, MapCenter, MapMarkerGroup } from "../../types/map";

export type LocationStatus = "idle" | "loading" | "success" | "denied" | "unsupported" | "outside";

type LeafletMap = {
  setView: (coords: [number, number], zoom: number, options?: { animate?: boolean }) => LeafletMap;
  getCenter: () => { lat: number; lng: number };
  getZoom: () => number;
  on: (event: string, listener: () => void) => void;
  remove: () => void;
};
type LeafletMarker = { addTo: (map: LeafletMap) => LeafletMarker; on: (event: string, listener: () => void) => LeafletMarker; setZIndexOffset: (value: number) => void; remove: () => void; };
type LeafletApi = { map: (element: HTMLElement, options: object) => LeafletMap; tileLayer: (url: string, options: object) => { addTo: (map: LeafletMap) => void }; marker: (coords: [number, number], options: object) => LeafletMarker; divIcon: (options: object) => unknown; };

declare global { interface Window { L?: LeafletApi; } }

const leafletScript = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const leafletStylesheet = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const categoryIcons: Record<string, string> = { "어류": "◇", "연체동물": "◉", "갑각류": "♢", "극피동물": "✦", "자포동물": "✺", "해조류": "≋", "기타": "●" };
// Keep the default view close to Busan, while allowing users to zoom out to
// see the broader southeast coast and zoom in for a single discovery.
const toLeafletZoom = (zoom: number) => Math.max(8, Math.min(18, Math.round(10 + zoom * 2)));
const toAppZoom = (zoom: number) => Math.max(-1, Math.min(4, (zoom - 10) / 2));

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise<LeafletApi>((resolve, reject) => {
    if (!document.querySelector(`link[href="${leafletStylesheet}"]`)) {
      const style = document.createElement("link"); style.rel = "stylesheet"; style.href = leafletStylesheet;
      (document.head as unknown as { appendChild: (node: unknown) => unknown }).appendChild(style);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${leafletScript}"]`);
    if (existing) { existing.addEventListener("load", () => window.L ? resolve(window.L) : reject(new Error("Leaflet failed")), { once: true }); existing.addEventListener("error", () => reject(new Error("Leaflet failed")), { once: true }); return; }
    const script = document.createElement("script"); script.src = leafletScript; script.async = true;
    script.onload = () => window.L ? resolve(window.L) : reject(new Error("Leaflet failed")); script.onerror = () => reject(new Error("Leaflet failed"));
    (document.head as unknown as { appendChild: (node: unknown) => unknown }).appendChild(script);
  });
}

export function MapView({ groups, center, zoom, selectedGroupId, currentLocation, locationStatus, onSelectGroup, onReset, onRequestLocation, onMovePlace, onViewportChange, failed }: {
  groups: MapMarkerGroup[]; center: MapCenter; zoom: number; selectedGroupId: string | null; currentLocation: Coordinates | null; locationStatus: LocationStatus;
  onSelectGroup: (group: MapMarkerGroup) => void; onReset: () => void; onRequestLocation: () => void; onMovePlace: (placeId: string) => void; onViewportChange: (nextCenter: MapCenter, nextZoom: number) => void; failed: boolean;
}) {
  const container = useRef<HTMLDivElement>(null); const map = useRef<LeafletMap | null>(null); const markers = useRef<LeafletMarker[]>([]); const [loadError, setLoadError] = useState(false); const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!container.current || failed) return;
    void loadLeaflet().then((L) => {
      if (!active || !container.current) return;
      const nextMap = L.map(container.current, { zoomControl: true, attributionControl: true, minZoom: 8, maxZoom: 18 }).setView([center.latitude, center.longitude], toLeafletZoom(zoom));
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { minZoom: 8, maxZoom: 19, attribution: "© OpenStreetMap contributors" }).addTo(nextMap);
      nextMap.on("moveend", () => { const next = nextMap.getCenter(); onViewportChange({ latitude: next.lat, longitude: next.lng }, toAppZoom(nextMap.getZoom())); });
      map.current = nextMap;
      // Leaflet loads asynchronously. Mark the instance ready so the marker
      // effect runs once immediately instead of waiting for a map movement.
      setMapReady(true);
    }).catch(() => setLoadError(true));
    return () => { active = false; setMapReady(false); map.current?.remove(); map.current = null; };
  // The map instance intentionally starts once; later props update it below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  useEffect(() => { const nextMap = map.current; if (!nextMap) return; const current = nextMap.getCenter(); const nextZoom = toLeafletZoom(zoom); if (Math.abs(current.lat - center.latitude) > .0001 || Math.abs(current.lng - center.longitude) > .0001 || nextMap.getZoom() !== nextZoom) nextMap.setView([center.latitude, center.longitude], nextZoom, { animate: true }); }, [center.latitude, center.longitude, zoom]);
  useEffect(() => {
    const L = window.L; const nextMap = map.current; if (!L || !nextMap) return;
    markers.current.forEach((marker) => marker.remove()); markers.current = [];
    groups.forEach((group) => {
      const representative = group.records[0]; const icon = categoryIcons[representative.species?.category ?? "기타"] ?? "●";
      const marker = L.marker([group.latitude, group.longitude], { icon: L.divIcon({ className: "", html: `<span class="leaflet-discovery-marker ${selectedGroupId === group.id ? "selected" : ""}">${icon}${group.records.length > 1 ? `<b>${group.records.length}</b>` : ""}</span>` }) }).addTo(nextMap);
      marker.setZIndexOffset(selectedGroupId === group.id ? 1000 : 0); marker.on("click", () => onSelectGroup(group)); markers.current.push(marker);
    });
    if (currentLocation && mockMapAdapter.isInsideBusan(currentLocation.latitude, currentLocation.longitude)) {
      const marker = L.marker([currentLocation.latitude, currentLocation.longitude], { icon: L.divIcon({ className: "", html: '<span class="leaflet-current-marker">●</span>' }) }).addTo(nextMap); markers.current.push(marker);
    }
  }, [currentLocation, groups, mapReady, onSelectGroup, selectedGroupId]);

  if (failed || loadError) return <section className="map-error" role="alert"><b>!</b><h2>실제 지도를 불러오지 못했어요</h2><p>인터넷 연결을 확인해 주세요. 발견 목록은 계속 사용할 수 있습니다.</p><button className="outline-action" onClick={onReset}>부산 전체 보기</button></section>;
  return <section className="osm-map" aria-label="OpenStreetMap 기반 부산 발견 지도">
    <div ref={container} className="osm-map-canvas" />
    {groups.length === 0 && <div className="map-empty-overlay"><b>⌕</b><span>표시할 마커가 없습니다</span></div>}
    <div className="map-floating-actions">
      <select aria-label="지역으로 지도 이동" defaultValue="" onChange={(event) => { if (event.target.value) onMovePlace(event.target.value); }}><option value="" disabled>지역으로 이동</option>{busanPlaces.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}</select>
      <button onClick={onReset}>부산 전체</button><button disabled={locationStatus === "loading"} onClick={onRequestLocation}>{locationStatus === "loading" ? "위치 확인 중…" : "⌾ 내 위치"}</button>
    </div>
    {locationStatus === "denied" && <p className="map-location-notice error">위치 권한이 거부되었습니다. 지역을 직접 선택해 주세요.</p>}
    {locationStatus === "unsupported" && <p className="map-location-notice error">이 브라우저에서는 위치 기능을 사용할 수 없습니다.</p>}
    {locationStatus === "outside" && <p className="map-location-notice">현재 위치가 부산 지도 범위 밖에 있어 부산 전체 보기를 유지합니다.</p>}
  </section>;
}
