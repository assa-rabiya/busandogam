# GitHub 업로드 안내

## 1. 새 저장소 만들기

GitHub에서 빈 저장소를 생성합니다. README, `.gitignore`, 라이선스 자동 생성을 선택하지 않아야 현재 파일과 충돌이 적습니다.

## 2. 압축 해제 후 업로드

제공된 소스 ZIP을 압축 해제하고 해당 폴더에서 다음 명령을 실행합니다.

```bash
git init
git add .
git commit -m "feat: complete milestone 5 discovery map"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

GitHub Desktop을 사용하는 경우 압축을 해제한 폴더를 기존 로컬 저장소로 추가한 뒤 Publish repository를 선택해도 됩니다.

## 3. 코드 링크 공유

push가 완료되면 다음 형식의 저장소 주소를 공유합니다.

```text
https://github.com/사용자명/저장소명
```

## 4. 라이브 웹사이트 링크

현재 프로젝트는 Vinext 기반 애플리케이션이라 GitHub Pages의 단순 정적 파일 배포와는 실행 방식이 다릅니다.

라이브 URL이 필요하면 GitHub 저장소를 Cloudflare 또는 Vercel 같은 호스팅 서비스에 연결하고 다음 명령을 빌드 명령으로 사용합니다.

```text
pnpm run build
```

외부 API 키는 필요하지 않습니다.

## 제외된 파일

소스 ZIP에는 다음 파일을 포함하지 않습니다.

- `node_modules`
- `.vinext`, `.next`, `dist`
- `.wrangler`
- `work`, `outputs`
- Git 내부 데이터

압축 해제 후 `pnpm install`로 의존성을 복원할 수 있습니다.

