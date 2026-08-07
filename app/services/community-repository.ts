import type { CommunityComment, CommunityPost } from "../types/community";

type PostRow = { id: string; author_key: string; author_name: string; title: string; content: string; created_at: string; discovery_id: string | null; species_name: string | null; species_image_label: string | null; species_image_tone: string | null; location_name: string | null; };
type CommentRow = { id: string; post_id: string; author_name: string; content: string; created_at: string; };
type LikeRow = { post_id: string; author_key: string; };
type RemotePostDraft = Omit<CommunityPost, "id" | "author" | "createdAt" | "likes" | "comments">;

const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isRemoteCommunityEnabled = Boolean(baseUrl && publicKey);

function requestHeaders(extra?: HeadersInit): HeadersInit {
  return { apikey: publicKey ?? "", Authorization: `Bearer ${publicKey ?? ""}`, "Content-Type": "application/json", ...extra };
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl || !publicKey) throw new Error("공용 커뮤니티 연결 정보가 없습니다.");
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, { ...init, headers: requestHeaders(init?.headers) });
  if (!response.ok) throw new Error("공용 커뮤니티 요청을 처리하지 못했습니다.");
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
function toPost(row: PostRow, comments: CommentRow[], likes: LikeRow[]): CommunityPost {
  return { id: row.id, author: row.author_name, title: row.title, content: row.content, createdAt: row.created_at, discoveryId: row.discovery_id ?? undefined, speciesName: row.species_name ?? undefined, speciesImageLabel: row.species_image_label ?? undefined, speciesImageTone: row.species_image_tone ?? undefined, locationName: row.location_name ?? undefined, likes: likes.filter((like) => like.post_id === row.id).map((like) => like.author_key), comments: comments.filter((comment) => comment.post_id === row.id).map((comment): CommunityComment => ({ id: comment.id, author: comment.author_name, content: comment.content, createdAt: comment.created_at })) };
}

export const communityRepository = {
  async listPosts(): Promise<CommunityPost[]> {
    if (!isRemoteCommunityEnabled) return [];
    const [posts, comments, likes] = await Promise.all([
      request<PostRow[]>("community_posts?select=*&visibility=eq.public&order=created_at.desc"),
      request<CommentRow[]>("community_comments?select=*&order=created_at.asc"),
      request<LikeRow[]>("community_likes?select=post_id,author_key"),
    ]);
    return posts.map((post) => toPost(post, comments, likes));
  },
  async createPost(draft: RemotePostDraft, author: string, authorKey: string): Promise<void> {
    await request("community_posts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ author_key: authorKey, author_name: author, title: draft.title, content: draft.content, discovery_id: draft.discoveryId ?? null, species_name: draft.speciesName ?? null, species_image_label: draft.speciesImageLabel ?? null, species_image_tone: draft.speciesImageTone ?? null, location_name: draft.locationName ?? null, visibility: "public" }) });
  },
  async toggleLike(postId: string, authorKey: string, liked: boolean): Promise<void> {
    if (liked) { await request(`community_likes?post_id=eq.${encodeURIComponent(postId)}&author_key=eq.${encodeURIComponent(authorKey)}`, { method: "DELETE" }); return; }
    await request("community_likes", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ post_id: postId, author_key: authorKey }) });
  },
  async addComment(postId: string, author: string, content: string): Promise<void> {
    await request("community_comments", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ post_id: postId, author_name: author, content }) });
  },
};
