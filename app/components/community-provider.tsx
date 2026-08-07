"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { communityRepository, isRemoteCommunityEnabled } from "../services/community-repository";
import type { CommunityPost } from "../types/community";

const storageKey = "busan-sea-guide-community-v1";
const initialPosts: CommunityPost[] = [
  { id: "community-1", author: "해운대 관찰자", title: "청사포 조수 웅덩이에서 말미잘을 만났어요", content: "간조 무렵 바위 웅덩이를 천천히 살피니 촉수를 펼친 말미잘이 보였습니다. 손대지 않고 사진만 남겼어요.", createdAt: "2026-08-06T10:10:00", speciesName: "말미잘", speciesImageLabel: "✺", speciesImageTone: "anemone", locationName: "청사포", likes: ["mock-1", "mock-2", "mock-3"], comments: [{ id: "comment-1", author: "바다사진가", content: "관찰 수칙까지 함께 알려주셔서 좋아요!", createdAt: "2026-08-06T10:24:00" }] },
  { id: "community-2", author: "기장 탐험대", title: "대변항 방파제 주변의 쏨뱅이", content: "바위색과 비슷해서 처음에는 발견하기 어려웠습니다. 등지느러미 가시가 보여 안전거리를 유지했어요.", createdAt: "2026-08-05T15:30:00", speciesName: "쏨뱅이", speciesImageLabel: "◆", speciesImageTone: "rockfish", locationName: "기장 대변항", likes: ["mock-1", "mock-4"], comments: [] },
];

type PostDraft = Omit<CommunityPost, "id" | "authorKey" | "author" | "createdAt" | "likes" | "comments">;
type CommunityContextValue = { posts: CommunityPost[]; isReady: boolean; visitorKey: string; createPost: (draft: PostDraft, author: string) => void; toggleLike: (postId: string) => void; addComment: (postId: string, author: string, content: string) => void; deletePost: (postId: string) => void; deleteComment: (postId: string, commentId: string) => void; };
const CommunityContext = createContext<CommunityContextValue | null>(null);

function readPosts() { try { const raw = window.localStorage.getItem(storageKey); if (!raw) return initialPosts; const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed as CommunityPost[] : initialPosts; } catch { return initialPosts; } }
function getAuthorKey() { const key = "busan-sea-guide-community-visitor"; const saved = window.localStorage.getItem(key); if (saved) return saved; const next = globalThis.crypto?.randomUUID?.() ?? `visitor-${Date.now()}`; window.localStorage.setItem(key, next); return next; }

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts); const [isReady, setReady] = useState(false); const [visitorKey, setVisitorKey] = useState("");
  useEffect(() => { const timer = window.setTimeout(() => { setVisitorKey(getAuthorKey()); void (async () => { if (isRemoteCommunityEnabled) { try { setPosts(await communityRepository.listPosts()); } catch { setPosts(readPosts()); } } else { setPosts(readPosts()); } setReady(true); })(); }, 0); return () => window.clearTimeout(timer); }, []);
  const persist = useCallback((next: CommunityPost[]) => { setPosts(next); window.localStorage.setItem(storageKey, JSON.stringify(next)); }, []);
  const reloadRemote = useCallback(() => { void communityRepository.listPosts().then(setPosts).catch(() => undefined); }, []);
  const createPost = useCallback((draft: PostDraft, author: string) => {
    const authorKey = getAuthorKey();
    const post: CommunityPost = { ...draft, id: globalThis.crypto?.randomUUID?.() ?? `community-${Date.now()}`, authorKey, author, createdAt: new Date().toISOString(), likes: [], comments: [] };
    // 원격 저장소를 사용하는 경우에도 먼저 화면을 즉시 갱신한다.
    persist([post, ...posts]);
    if (isRemoteCommunityEnabled) void communityRepository.createPost(draft, author, authorKey).then(reloadRemote).catch(() => undefined);
  }, [persist, posts, reloadRemote]);
  const toggleLike = useCallback((postId: string) => { const authorKey = visitorKey || getAuthorKey(); const post = posts.find((item) => item.id === postId); if (!post) return; persist(posts.map((item) => item.id !== postId ? item : { ...item, likes: item.likes.includes(authorKey) ? item.likes.filter((id) => id !== authorKey) : [...item.likes, authorKey] })); if (isRemoteCommunityEnabled) void communityRepository.toggleLike(postId, authorKey, post.likes.includes(authorKey)).then(reloadRemote).catch(() => undefined); }, [persist, posts, reloadRemote, visitorKey]);
  const addComment = useCallback((postId: string, author: string, content: string) => { const cleaned = content.trim(); if (!cleaned) return; const authorKey = visitorKey || getAuthorKey(); persist(posts.map((post) => post.id !== postId ? post : { ...post, comments: [...post.comments, { id: globalThis.crypto?.randomUUID?.() ?? `comment-${Date.now()}`, authorKey, author, content: cleaned, createdAt: new Date().toISOString() }] })); if (isRemoteCommunityEnabled) void communityRepository.addComment(postId, author, authorKey, cleaned).then(reloadRemote).catch(() => undefined); }, [persist, posts, reloadRemote, visitorKey]);
  const deletePost = useCallback((postId: string) => { const authorKey = visitorKey || getAuthorKey(); const post = posts.find((item) => item.id === postId); if (!post || post.authorKey !== authorKey) return; persist(posts.filter((item) => item.id !== postId)); if (isRemoteCommunityEnabled) void communityRepository.deletePost(postId, authorKey).then(reloadRemote).catch(() => undefined); }, [persist, posts, reloadRemote, visitorKey]);
  const deleteComment = useCallback((postId: string, commentId: string) => { const authorKey = visitorKey || getAuthorKey(); const post = posts.find((item) => item.id === postId); const comment = post?.comments.find((item) => item.id === commentId); if (!post || !comment || comment.authorKey !== authorKey) return; persist(posts.map((item) => item.id !== postId ? item : { ...item, comments: item.comments.filter((found) => found.id !== commentId) })); if (isRemoteCommunityEnabled) void communityRepository.deleteComment(commentId, authorKey).then(reloadRemote).catch(() => undefined); }, [persist, posts, reloadRemote, visitorKey]);
  const value = useMemo(() => ({ posts, isReady, visitorKey, createPost, toggleLike, addComment, deletePost, deleteComment }), [addComment, createPost, deleteComment, deletePost, isReady, posts, toggleLike, visitorKey]);
  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() { const context = useContext(CommunityContext); if (!context) throw new Error("useCommunity must be used within CommunityProvider"); return context; }
