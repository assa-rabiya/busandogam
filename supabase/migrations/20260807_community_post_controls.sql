-- Add post categories for field know-how and safety posts.
alter table public.community_posts
  add column if not exists category text not null default 'discovery'
  check (category in ('discovery', 'knowhow', 'safety'));

-- Prototype policy: replace with Supabase Auth ownership before production.
create policy "prototype visitors can remove posts" on public.community_posts
  for delete using (true);
