"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLink as Link } from "../components/app-link";
import { AppShell } from "../components/app-shell";
import { ProtectedPage } from "../components/protected-page";
import { useDiscoveries } from "../components/discovery-provider";
import { MapFilterPanel } from "../components/map/map-filter-panel";
import { MapListView } from "../components/map/map-list-view";
import { MapPopup } from "../components/map/map-popup";
import { MapView, type LocationStatus } from "../components/map/map-view";
import { busanPlaces, speciesCatalog } from "../data/discovery-data";
import { getUnifiedDiscoveries } from "../services/discovery-summary";
import { mockMapAdapter } from "../services/mock-map-adapter";
import { replaceAppRoute } from "../client-navigation";
import type { MapCenter, MapDiscovery, MapFilters, MapMarkerGroup, MapSort, MapStatistics, MapViewMode } from "../types/map";

const defaultFilters: MapFilters = { speciesId: "all", category: "all", rarity: "all", datePreset: "all", season: "summer", dateFrom: "", dateTo: "", location: "all", safety: "all", owner: "public", search: "" };
const seasonMonths = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };

function startOfDay(date: Date) { const next = new Date(date); next.setHours(0, 0, 0, 0); return next; }
function countMost(values: string[]) { const counts = new Map<string, number>(); values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)); return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-"; }
function matchesDate(record: MapDiscovery, filters: MapFilters) {
  if (filters.datePreset === "all") return true;
  const found = new Date(record.discoveredAt); const now = new Date();
  if (Number.isNaN(found.getTime())) return false;
  if (filters.datePreset === "today") return startOfDay(found).getTime() === startOfDay(now).getTime();
  if (filters.datePreset === "7days" || filters.datePreset === "30days") { const days = filters.datePreset === "7days" ? 7 : 30; return found >= new Date(now.getTime() - days * 86400000); }
  if (filters.datePreset === "month") return found.getFullYear() === now.getFullYear() && found.getMonth() === now.getMonth();
  if (filters.datePreset === "season") return seasonMonths[filters.season].includes(found.getMonth() + 1);
  if (filters.datePreset === "custom") {
    const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;
    return (!from || found >= from) && (!to || found <= to);
  }
  return true;
}

