"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { MemberAvatar } from "@/components/community/MemberAvatar";
import {
  PostResponseItem,
  formatRelativeTime,
  formatRoleLabel,
} from "@/components/community/types";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Flag,
  Share2,
  Send,
  ThumbsUp,
  Check,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostDetail {
  id: string;
  title: string;
  body: string;
  category?: string;
  type?: string;
  isResolved?: boolean;
  resolvedAnswerId?: string | null;
  createdAt: string;
  editedAt?: string | null;
  isOwner?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
  author: {
    id: string;
    name?: string;
    headline?: string;
    avatarUrl?: string | null;
    primaryRole?: string;
    role?: string;
    city?: string;
  };
}

interface ReplyItem {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorHeadline?: string;
  authorCity?: string;
  avatarUrl?: string | null;
  createdAt: string;
  body: string;
  isAccepted?: boolean;
}

async function fetchPostAndReplies(postId: string): Promise<{
  post: PostDetail;
  replies: ReplyItem[];
}> {
  const postRes = await fetch(`/api/v1/posts/${postId}`);
  if (!postRes.ok) {
    throw new Error("Failed to load post");
  }
  const postJson = await postRes.json();
  const postData: PostDetail = postJson.data;

  let repliesData: ReplyItem[] = [];
  const respRes = await fetch(`/api/v1/posts/${postId}/responses`);
  if (respRes.ok) {
    const respJson = await respRes.json();
    const rawReplies: PostResponseItem[] = Array.isArray(respJson.data)
      ? respJson.data
      : [];
    repliesData = rawReplies.map((r) => ({
      id: r.id,
      authorId: r.author?.id || "",
      authorName: r.author?.name || "Community Member",
      authorRole: r.author?.primaryRole || r.author?.role || "founder",
      authorHeadline: r.author?.headline || undefined,
      authorCity: r.author?.city || undefined,
      avatarUrl: r.author?.avatarUrl || null,
      createdAt: r.createdAt,
      body: r.body,
      isAccepted: postData?.resolvedAnswerId === r.id,
    }));
  }

  return { post: postData, replies: repliesData };
}

function QuestionDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [newReply, setNewReply] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const data = await fetchPostAndReplies(postId);
      setError(null);
      setPost(data.post);
      setReplies(data.replies);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let active = true;
    fetchPostAndReplies(postId)
      .then((data) => {
        if (!active) return;
        setError(null);
        setPost(data.post);
        setReplies(data.replies);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load post");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  const handleToggleLike = async () => {
    if (!post || liking) return;
    const prevLiked = Boolean(post.likedByMe);
    const prevCount = post.likeCount || 0;

    setPost({
      ...post,
      likedByMe: !prevLiked,
      likeCount: Math.max(0, prevCount + (prevLiked ? -1 : 1)),
    });

    try {
      setLiking(true);
      const res = await fetch(`/api/v1/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      if (json?.data) {
        setPost((curr) =>
          curr
            ? {
                ...curr,
                likedByMe: Boolean(json.data.liked),
                likeCount: Number(json.data.likeCount) || 0,
              }
            : curr
        );
      }
    } catch {
      setPost((curr) =>
        curr ? { ...curr, likedByMe: prevLiked, likeCount: prevCount } : curr
      );
    } finally {
      setLiking(false);
    }
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      setSubmittingReply(true);
      setReplyError(null);
      const res = await fetch(`/api/v1/posts/${postId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newReply.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || errJson.message || "Failed to post comment"
        );
      }

      setNewReply("");
      await refreshData();
    } catch (err: unknown) {
      setReplyError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAcceptAnswer = async (responseId: string) => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedResponseId: responseId }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="max-w-2xl mx-auto py-8 space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 space-y-3 animate-pulse">
            <div className="h-4 w-40 rounded bg-[var(--surface-2)]" />
            <div className="h-6 w-3/4 rounded bg-[var(--surface-2)]" />
            <div className="h-3.5 w-full rounded bg-[var(--surface-2)]" />
            <div className="h-3.5 w-5/6 rounded bg-[var(--surface-2)]" />
          </div>
        </div>
      </MemberShell>
    );
  }

  if (error || !post) {
    return (
      <MemberShell>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-3">
          <h2 className="text-lg font-semibold text-[var(--text)]">
            Post not found
          </h2>
          <p className="text-xs text-[var(--muted)]">
            This post may have been removed.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to feed</span>
          </Link>
        </div>
      </MemberShell>
    );
  }

  const authorHeadline =
    post.author?.headline ||
    [
      formatRoleLabel(post.author?.primaryRole || post.author?.role),
      post.author?.city,
    ]
      .filter(Boolean)
      .join(" · ");

  const firstLine =
    post.body.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() || "";
  const showTitle =
    post.title &&
    post.title.trim() !== firstLine &&
    !(
      post.title.endsWith("...") &&
      firstLine.startsWith(post.title.slice(0, -3))
    );

  return (
    <MemberShell>
      <div className="max-w-2xl mx-auto py-4 sm:py-6 space-y-4 pb-20">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to feed</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setReported(true);
              setTimeout(() => setReported(false), 3000);
            }}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            title="Report post"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        {reported && (
          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)]">
            Thank you. This post has been flagged for review.
          </div>
        )}

        {/* Post Card */}
        <article className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4 shadow-[var(--shadow-1)]">
          <div className="flex items-start gap-3">
            <Link href={`/people/${post.author?.id}`} className="shrink-0">
              <MemberAvatar
                name={post.author?.name}
                src={post.author?.avatarUrl}
                size="lg"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/people/${post.author?.id}`}
                  className="text-sm font-semibold text-[var(--text)] hover:underline"
                >
                  {post.author?.name || "Community Member"}
                </Link>
                {post.isResolved && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--success)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)] truncate">
                {authorHeadline}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mt-0.5">
                <span>{formatRelativeTime(post.createdAt)}</span>
                {post.category && (
                  <>
                    <span>·</span>
                    <span>{post.category}</span>
                  </>
                )}
                {post.author?.city && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      {post.author.city}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {showTitle && (
              <h1 className="text-lg font-semibold text-[var(--text)] leading-snug">
                {post.title}
              </h1>
            )}
            <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
              {post.body}
            </p>
          </div>

          {((post.likeCount || 0) > 0 || replies.length > 0) && (
            <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
              <span>
                {(post.likeCount || 0) > 0
                  ? `${post.likeCount} ${post.likeCount === 1 ? "like" : "likes"}`
                  : ""}
              </span>
              <span>
                {replies.length} {replies.length === 1 ? "comment" : "comments"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-[var(--border)]/70">
            <button
              type="button"
              onClick={handleToggleLike}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                post.likedByMe
                  ? "text-[var(--accent)] bg-[var(--accent-soft)]/50 font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              )}
            >
              <ThumbsUp
                className={cn("w-4 h-4", post.likedByMe && "fill-current")}
              />
              <span>Like</span>
            </button>

            <a
              href="#comment-input"
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Comment</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[var(--success)]" />
                  <span className="text-[var(--success)]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </article>

        {/* Add Comment */}
        <form
          onSubmit={handleAddReply}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 shadow-[var(--shadow-1)]"
        >
          {replyError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-[var(--danger)]">
              {replyError}
            </div>
          )}

          <textarea
            id="comment-input"
            required
            rows={3}
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-y"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReply || !newReply.trim()}
              className="px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-40 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReply ? "Posting..." : "Post comment"}</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {replies.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center text-xs text-[var(--muted)]">
              No comments yet. Be the first to reply.
            </div>
          ) : (
            replies.map((reply) => (
              <div
                key={reply.id}
                className={cn(
                  "bg-[var(--surface)] border rounded-xl p-4 space-y-2 shadow-[var(--shadow-1)]",
                  reply.isAccepted
                    ? "border-[var(--success)]/60"
                    : "border-[var(--border)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Link
                      href={`/people/${reply.authorId}`}
                      className="shrink-0"
                    >
                      <MemberAvatar
                        name={reply.authorName}
                        src={reply.avatarUrl}
                        size="sm"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/people/${reply.authorId}`}
                        className="text-xs font-semibold text-[var(--text)] hover:underline"
                      >
                        {reply.authorName}
                      </Link>
                      <p className="text-[11px] text-[var(--muted)] truncate">
                        {reply.authorHeadline ||
                          formatRoleLabel(reply.authorRole)}{" "}
                        · {formatRelativeTime(reply.createdAt)}
                      </p>
                    </div>
                  </div>

                  {reply.isAccepted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accepted answer
                    </span>
                  ) : (
                    post.isOwner &&
                    !post.isResolved && (
                      <button
                        type="button"
                        onClick={() => handleAcceptAnswer(reply.id)}
                        className="text-[11px] text-[var(--muted)] hover:text-[var(--success)] px-2 py-1 rounded-md border border-[var(--border)] hover:border-[var(--success)]/50 transition-colors cursor-pointer shrink-0"
                      >
                        Mark helpful
                      </button>
                    )
                  )}
                </div>

                <p className="text-sm text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                  {reply.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </MemberShell>
  );
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[var(--bg)] text-[var(--text)]" />}
    >
      <QuestionDetailContent params={params} />
    </Suspense>
  );
}
