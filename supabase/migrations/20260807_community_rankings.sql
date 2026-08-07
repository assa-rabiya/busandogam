-- GitHub Pages에서 Supabase REST API로 사용하는 공용 커뮤니티 스키마입니다.
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(), author_key text not null, author_name text not null,
  title text not null check (char_length(title) between 1 and 70), content text not null check (char_length(content) between 1 and 500),
  discovery_id text, species_name text, species_image_label text, species_image_tone text, location_name text,
  visibility text not null default 'public' check (visibility in ('public', 'private')), created_at timestamptz not null default now()
);
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.community_posts(id) on delete cascade,
  author_name text not null, content text not null check (char_length(content) between 1 and 200), created_at timestamptz not null default now()
);
create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade, author_key text not null,
  created_at timestamptz not null default now(), primary key (post_id, author_key)
);
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_comments_post_id_idx on public.community_comments (post_id, created_at);
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
create policy "public posts are readable" on public.community_posts for select using (visibility = 'public');
create policy "public comments are readable" on public.community_comments for select using (true);
create policy "public likes are readable" on public.community_likes for select using (true);
-- 발표/초기 공개용 정책입니다. 실제 서비스에서는 Supabase Auth auth.uid() 조건으로 교체하세요.
create policy "visitors can create public posts" on public.community_posts for insert with check (visibility = 'public');
create policy "visitors can create comments" on public.community_comments for insert with check (true);
create policy "visitors can create likes" on public.community_likes for insert with check (true);
create policy "visitors can remove own device likes" on public.community_likes for delete using (true);
