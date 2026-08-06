import { PlaceholderPage } from "../../components/app-shell";
export function generateStaticParams() { return [{ id: "demo" }]; }
export default function CommunityDetailPage() { return <PlaceholderPage title="게시물 상세" description="게시물과 댓글 상세 보기는 6단계에서 연결됩니다." />; }
