import type { Activity, AppUser, Location, PopularSpecies, RecentDiscovery, Species } from "../types";

export const user: AppUser = { nickname: "바다탐험가 민수", level: 7, points: 2450, discoveredSpeciesCount: 24, discoveryCount: 48, visitedLocationCount: 8, postCount: 12, experience: 680, nextLevelExperience: 1000, representativeBadge: "부산 해양 탐험가" };
export const species: Species[] = [
  { id: "purple-crab", koreanName: "보라게", scientificName: "Hemigrapsus sanguineus", category: "갑각류", rarity: "보통", imageLabel: "🦀" },
  { id: "sea-star", koreanName: "별불가사리", scientificName: "Asterias amurensis", category: "극피동물", rarity: "흔함", imageLabel: "⭐" },
  { id: "sea-snail", koreanName: "고둥", scientificName: "Littorina brevicula", category: "연체동물", rarity: "흔함", imageLabel: "🐚" },
  { id: "sea-anemone", koreanName: "말미잘", scientificName: "Actiniaria", category: "자포동물", rarity: "희귀", imageLabel: "🌸" },
  { id: "octopus", koreanName: "문어", scientificName: "Octopus vulgaris", category: "연체동물", rarity: "보통", imageLabel: "🐙" },
];
export const locations: Location[] = [
  { id: "dadaepo", name: "다대포 갯벌", district: "사하구", habitat: "갯벌", imageLabel: "🌾", speciesHint: "게 · 조개 · 갯지렁이", bestTime: "간조 2시간 전", difficulty: "쉬움" },
  { id: "igidae", name: "이기대 해안", district: "남구", habitat: "암반 해안", imageLabel: "🪨", speciesHint: "고둥 · 불가사리", bestTime: "오전 8–10시", difficulty: "보통" },
  { id: "cheongsapo", name: "청사포", district: "해운대구", habitat: "방파제", imageLabel: "🌊", speciesHint: "말미잘 · 보라게", bestTime: "오후 4–6시", difficulty: "보통" },
  { id: "daebyeon", name: "기장 대변항", district: "기장군", habitat: "항구", imageLabel: "⚓", speciesHint: "문어 · 해삼 · 성게", bestTime: "오전 7–9시", difficulty: "쉬움" },
];
export const recentDiscoveries: RecentDiscovery[] = [
  { id: "d1", speciesName: "보라게", location: "청사포", discoveredAt: "오늘 10:24", rarity: "보통", imageLabel: "🦀" },
  { id: "d2", speciesName: "고둥", location: "다대포 갯벌", discoveredAt: "어제 16:40", rarity: "흔함", imageLabel: "🐚" },
  { id: "d3", speciesName: "말미잘", location: "이기대 해안", discoveredAt: "8월 4일", rarity: "희귀", imageLabel: "🌸" },
  { id: "d4", speciesName: "별불가사리", location: "송정", discoveredAt: "8월 3일", rarity: "흔함", imageLabel: "⭐" },
  { id: "d5", speciesName: "문어", location: "기장 대변항", discoveredAt: "8월 2일", rarity: "보통", imageLabel: "🐙" },
  { id: "d6", speciesName: "밤게", location: "다대포 갯벌", discoveredAt: "8월 1일", rarity: "희귀", imageLabel: "🦀" },
];
export const popularSpecies: PopularSpecies[] = [
  { rank: 1, name: "보라게", count: 128, change: "+18%", trend: "up" }, { rank: 2, name: "고둥", count: 101, change: "+7%", trend: "up" }, { rank: 3, name: "별불가사리", count: 86, change: "-3%", trend: "down" }, { rank: 4, name: "말미잘", count: 54, change: "+12%", trend: "up" }, { rank: 5, name: "문어", count: 41, change: "변화 없음", trend: "same" },
];
export const recentActivities: Activity[] = [
  { id: "a1", icon: "✦", text: "새로운 종 보라게를 도감에 등록했어요.", time: "오늘 10:24" }, { id: "a2", icon: "⌖", text: "청사포에서 발견 기록을 남겼어요.", time: "오늘 10:20" }, { id: "a3", icon: "◈", text: "‘해안 탐험가’ 배지를 획득했어요.", time: "8월 4일" },
];
