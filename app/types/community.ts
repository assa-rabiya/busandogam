export interface CommunityComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  createdAt: string;
  discoveryId?: string;
  speciesName?: string;
  speciesImageLabel?: string;
  speciesImageTone?: string;
  locationName?: string;
  likes: string[];
  comments: CommunityComment[];
}
