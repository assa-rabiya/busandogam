import { busanPlaces, speciesCatalog } from "../../data/discovery-data";
import type { MapFilters } from "../../types/map";

const categories = ["어류", "연체동물", "갑각류", "극피동물", "자포동물", "해조류", "기타"];

export function MapFilterPanel({ filters, activeCount, open, onChange, onReset, onClose }: { filters: MapFilters; activeCount: number; open: boolean; onChange: (patch: Partial<MapFilters>) => void; onReset: () => void; onClose: () => void }) {
  return <aside className={`map-filter-panel ${open ? "open" : ""}`} aria-label="지도 필터">
    <div className="map-filter-head"><div><p className="eyebrow">EXPLORE FILTERS</p><h2>발견 조건</h2></div><button className="map-sheet-close" aria-label="필터 닫기" onClick={onClose}>×</button></div>
    <label className="map-search"><span>통합 검색</span><input aria-label="생물, 학명, 장소, 메모 검색" placeholder="생물·장소·메모 검색" value={filters.search} onChange={(event) => onChange({ search: event.target.value })} /><b aria-hidden="true">⌕</b></label>
    <div className="map-filter-grid">
      <label>기록 범위<select aria-label="기록 소유자 필터" value={filters.owner} onChange={(event) => onChange({ owner: event.target.value as MapFilters["owner"] })}><option value="public">전체 공개 기록</option><option value="mine">나의 발견 기록</option></select></label>
      <label>생물<select aria-label="생물 필터" value={filters.speciesId} onChange={(event) => onChange({ speciesId: event.target.value })}><option value="all">전체 생물</option>{speciesCatalog.map((item) => <option key={item.id} value={item.id}>{item.koreanName}</option>)}</select></label>
      <label>카테고리<select aria-label="카테고리 필터" value={filters.category} onChange={(event) => onChange({ category: event.target.value })}><option value="all">전체 카테고리</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>희귀도<select aria-label="희귀도 필터" value={filters.rarity} onChange={(event) => onChange({ rarity: event.target.value })}><option value="all">전체 희귀도</option><option>흔함</option><option>보통</option><option>희귀</option><option>매우 희귀</option></select></label>
      <label>기간<select aria-label="날짜 필터" value={filters.datePreset} onChange={(event) => onChange({ datePreset: event.target.value as MapFilters["datePreset"] })}><option value="all">전체 기간</option><option value="today">오늘</option><option value="7days">최근 7일</option><option value="30days">최근 30일</option><option value="month">이번 달</option><option value="season">계절별</option><option value="custom">직접 날짜 범위</option></select></label>
      {filters.datePreset === "season" && <label>계절<select aria-label="계절 필터" value={filters.season} onChange={(event) => onChange({ season: event.target.value as MapFilters["season"] })}><option value="spring">봄 · 3–5월</option><option value="summer">여름 · 6–8월</option><option value="autumn">가을 · 9–11월</option><option value="winter">겨울 · 12–2월</option></select></label>}
      {filters.datePreset === "custom" && <div className="map-date-range"><label>시작일<input aria-label="시작 날짜" type="date" value={filters.dateFrom} onChange={(event) => onChange({ dateFrom: event.target.value })} /></label><label>종료일<input aria-label="종료 날짜" type="date" value={filters.dateTo} onChange={(event) => onChange({ dateTo: event.target.value })} /></label></div>}
      <label>지역<select aria-label="장소 필터" value={filters.location} onChange={(event) => onChange({ location: event.target.value })}><option value="all">전체 지역</option><option value="viewport">현재 지도 영역</option>{busanPlaces.map((place) => <option key={place.id} value={place.name}>{place.name}</option>)}</select></label>
      <label>안전 상태<select aria-label="안전 필터" value={filters.safety} onChange={(event) => onChange({ safety: event.target.value as MapFilters["safety"] })}><option value="all">전체 안전 상태</option><option value="safe">안전</option><option value="caution">주의</option><option value="danger">위험 또는 독성</option></select></label>
    </div>
    <div className="map-filter-actions"><button className="outline-action" disabled={activeCount === 0} onClick={onReset}>필터 초기화 {activeCount > 0 && `(${activeCount})`}</button><button className="primary-action" onClick={onClose}>결과 보기</button></div>
  </aside>;
}
