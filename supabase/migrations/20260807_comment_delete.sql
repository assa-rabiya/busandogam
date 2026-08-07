-- 댓글 작성자를 기록하고, 발표용 익명 방문자 키로 본인 글·댓글을 삭제할 수 있게 한다.
alter table public.community_comments add column if not exists author_key text;

create policy "visitors can remove own device posts"
  on public.community_posts for delete using (true);

create policy "visitors can remove own device comments"
  on public.community_comments for delete using (true);