export default function MapPage() {
  const { records, isReady } = useDiscoveries();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedDiscoveryId = searchParams.get("discoveryId");
  const requestedPlaceId = searchParams.get("place");
  const mapFailed = searchParams.get("mapError") === "1";
  const handledQuery = useRef<string | null>(null);
  const [filters, setFilters] = useState<MapFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<MapViewMode>("map");
  const [sort, setSort] = useState<MapSort>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [center, setCenter] = useState<MapCenter>(mockMapAdapter.defaultCenter);
  const [zoom, setZoom] = useState(1);
  const [currentLocation, setCurrentLocation] = useState<MapCenter | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(filters.search.trim().toLocaleLowerCase("ko"));

  const allRecords = useMemo<MapDiscovery[]>(() => {
    const enrich = (record: (typeof records)[number], source: "mock" | "user", isMine: boolean): MapDiscovery => ({ ...record, source, isMine, ownerLabel: isMine ? "나의 기록" : "부산바다도감 탐험가", species: speciesCatalog.find((item) => item.id === record.speciesId) ?? null });
    return getUnifiedDiscoveries(records).map((record) => enrich(record, record.userId.startsWith("community-") ? "mock" : "user", !record.userId.startsWith("community-")));
  }, [records]);

  const filteredRecords = useMemo(() => allRecords.filter((record) => {
    if (filters.owner === "mine" ? !record.isMine : record.visibility !== "public") return false;
    if (filters.speciesId !== "all" && record.speciesId !== filters.speciesId) return false;
    if (filters.category !== "all" && record.species?.category !== filters.category) return false;
    if (filters.rarity !== "all" && record.rarity !== filters.rarity) return false;
    if (!matchesDate(record, filters)) return false;
    if (filters.location !== "all" && filters.location !== "viewport" && record.locationName !== filters.location) return false;
    if (filters.location === "viewport") {
      if (!mockMapAdapter.isValidCoordinate(record.latitude, record.longitude)) return false;
      const point = mockMapAdapter.project(record.latitude as number, record.longitude as number, center, zoom);
      if (point.x < 2 || point.x > 98 || point.y < 2 || point.y > 98) return false;
    }
    const risk = record.species?.toxic || record.species?.riskLevel === "위험" ? "danger" : record.species?.riskLevel === "주의" ? "caution" : "safe";
    if (filters.safety !== "all" && filters.safety !== risk) return false;
    if (deferredSearch) {
      const target = [record.speciesName, record.scientificName, record.locationName, record.memo].join(" ").toLocaleLowerCase("ko");
      if (!target.includes(deferredSearch)) return false;
    }
    return true;
  }), [allRecords, center, deferredSearch, filters, zoom]);

  const markerRecords = useMemo(() => filteredRecords.filter((record) => mockMapAdapter.isValidCoordinate(record.latitude, record.longitude) && mockMapAdapter.isInsideBusan(record.latitude as number, record.longitude as number)), [filteredRecords]);
  const groups = useMemo(() => mockMapAdapter.groupRecords(markerRecords), [markerRecords]);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const selectedRecord = selectedGroup?.records.find((record) => record.id === selectedRecordId) ?? selectedGroup?.records[0] ?? null;
  const invalidCoordinateCount = filteredRecords.length - markerRecords.length;

  useEffect(() => {
    if (!isReady || !requestedDiscoveryId || handledQuery.current === requestedDiscoveryId) return;
    const timer = window.setTimeout(() => {
      handledQuery.current = requestedDiscoveryId;
      const requested = allRecords.find((record) => record.id === requestedDiscoveryId);
      if (!requested) { setNotice("요청한 발견 기록을 찾을 수 없어 부산 전체 지도를 표시합니다."); return; }
      if (!mockMapAdapter.isValidCoordinate(requested.latitude, requested.longitude) || !mockMapAdapter.isInsideBusan(requested.latitude as number, requested.longitude as number)) { setNotice("이 발견 기록에는 지도에 표시할 수 있는 부산 좌표가 없습니다."); setViewMode("list"); return; }
      const group = groups.find((item) => item.records.some((record) => record.id === requested.id));
      if (!group) { setNotice("현재 공개 범위에서는 요청한 발견을 표시할 수 없습니다. 나의 기록 보기로 전환했습니다."); setFilters((current) => ({ ...current, owner: "mine" })); handledQuery.current = null; return; }
      setSelectedGroupId(group.id); setSelectedRecordId(requested.id); setCenter({ latitude: group.latitude, longitude: group.longitude }); setZoom(1.8); setViewMode("map");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [allRecords, groups, isReady, requestedDiscoveryId]);

  useEffect(() => {
    if (!requestedPlaceId || handledQuery.current === `place:${requestedPlaceId}`) return;
    const timer = window.setTimeout(() => {
      const place = busanPlaces.find((item) => item.id === requestedPlaceId);
      handledQuery.current = `place:${requestedPlaceId}`;
      if (!place) { setNotice("요청한 탐험지를 찾을 수 없어 부산 전체 지도를 표시합니다."); return; }
      setCenter({ latitude: place.latitude, longitude: place.longitude });
      setZoom(2.45);
      setViewMode("map");
      setSelectedGroupId(null);
      setSelectedRecordId(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestedPlaceId]);

  const statistics = useMemo<MapStatistics>(() => ({ recordCount: filteredRecords.length, speciesCount: new Set(filteredRecords.map((record) => record.speciesId)).size, locationCount: new Set(filteredRecords.map((record) => record.locationName)).size, rareCount: filteredRecords.filter((record) => record.rarity === "희귀" || record.rarity === "매우 희귀").length, topSpecies: countMost(filteredRecords.map((record) => record.speciesName)), topLocation: countMost(filteredRecords.map((record) => record.locationName)) }), [filteredRecords]);
  const activeFilterCount = [filters.speciesId !== "all", filters.category !== "all", filters.rarity !== "all", filters.datePreset !== "all", filters.location !== "all", filters.safety !== "all", filters.owner !== "public", Boolean(filters.search)].filter(Boolean).length;

  const updateFilters = (patch: Partial<MapFilters>) => { setFilters((current) => ({ ...current, ...patch })); setSelectedGroupId(null); setSelectedRecordId(null); };
  const resetFilters = () => { setFilters(defaultFilters); setSelectedGroupId(null); setSelectedRecordId(null); setNotice(null); };
  const resetMap = () => { if (mapFailed) { replaceAppRoute(router, "/map"); return; } setCenter(mockMapAdapter.defaultCenter); setZoom(1); setSelectedGroupId(null); setSelectedRecordId(null); };
  const movePlace = (placeId: string) => { const place = busanPlaces.find((item) => item.id === placeId); if (!place) return; setCenter({ latitude: place.latitude, longitude: place.longitude }); setZoom(1.75); };
  const selectGroup = (group: MapMarkerGroup) => { setSelectedGroupId(group.id); setSelectedRecordId(group.records[0].id); };
  const selectListRecord = (record: MapDiscovery) => {
    if (!mockMapAdapter.isValidCoordinate(record.latitude, record.longitude) || !mockMapAdapter.isInsideBusan(record.latitude as number, record.longitude as number)) { setNotice("이 기록은 좌표가 없어 목록에서만 확인할 수 있습니다."); return; }
    const group = groups.find((item) => item.records.some((found) => found.id === record.id)); if (!group) return;
    setSelectedGroupId(group.id); setSelectedRecordId(record.id); setCenter({ latitude: group.latitude, longitude: group.longitude }); setZoom(1.8); setViewMode("map");
  };
  const requestLocation = () => {
    setNotice(null);
    if (!("geolocation" in navigator)) { setLocationStatus("unsupported"); return; }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude }; setCurrentLocation(next);
      if (!mockMapAdapter.isInsideBusan(next.latitude, next.longitude)) { setLocationStatus("outside"); setCenter(mockMapAdapter.defaultCenter); setZoom(1); return; }
      setLocationStatus("success"); setCenter(next); setZoom(2);
    }, () => setLocationStatus("denied"), { enableHighAccuracy: false, timeout: 7000, maximumAge: 60000 });
  };

  return <ProtectedPage><AppShell><section className="map-page">
    <header className="map-header"><div><p className="eyebrow">BUSAN DISCOVERY MAP</p><h1>부산 발견 지도</h1><p>부산의 바다와 갯벌에서 발견된 생물을 확인해 보세요.</p></div><div className="map-header-actions"><button className="map-filter-trigger" onClick={() => setFiltersOpen(true)}>필터 {activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button><button className="text-button" disabled={activeFilterCount === 0} onClick={resetFilters}>초기화</button><div className="map-view-toggle" aria-label="보기 방식"><button className={viewMode === "map" ? "active" : ""} aria-pressed={viewMode === "map"} onClick={() => setViewMode("map")}>⌖ 지도</button><button className={viewMode === "list" ? "active" : ""} aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>☷ 목록</button></div></div></header>
    {notice && <div className="map-notice" role="status"><span>ⓘ {notice}</span><button aria-label="안내 닫기" onClick={() => setNotice(null)}>×</button></div>}
    <section className="map-stats" aria-label="현재 지도 통계"><article><strong>{statistics.recordCount}</strong><span>발견 기록</span></article><article><strong>{statistics.speciesCount}</strong><span>생물 종</span></article><article><strong>{statistics.locationCount}</strong><span>지역</span></article><article><strong>{statistics.rareCount}</strong><span>희귀 발견</span></article><article><strong>{statistics.topSpecies}</strong><span>인기 생물</span></article><article><strong>{statistics.topLocation}</strong><span>활발한 지역</span></article></section>
    <div className="map-workspace">
      <MapFilterPanel filters={filters} activeCount={activeFilterCount} open={filtersOpen} onChange={updateFilters} onReset={resetFilters} onClose={() => setFiltersOpen(false)} />
      {filtersOpen && <button className="map-sheet-backdrop" aria-label="필터 닫기" onClick={() => setFiltersOpen(false)} />}
      <main className="map-results">
        <div className="map-results-meta"><span><b>{filteredRecords.length}</b>건 표시 중 · 마커 {groups.length}개</span>{invalidCoordinateCount > 0 && <small>ⓘ 좌표 없는 기록 {invalidCoordinateCount}건은 목록에만 표시</small>}</div>
        {viewMode === "map" ? <div className="map-stage"><MapView groups={groups} center={center} zoom={zoom} selectedGroupId={selectedGroupId} currentLocation={currentLocation} locationStatus={locationStatus} onSelectGroup={selectGroup} onReset={resetMap} onRequestLocation={requestLocation} onMovePlace={movePlace} onViewportChange={(nextCenter, nextZoom) => { setCenter(nextCenter); setZoom(nextZoom); }} failed={mapFailed} />{selectedGroup && selectedRecord && <MapPopup group={selectedGroup} selected={selectedRecord} onPick={(record) => setSelectedRecordId(record.id)} onClose={() => { setSelectedGroupId(null); setSelectedRecordId(null); }} />}</div> : <MapListView records={filteredRecords} sort={sort} currentLocation={currentLocation} onSort={setSort} onSelect={selectListRecord} />}
        {filteredRecords.length === 0 && <section className="map-no-results"><b>⌕</b><h2>조건에 맞는 발견 기록이 없습니다.</h2><p>필터를 초기화하거나 새로운 생물을 촬영해 보세요.</p><div><button className="outline-action" onClick={resetFilters}>필터 초기화</button><button className="outline-action" onClick={resetMap}>전체 지도 보기</button><Link className="primary-action" href="/identify">새로운 생물 촬영하기</Link></div></section>}
      </main>
    </div>
  </section></AppShell></ProtectedPage>;
}
