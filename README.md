# 부산바다도감

부산의 바다·갯벌 생물을 사진으로 발견하고 지도에 기록하는 반응형 웹앱 프로토타입입니다.

## 현재 구현 범위

- 데모 로그인과 로그인 상태 유지
- 완성형 홈 화면과 프로필 요약
- 사진·카메라·데모 이미지 선택
- 4단계 mock AI 생물 분석
- 발견 장소·시간·환경·메모 기록
- 발견 기록 점수 계산과 localStorage 저장
- 개인 도감과 생물 상세
- 외부 지도 API 없는 부산 발견 지도
- 마커 그룹화, 필터, 검색, 목록, 통계
- 현재 위치 요청과 거리 계산 구조
- 모바일·태블릿·데스크톱 반응형 UI

## 주요 경로

- `/` 홈
- `/login` 데모 로그인
- `/identify` 사진 선택과 AI 분석
- `/discoveries/new` 발견 기록 작성
- `/collection` 개인 도감
- `/species/[id]` 생물 상세
- `/map` 부산 발견 지도
- `/profile` 프로필

## 로컬 실행

요구 환경: Node.js 22.13 이상, pnpm

```bash
pnpm install
pnpm dev
```

개발 서버가 안내하는 로컬 주소를 브라우저에서 엽니다.

## 프로덕션 확인

```bash
pnpm run lint
pnpm run build
pnpm start
```

## 데이터와 외부 서비스

- 외부 API 키 없이 실행됩니다.
- 인증, 발견 기록, AI 분석 결과는 발표용 mock 또는 localStorage를 사용합니다.
- 실제 데이터베이스, 이미지 저장소, 지도 API는 아직 연결하지 않았습니다.

## GitHub 공유

이 저장소 전체를 GitHub 저장소의 최상위에 push하면 소스와 GitHub Pages 사이트를 함께 공유할 수 있습니다. 프로젝트를 한 단계 더 감싼 폴더 안에 올리지 마세요.

GitHub에서 `Settings → Pages → Build and deployment → Source`를 `GitHub Actions`로 설정합니다. 이후 `main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 정적 사이트를 자동으로 빌드하고 배포합니다.

로컬에서 Pages 정적 빌드를 확인하려면 다음 명령을 사용합니다.

```bash
npm run build:pages
```

정적 산출물은 `dist/client`에 생성되며, 저장소 프로젝트 주소 `/busandogam`과 새로고침 가능한 주요 경로가 적용됩니다. 일반 Worker/서버 배포는 기존 `npm run build`를 계속 사용합니다.
