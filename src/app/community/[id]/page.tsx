"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit2,
  MessageSquare,
  Shield,
  Flag,
  Share2,
  Send,
  Sparkles,
  RotateCw,
} from "lucide-react";

interface PostDetail {
  id: string;
  title: string;
  body: string;
  category?: string;
  type?: string;
  isResolved?: boolean;
  resolvedAnswerId?: string | null;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    headline?: string;
    primaryRole?: string;
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
  avatarInitials: string;
  createdAt: string;
  body: string;
  isAccepted?: boolean;
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
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Post
      const postRes = await fetch(`/api/v1/posts/${postId}`);
      if (!postRes.ok) {
        throw new Error("Failed to load question");
      }
      const postJson = await postRes.json();
      setPost(postJson.data);

      // Fetch Responses
      const respRes = await fetch(`/api/v1/posts/${postId}/responses`);
      if (respRes.ok) {
        const respJson = await respRes.json();
        const rawReplies = respJson.data || [];
        const formatted: ReplyItem[] = rawReplies.map((r: any) => {
          const authorName = r.author?.profile?.name || r.author?.name || "Community Member";
          const initials = authorName
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            id: r.id,
            authorId: r.authorId || r.author?.id,
            authorName,
            authorRole: r.author?.primaryRole || "founder",
            authorHeadline: r.author?.profile?.headline,
            authorCity: r.author?.profile?.city,
            avatarInitials: initials,
            createdAt: r.createdAt,
            body: r.body,
            isAccepted: postJson.data?.resolvedAnswerId === r.id,
          };
        });
        setReplies(formatted);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await fetch(`/api/v1/posts/${postId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newReply.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Failed to post response");
      }

      setNewReply("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to submit response");
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
        await loadData();
      }
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-[#ECF1EF]/60 space-y-4 select-none">
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <p className="text-xs font-mono text-[#ECF1EF]/60">Loading discussion thread...</p>
        </div>
      </MemberShell>
    );
  }

  if (error || !post) {
    return (
      <MemberShell>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <h2 className="font-display text-xl text-[var(--text)]">Question not found</h2>
          <p className="text-xs text-[var(--muted)]">The requested thread may have been moved or removed.</p>
          <Link href="/community">
            <Button size="sm" variant="outline">
              ← Return to Community
            </Button>
          </Link>
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell>
      <div className="max-w-[860px] mx-auto py-6 lg:py-10 space-y-8 pb-20">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/community"
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setReported(true);
                setTimeout(() => setReported(false), 3000);
              }}
              className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors"
              title="Report Question"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {reported && (
          <div className="p-3 rounded-xl bg-amber-50 text-[var(--warning)] border border-amber-200 text-xs">
            Thank you. This question has been flagged for administrator review.
          </div>
        )}

        {/* ── Main Question Container ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-1)] space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="primary">{post.category || "General"}</Badge>
              {post.isResolved && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[var(--success)] font-medium border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolved
                </div>
              )}
              <span className="text-[var(--muted)]">•</span>
              <span className="text-[var(--muted)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight leading-snug">
              {post.title}
            </h1>
          </div>

          {/* Author Header */}
          <div className="flex items-center gap-3.5 py-3 border-y border-[var(--border)]">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--brand-navy)] font-display font-medium flex items-center justify-center border border-[var(--border)] shrink-0">
              {(post.author?.name || "M").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm text-[var(--text)]">
                  {post.author?.name || "Community Member"}
                </span>
                {post.author?.primaryRole && (
                  <Badge
                    variant={
                      post.author.primaryRole === "mentor"
                        ? "mentor"
                        : post.author.primaryRole === "aspiring_entrepreneur"
                        ? "aspiring"
                        : "founder"
                    }
                  >
                    {post.author.primaryRole === "mentor"
                      ? "Mentor"
                      : post.author.primaryRole === "aspiring_entrepreneur"
                      ? "Aspiring"
                      : "Founder"}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                {post.author?.headline || post.author?.city || "Odisha Startup Ecosystem"}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="prose prose-sm max-w-none text-[var(--text)] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>
        </div>

        {/* ── Replies Section ─────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-medium text-[var(--text)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
              Responses ({replies.length})
            </h2>
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleAddReply}
            className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3"
          >
            <label className="block text-xs font-semibold uppercase text-[var(--muted)]">
              Write an Answer or Insight
            </label>
            <textarea
              required
              rows={3}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share concrete lessons, contacts, or technical suggestions from your journey..."
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={submittingReply || !newReply.trim()}
                className="gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingReply ? "Posting..." : "Post Response"}
              </Button>
            </div>
          </form>

          {/* List of Replies */}
          <div className="space-y-4">
            {replies.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-[var(--border)] text-center text-xs text-[var(--muted)]">
                No replies yet. Be the first to share guidance on this question!
              </div>
            ) : (
              replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 ${
                    reply.isAccepted
                      ? "bg-emerald-50/20 border-emerald-300 dark:border-emerald-800"
                      : "bg-[var(--surface)] border-[var(--border)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium flex items-center justify-center border border-[var(--border)] text-xs">
                        {reply.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-[var(--text)]">
                            {reply.authorName}
                          </span>
                          <Badge
                            variant={
                              reply.authorRole === "mentor"
                                ? "mentor"
                                : reply.authorRole === "aspiring_entrepreneur"
                                ? "aspiring"
                                : "founder"
                            }
                          >
                            {reply.authorRole === "mentor"
                              ? "Mentor"
                              : reply.authorRole === "aspiring_entrepreneur"
                              ? "Aspiring"
                              : "Founder"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">
                          {reply.authorHeadline || reply.authorCity || "Community Member"}
                        </p>
                      </div>
                    </div>

                    {reply.isAccepted ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted Answer
                      </span>
                    ) : (
                      !post.isResolved && (
                        <button
                          type="button"
                          onClick={() => handleAcceptAnswer(reply.id)}
                          className="text-[11px] text-[var(--muted)] hover:text-[var(--success)] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Accepted
                        </button>
                      )
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                    {reply.body}
                  </p>
                </div>
              ))
            )}
          </div>
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <QuestionDetailContent params={params} />
    </Suspense>
  );
}
