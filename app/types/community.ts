export interface CommunityComment {
  id: string;
  /** Device-local owner key; only the author sees the delete control. */
  authorKey?: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  /** Device-local identifier used only to decide whether the delete control is shown. */
  authorKey?: string;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  discoveryId?: string;
  speciesName?: string;
  speciesImageLabel?: string;
  speciesImageTone?: string;
  locationName?: string;
  category?: "discovery" | "knowhow" | "safety";
  likes: string[];
  comments: CommunityComment[];
}
