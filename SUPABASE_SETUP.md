# 공용 커뮤니티 연결 안내

이 프로젝트는 GitHub Pages에서 Supabase REST API를 직접 사용합니다. 서버 비밀키는 넣지 않습니다.

1. [Supabase](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/migrations/20260807_community_rankings.sql` 파일 전체를 실행합니다.
3. Project Connect에서 Project URL과 Publishable(anon) Key를 확인합니다.
4. GitHub 저장소에서 **Settings → Secrets and variables → Actions → New repository secret**으로 이동합니다.
5. 아래 두 Secret을 추가합니다.
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. `main` 브랜치에 다시 커밋·푸시하면 GitHub Pages가 공용 커뮤니티 연결 정보를 포함해 빌드합니다.

## 현재 공개 정책

초기 공개 발표용 정책은 누구나 게시물·댓글·좋아요를 작성할 수 있게 구성되어 있습니다. 실제 공개 서비스 전에는 Supabase Auth를 연결하고, SQL 파일의 INSERT/DELETE 정책을 `auth.uid()` 기반으로 교체해야 합니다. 서비스 역할 키(`service_role`)는 절대로 GitHub Secrets, 프런트엔드 코드, GitHub Pages에 넣지 마세요.

## 랭킹과 배지

현재 도전과제와 랭킹 UI는 현재 기기의 발견 기록을 기반으로 계산됩니다. 다음 단계에서는 발견 기록도 Supabase `discoveries` 테이블로 옮기고, 서버 측 점수 집계로 전체 사용자 랭킹을 만들면 됩니다.
