import { busanPlaces, speciesCatalog } from "./discovery-data";
import type { Discovery } from "../types/discovery";

const findPlace = (name: string) => busanPlaces.find((place) => place.name === name) ?? busanPlaces[0];
const findSpecies = (id: string) => speciesCatalog.find((item) => item.id === id) ?? speciesCatalog[0];

function createMockDiscovery(id: string, speciesId: string, locationName: string, discoveredAt: string, memo: string): Discovery {
  const species = findSpecies(speciesId);
  const place = findPlace(locationName);
  return {
    id,
    userId: `community-${id}`,
    speciesId: species.id,
    speciesName: species.koreanName,
    scientificName: species.scientificName,
    imageUrl: `demo:${species.imageTone ?? "upload"}:${species.imageLabel}`,
    imageLabel: species.imageLabel,
    imageTone: species.imageTone ?? "upload",
    imageFileName: `${id}.jpg`,
    imageSourceType: "demo",
    latitude: place.latitude,
    longitude: place.longitude,
    locationName: place.name,
    discoveredAt,
    size: null,
    sizeUnit: "cm",
    environment: speciesId === "rockfish" ? "방파제" : speciesId === "sea-anemone" ? "조수 웅덩이" : "바위틈",
    weather: "맑음",
    tide: "간조",
    memo,
    visibility: "public",
    aiConfidence: speciesId === "sea-anemone" ? 91 : speciesId === "rockfish" ? 87 : 93,
    rarity: species.rarity,
    scoreAwarded: 0,
    duplicateWarning: null,
    isNewSpecies: false,
    createdAt: discoveredAt,
  };
}

export const publicMapDiscoveries: Discovery[] = [
  createMockDiscovery("map-dadaepo-crab", "purple-crab", "다대포해수욕장", "2026-08-06T09:20:00", "갯벌 가장자리에서 먹이 활동 중인 보라게를 관찰했어요."),
  createMockDiscovery("map-eulsukdo-snail", "sea-snail", "을숙도", "2026-08-05T16:10:00", "물이 빠진 뒤 젖은 돌 표면에서 고둥을 발견했습니다."),
  createMockDiscovery("map-songdo-star", "sea-star", "송도해수욕장", "2026-08-04T11:35:00", "얕은 조수 웅덩이에서 별불가사리를 촬영했습니다."),
  createMockDiscovery("map-taejongdae-urchin", "purple-urchin", "태종대", "2026-08-03T08:50:00", "바위틈의 보라성게를 안전 거리를 두고 관찰했어요."),
  createMockDiscovery("map-igidae-anemone", "sea-anemone", "이기대", "2026-08-06T07:45:00", "맑은 조수 웅덩이에서 촉수를 펼친 말미잘입니다."),
  createMockDiscovery("map-igidae-snail", "sea-snail", "이기대", "2026-08-02T17:05:00", "말미잘 근처 바위 표면에서 고둥도 함께 발견했어요."),
  createMockDiscovery("map-oryukdo-rockfish", "rockfish", "오륙도", "2026-07-30T14:15:00", "방파제 아래에서 쏨뱅이를 발견해 접촉하지 않고 촬영했습니다."),
  createMockDiscovery("map-gwangalli-crab", "purple-crab", "광안리해수욕장", "2026-07-27T18:30:00", "해 질 무렵 바위 사이를 이동하는 게를 관찰했습니다."),
  createMockDiscovery("map-haeundae-star", "sea-star", "해운대해수욕장", "2026-07-21T10:05:00", "파도가 잔잔한 구간에서 별불가사리를 확인했습니다."),
  createMockDiscovery("map-cheongsapo-anemone", "sea-anemone", "청사포", "2026-08-06T13:10:00", "방파제 안쪽 조수 웅덩이에 자리 잡은 말미잘입니다."),
  createMockDiscovery("map-cheongsapo-octopus", "octopus", "청사포", "2026-08-01T06:55:00", "이른 아침 바위 아래로 숨는 작은 문어를 발견했습니다."),
  createMockDiscovery("map-songjeong-snail", "sea-snail", "송정해수욕장", "2026-07-18T15:40:00", "젖은 암반에서 여러 마리의 고둥을 관찰했습니다."),
  createMockDiscovery("map-daebyeon-octopus", "octopus", "기장 대변항", "2026-08-05T06:35:00", "항구 얕은 물에서 움직이는 문어를 촬영했습니다."),
  createMockDiscovery("map-ilgwang-kelp", "kelp", "일광해수욕장", "2026-06-22T12:20:00", "얕은 바다에서 물결을 따라 움직이는 미역 군락입니다."),
];
