export interface PostAuthor {
  id: string;
  name?: string;
  headline?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
  primaryRole?: string | null;
  role?: string | null;
}

export interface CommunityPost {
  id: string;
  title: string;
  body: string;
  category?: string | null;
  type?: string | null;
  status?: string;
  isResolved?: boolean;
  resolvedAnswerId?: string | null;
  editedAt?: string | null;
  createdAt: string;
  isOwner?: boolean;
  author: PostAuthor;
  tags?: string[];
  responseCount: number;
  likeCount: number;
  likedByMe: boolean;
}

export interface PostResponseItem {
  id: string;
  postId: string;
  body: string;
  status?: string;
  createdAt: string;
  author: PostAuthor;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string | null;
  createdAt?: string;
  approvedAt?: string | null;
  author?: {
    id: string;
    name?: string | null;
    headline?: string | null;
    avatarUrl?: string | null;
  };
}

export interface CurrentMember {
  id: string;
  name?: string | null;
  email?: string | null;
  headline?: string | null;
  city?: string | null;
  primaryRole?: string | null;
  profilePhotoUrl?: string | null;
  avatarUrl?: string | null;
}

export const COMMUNITY_CATEGORIES = [
  "General",
  "Collaboration",
  "Funding",
  "Regulation",
  "Hardware",
  "DeepTech",
  "Hiring",
] as const;

export function getInitials(name?: string | null): string {
  const clean = (name || "Member").trim();
  if (!clean) return "M";
  const parts = clean.split(/\s+/);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function formatRoleLabel(role?: string | null): string {
  if (role === "mentor") return "Mentor";
  if (role === "aspiring_entrepreneur") return "Aspiring Founder";
  if (role === "founder") return "Founder";
  return "Member";
}

export function formatRelativeTime(dateInput?: string | null): string {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

