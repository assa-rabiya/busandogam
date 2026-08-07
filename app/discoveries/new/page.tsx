"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { ProtectedPage } from "../../components/protected-page";
import { SelectedImagePreview } from "../../components/selected-image-preview";
import { useIdentification } from "../../components/identification-provider";
import { useDiscoveries } from "../../components/discovery-provider";
import { useAuth } from "../../components/auth-provider";
import { busanPlaces } from "../../data/discovery-data";
import type { DiscoveryEnvironment, DiscoveryVisibility, DiscoveryWeather, SizeUnit, TideState } from "../../types/discovery";
import { pushAppRoute, replaceAppRoute } from "../../client-navigation";

const environments: DiscoveryEnvironment[] = ["갯벌", "바위틈", "조수 웅덩이", "모래 해변", "방파제", "얕은 바다", "수중", "기타"];
const weathers: DiscoveryWeather[] = ["맑음", "흐림", "비", "바람 강함", "기타"];
const tides: TideState[] = ["만조", "썰물 진행 중", "간조", "밀물 진행 중", "알 수 없음"];
const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

function nearestBusanPlaceName(latitude: number, longitude: number) {
  const nearest = busanPlaces.reduce((closest, place) => {
    const distance = (place.latitude - latitude) ** 2 + (place.longitude - longitude) ** 2;
    return distance < closest.distance ? { place, distance } : closest;
  }, { place: busanPlaces[0], distance: Number.POSITIVE_INFINITY });
  return `현재 위치 · ${nearest.place.name} 인근`;
}

