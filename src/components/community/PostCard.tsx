"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Check,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./MemberAvatar";
import {
  CommunityPost,
  CurrentMember,
  PostResponseItem,
  formatRelativeTime,
  formatRoleLabel,
} from "./types";

interface PostCardProps {
  post: CommunityPost;
  me: CurrentMember | null;
  onPostUpdated: (postId: string, patch: Partial<CommunityPost>) => void;
  onPostDeleted: (postId: string) => void;
}

const BODY_TRUNCATE_LIMIT = 340;

function shouldShowExplicitTitle(title: string, body: string): boolean {
  const cleanTitle = title.trim();
  const cleanBody = body.trim();
  if (!cleanTitle) return false;
  const firstLine =
    cleanBody.split(/\r?\n/).find((l) => l.trim().length > 0)?.trim() || "";
  if (cleanTitle === firstLine) return false;
  if (
    cleanTitle.endsWith("...") &&
    firstLine.startsWith(cleanTitle.slice(0, -3))
  ) {
    return false;
  }
  return true;
}

export function PostCard({
  post,
  me,
  onPostUpdated,
  onPostDeleted,
}: PostCardProps) {
  const [expandedBody, setExpandedBody] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inline comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [comments, setComments] = useState<PostResponseItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Owner menu / edit / delete
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authorId = post.author?.id;
  const authorName = post.author?.name || "Community Member";
  const authorHeadline =
    post.author?.headline ||
    [formatRoleLabel(post.author?.primaryRole || post.author?.role), post.author?.city]
      .filter(Boolean)
      .join(" · ");

  const [withinEditWindow] = useState(
    () => Date.now() - new Date(post.createdAt).getTime() <= 24 * 60 * 60 * 1000
  );

  const showTitle = shouldShowExplicitTitle(post.title, post.body);
  const needsTruncate = post.body.length > BODY_TRUNCATE_LIMIT;
  const displayBody =
    !needsTruncate || expandedBody
      ? post.body
      : `${post.body.slice(0, BODY_TRUNCATE_LIMIT).trimEnd()}...`;

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await fetch(`/api/v1/posts/${post.id}/responses`);
      if (res.ok) {
        const json = await res.json();
        setComments(Array.isArray(json.data) ? json.data : []);
        setCommentsLoaded(true);
      }
    } catch {
      // ignore network glitches on comment fetch
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = () => {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && !commentsLoaded) {
      loadComments();
    }
  };

  const handleToggleLike = async () => {
    if (liking) return;
    const prevLiked = post.likedByMe;
    const prevCount = post.likeCount;

    // Optimistic toggle
    onPostUpdated(post.id, {
      likedByMe: !prevLiked,
      likeCount: Math.max(0, prevCount + (prevLiked ? -1 : 1)),
    });

    try {
      setLiking(true);
      const res = await fetch(`/api/v1/posts/${post.id}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }
      const json = await res.json();
      if (json?.data) {
        onPostUpdated(post.id, {
          likedByMe: Boolean(json.data.liked),
          likeCount: Number(json.data.likeCount) || 0,
        });
      }
    } catch {
      // Revert optimistic update on failure
      onPostUpdated(post.id, {
        likedByMe: prevLiked,
        likeCount: prevCount,
      });
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      setCommentError(null);
      const res = await fetch(`/api/v1/posts/${post.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentText.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || errJson.message || "Could not post comment"
        );
      }

      const json = await res.json();
      setCommentText("");

      if (json?.data?.id) {
        const created: PostResponseItem = json.data;
        setComments((prev) => [...prev, created]);
        setCommentsLoaded(true);
      } else {
        await loadComments();
      }

      onPostUpdated(post.id, {
        responseCount: (post.responseCount || 0) + 1,
      });
    } catch (err: unknown) {
      setCommentError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBody.trim() || savingEdit) return;
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/v1/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody.trim() }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || errJson.message || "Could not save edit"
        );
      }
      onPostUpdated(post.id, {
        body: editBody.trim(),
        editedAt: new Date().toISOString(),
      });
      setEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/v1/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Could not delete post");
      }
      onPostDeleted(post.id);
    } catch {
      alert("Failed to delete post.");
      setDeleting(false);
    }
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(`${window.location.origin}/community/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myAvatarSrc = me?.profilePhotoUrl || me?.avatarUrl || null;
  const isOwner = Boolean(post.isOwner || (me?.id && authorId === me.id));

  return (
    <article className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-1)]">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {authorId ? (
              <Link href={`/people/${authorId}`} className="shrink-0">
                <MemberAvatar
                  name={authorName}
                  src={post.author?.avatarUrl}
                  size="lg"
                />
              </Link>
            ) : (
              <MemberAvatar
                name={authorName}
                src={post.author?.avatarUrl}
                size="lg"
              />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {authorId ? (
                  <Link
                    href={`/people/${authorId}`}
                    className="text-sm font-semibold text-[var(--text)] hover:underline truncate"
                  >
                    {authorName}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-[var(--text)] truncate">
                    {authorName}
                  </span>
                )}
                {post.isResolved && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)]">
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
                {post.editedAt && (
                  <>
                    <span>·</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setConfirmDelete(false);
                }}
                aria-label="Post options"
                className="p-1.5 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-2)] py-1 z-20 text-xs">
                  {withinEditWindow && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBody(post.body);
                        setEditing(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[var(--text)] hover:bg-[var(--surface-2)] flex items-center gap-2 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit post</span>
                    </button>
                  )}

                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full px-3 py-2 text-left text-[var(--danger)] hover:bg-[var(--surface-2)] flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete post</span>
                    </button>
                  ) : (
                    <div className="px-3 py-2 space-y-2 border-t border-[var(--border)]">
                      <p className="text-[11px] text-[var(--muted)]">
                        Delete this post?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="px-2.5 py-1 rounded-md bg-[var(--danger)] text-white text-[11px] font-medium cursor-pointer"
                        >
                          {deleting ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-1 rounded-md text-[11px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        {editing ? (
          <form onSubmit={handleSaveEdit} className="space-y-2">
            <textarea
              rows={4}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-y"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1 rounded-full text-xs text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || !editBody.trim()}
                className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--on-primary)] cursor-pointer disabled:opacity-40"
              >
                {savingEdit ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1.5">
            {showTitle && (
              <Link href={`/community/${post.id}`} className="block">
                <h2 className="text-base font-semibold text-[var(--text)] hover:underline leading-snug">
                  {post.title}
                </h2>
              </Link>
            )}
            <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
              {displayBody}
              {needsTruncate && (
                <button
                  type="button"
                  onClick={() => setExpandedBody((prev) => !prev)}
                  className="ml-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  {expandedBody ? "see less" : "see more"}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Engagement Summary */}
        {(post.likeCount > 0 || post.responseCount > 0) && (
          <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
            <div>
              {post.likeCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-[var(--accent)]" />
                  {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {post.responseCount > 0 && (
                <button
                  type="button"
                  onClick={handleToggleComments}
                  className="hover:underline cursor-pointer"
                >
                  {post.responseCount}{" "}
                  {post.responseCount === 1 ? "comment" : "comments"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* LinkedIn Action Bar */}
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
              className={cn(
                "w-4 h-4",
                post.likedByMe && "fill-current"
              )}
            />
            <span>Like</span>
          </button>

          <button
            type="button"
            onClick={handleToggleComments}
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              commentsOpen
                ? "text-[var(--text)] bg-[var(--surface-2)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
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
      </div>

      {/* Inline Comments Section */}
      {commentsOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-[var(--border)]/70 bg-[var(--surface-2)]/30 space-y-3 rounded-b-xl">
          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex items-start gap-2.5">
            <MemberAvatar name={me?.name} src={myAvatarSrc} size="sm" />
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                maxLength={5000}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              {commentText.trim() && (
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-3.5 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-40 transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingComment ? "..." : "Post"}</span>
                </button>
              )}
            </div>
          </form>

          {commentError && (
            <p className="text-xs text-[var(--danger)] pl-10">{commentError}</p>
          )}

          {/* Comment List */}
          {commentsLoading ? (
            <p className="text-xs text-[var(--muted)] pl-10 py-1">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[var(--muted)] pl-10 py-1">
              No comments yet. Be the first to reply.
            </p>
          ) : (
            <div className="space-y-2.5">
              {comments.map((comment) => {
                const isAccepted = post.resolvedAnswerId === comment.id;
                const cName = comment.author?.name || "Member";
                const cHeadline =
                  comment.author?.headline ||
                  formatRoleLabel(
                    comment.author?.primaryRole || comment.author?.role
                  );

                return (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <Link
                      href={`/people/${comment.author?.id}`}
                      className="shrink-0 mt-0.5"
                    >
                      <MemberAvatar
                        name={cName}
                        src={comment.author?.avatarUrl}
                        size="sm"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 bg-[var(--surface)] border border-[var(--border)]/70 rounded-xl px-3.5 py-2.5 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/people/${comment.author?.id}`}
                            className="text-xs font-semibold text-[var(--text)] hover:underline"
                          >
                            {cName}
                          </Link>
                          <p className="text-[11px] text-[var(--muted)] truncate">
                            {cHeadline}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAccepted && (
                            <span className="text-[10px] font-medium text-[var(--success)] inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                          <span className="text-[11px] text-[var(--muted)]">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
                        {comment.body}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="pl-10">
                <Link
                  href={`/community/${post.id}`}
                  className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:underline"
                >
                  Open full discussion →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