export default function NewDiscoveryPage() {
  const { result, selectedImage, isReady: identificationReady } = useIdentification();
  const { createDiscovery, isSaving, error: saveError, clearError } = useDiscoveries();
  const { user } = useAuth(); const router = useRouter();
  const [speciesId, setSpeciesId] = useState(result?.id ?? ""); const [locationName, setLocationName] = useState(""); const [latitude, setLatitude] = useState<number | null>(null); const [longitude, setLongitude] = useState<number | null>(null);
  const [date, setDate] = useState(today); const [time, setTime] = useState(nowTime); const [size, setSize] = useState(""); const [sizeUnit, setSizeUnit] = useState<SizeUnit>("cm");
  const [environment, setEnvironment] = useState<DiscoveryEnvironment | "">(""); const [weather, setWeather] = useState<DiscoveryWeather>("맑음"); const [tide, setTide] = useState<TideState>("알 수 없음"); const [memo, setMemo] = useState(""); const [visibility, setVisibility] = useState<DiscoveryVisibility>("public");
  const [formError, setFormError] = useState<string | null>(null); const [geoState, setGeoState] = useState<"idle" | "loading" | "success" | "error">("idle"); const [geoMessage, setGeoMessage] = useState("");
  useEffect(() => {
    if (geoState !== "success" || latitude === null || longitude === null) return;
    const timer = window.setTimeout(() => {
      setLocationName(nearestBusanPlaceName(latitude, longitude));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [geoState, latitude, longitude]);
  useEffect(() => { if (identificationReady && (!result || !selectedImage)) replaceAppRoute(router, "/identify"); }, [identificationReady, result, router, selectedImage]);
  const candidates = useMemo(() => result ? [result, ...result.candidates.filter((candidate) => candidate.id !== result.id)] : [], [result]);
  const species = candidates.find((candidate) => candidate.id === speciesId) ?? result;
  if (!result || !selectedImage || !species || !user) return <div className="page-loading">분석 결과를 확인하는 중…</div>;
  const choosePlace = (value: string) => { const place = busanPlaces.find((item) => item.id === value); if (!place) return; setLocationName(place.name); setLatitude(place.latitude); setLongitude(place.longitude); setGeoState("idle"); };
  const useLocation = () => { clearError(); setGeoState("loading"); setGeoMessage("위치 권한을 확인하고 있어요…"); if (!navigator.geolocation) { setGeoState("error"); setGeoMessage("위치 기능을 사용할 수 없습니다. 장소를 직접 선택해 주세요."); return; } navigator.geolocation.getCurrentPosition((position) => { setLatitude(position.coords.latitude); setLongitude(position.coords.longitude); setLocationName("현재 위치"); setGeoState("success"); setGeoMessage("현재 GPS 좌표를 기록에 반영했어요."); }, () => { setGeoState("error"); setGeoMessage("위치 권한이 거부되었거나 좌표를 가져오지 못했어요. 장소를 직접 선택해 주세요."); }, { timeout: 7000 }); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); clearError(); setFormError(null); const numericSize = size === "" ? null : Number(size); if (!locationName || !date || !environment) { setFormError("발견 장소, 날짜, 환경을 모두 입력해 주세요."); return; } if (date > today() || Number.isNaN(new Date(`${date}T${time}`).getTime())) { setFormError("발견 날짜와 시간을 올바르게 입력해 주세요."); return; } if (numericSize !== null && (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > 1000)) { setFormError("크기는 0보다 크고 1,000 이하의 숫자로 입력해 주세요."); return; } try { const record = await createDiscovery({ userId: user.nickname, speciesId: species.id, speciesName: species.koreanName, scientificName: species.scientificName, imageUrl: selectedImage.kind === "demo" ? `demo:${selectedImage.imageTone}:${selectedImage.imageLabel}` : "", imageLabel: selectedImage.imageLabel, imageTone: selectedImage.imageTone, imageFileName: selectedImage.fileName, imageSourceType: selectedImage.kind === "demo" ? "demo" : "upload-session", latitude, longitude, locationName, discoveredAt: `${date}T${time}:00`, size: numericSize, sizeUnit, environment, weather, tide, memo, visibility, aiConfidence: species.confidence, rarity: result.rarity }); pushAppRoute(router, `/discoveries/view/complete?id=${encodeURIComponent(record.id)}`); } catch { /* Provider가 노출하는 복구 가능한 저장 오류를 화면에 유지한다. */ } };
  return <ProtectedPage><AppShell><header className="form-heading"><p className="eyebrow">NEW DISCOVERY</p><h1>발견 기록 남기기</h1><p>AI 분석 결과에 관찰 당시의 정보를 더해 나만의 도감에 기록합니다.</p></header><section className="discovery-species"><SelectedImagePreview image={selectedImage} /><div><span className="result-label">AI 신뢰도 {species.confidence}%</span><h2>{species.koreanName}</h2><p>{species.scientificName}</p><label>다른 후보로 수정<select value={speciesId} onChange={(event) => setSpeciesId(event.target.value)}>{candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.koreanName} · {candidate.confidence}%</option>)}</select></label>{result.toxic && <aside className="mini-warning">⚠ 독성 가능성이 있어 직접 만지지 마세요.</aside>}</div></section>
    <form className="discovery-form" onSubmit={submit}>{(formError || saveError) && <div className="upload-error" role="alert"><b>!</b><span>{formError ?? saveError}</span></div>}<fieldset><legend>발견 위치 <em>필수</em></legend><div className="location-actions"><button type="button" className="outline-action" disabled={geoState === "loading"} onClick={useLocation}>{geoState === "loading" ? "⌖ 위치 확인 중…" : "⌖ 현재 위치 사용"}</button><select aria-label="부산 주요 장소" defaultValue="" onChange={(event) => choosePlace(event.target.value)}><option value="" disabled>부산 주요 장소 선택</option>{busanPlaces.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}</select></div><input aria-label="발견 장소" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="발견 장소 이름" />{geoMessage && <p className={`geo-message ${geoState}`}>{geoState === "success" ? "✓" : "ⓘ"} {geoMessage}</p>}</fieldset>
      <div className="form-grid"><label>발견 날짜 <em>필수</em><input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} /></label><label>발견 시간<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>발견 크기<div className="size-input"><input type="number" min="0.1" max="1000" step="0.1" value={size} onChange={(event) => setSize(event.target.value)} placeholder="예: 8.5" /><select value={sizeUnit} onChange={(event) => setSizeUnit(event.target.value as SizeUnit)}><option>cm</option><option>mm</option></select></div></label><label>발견 환경 <em>필수</em><select value={environment} onChange={(event) => setEnvironment(event.target.value as DiscoveryEnvironment)}><option value="">환경 선택</option>{environments.map((item) => <option key={item}>{item}</option>)}</select></label><label>날씨<select value={weather} onChange={(event) => setWeather(event.target.value as DiscoveryWeather)}>{weathers.map((item) => <option key={item}>{item}</option>)}</select></label><label>조수 상태<select value={tide} onChange={(event) => setTide(event.target.value as TideState)}>{tides.map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <label>관찰 메모<textarea maxLength={500} value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="생물의 움직임과 주변 환경을 기록해 보세요." /><small>{memo.length}/500</small></label><fieldset><legend>공개 여부</legend><div className="visibility-options"><label><input type="radio" checked={visibility === "public"} onChange={() => setVisibility("public")} /> 공개 · 커뮤니티 공유 가능</label><label><input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} /> 비공개 · 나만 보기</label></div></fieldset><div className="form-submit"><button className="primary-action" disabled={isSaving}>{isSaving ? "기록 저장 중…" : "✦ 발견 기록 저장하기"}</button><button type="button" className="text-button" onClick={() => router.back()}>취소</button></div></form>
  </AppShell></ProtectedPage>;
}
