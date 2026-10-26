"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Flag,
  Share2,
  Send,
  RotateCw,
  Check,
  MapPin,
  Sparkles,
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
  const [replyError, setReplyError] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
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
          const authorName =
            r.author?.profile?.name || r.author?.name || "Community Member";
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
            authorRole: r.author?.primaryRole || r.author?.role || "founder",
            authorHeadline: r.author?.headline || r.author?.profile?.headline,
            authorCity: r.author?.city || r.author?.profile?.city,
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
      setReplyError(null);
      const res = await fetch(`/api/v1/posts/${postId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newReply.trim() }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.message || "Failed to post response");
      }

      setNewReply("");
      await loadData();
    } catch (err: any) {
      setReplyError(err.message || "Failed to submit response");
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#ECF1EF]/60 space-y-4 select-none">
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
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <h2 className="font-display text-xl text-[#F5FAF6]">Discussion thread not found</h2>
          <p className="text-xs text-[#ECF1EF]/60">The requested post may have been moved or removed.</p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-[#F5FAF6] hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Community</span>
          </Link>
        </div>
      </MemberShell>
    );
  }

  const role = post.author?.primaryRole || "founder";
  const authorInitials = (post.author?.name || "M")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <MemberShell>
      <div className="max-w-4xl mx-auto py-6 space-y-6 pb-24 text-[#F5FAF6]">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/community"
            className="text-xs font-semibold text-[#ECF1EF]/60 hover:text-[#88DECC] flex items-center gap-2 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Community</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-[#F5FAF6] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Discussion"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span className="text-[#88DECC] font-mono text-[11px]">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px]">Share</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setReported(true);
                setTimeout(() => setReported(false), 3000);
              }}
              className="p-2 rounded-xl text-[#ECF1EF]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Report Question"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {reported && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs animate-in fade-in">
            Thank you. This thread has been flagged for administrator review.
          </div>
        )}

        {/* ── Main Question Card ───────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#070D12] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)] relative overflow-hidden space-y-6">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

          {/* Meta & Tags */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30">
                {post.category || "General"}
              </span>

              {post.isResolved && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Solved by Community</span>
                </div>
              )}

              <span className="text-white/20">•</span>

              <span className="text-[#ECF1EF]/50 flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-light text-[#F5FAF6] tracking-tight leading-snug">
              {post.title}
            </h1>
          </div>

          {/* Author Details Bar */}
          <div className="flex items-center gap-3.5 py-3.5 border-y border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#88DECC]/30 to-white/10 text-[#88DECC] font-bold text-xs flex items-center justify-center border border-white/12 shrink-0">
              {authorInitials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs sm:text-sm text-[#F5FAF6] truncate">
                  {post.author?.name || "Community Member"}
                </span>

                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase border tracking-wider",
                    role === "mentor"
                      ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                      : role === "aspiring_entrepreneur"
                      ? "bg-blue-400/10 text-blue-300 border-blue-400/30"
                      : "bg-[#88DECC]/10 text-[#88DECC] border-[#88DECC]/30"
                  )}
                >
                  {role === "mentor"
                    ? "Mentor"
                    : role === "aspiring_entrepreneur"
                    ? "Aspiring"
                    : "Founder"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#ECF1EF]/50 truncate">
                <span>{post.author?.headline || "Odisha Startup Ecosystem"}</span>
                {post.author?.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-[#ECF1EF]/40" />
                      {post.author.city}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Question Body */}
          <div className="text-sm sm:text-base leading-relaxed text-[#ECF1EF]/85 whitespace-pre-wrap font-sans">
            {post.body}
          </div>
        </div>

        {/* ── Responses Section ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-display text-lg sm:text-xl font-medium text-[#F5FAF6] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#88DECC]" />
              <span>Responses &amp; Guidance ({replies.length})</span>
            </h2>
            <span className="text-xs text-[#ECF1EF]/50 font-mono">Open Discussion</span>
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleAddReply}
            className="p-5 sm:p-6 rounded-3xl bg-[#070D12] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70">
                Share Your Answer or Insight
              </label>
              <span className="text-[10px] text-[#88DECC] font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> No approval required
              </span>
            </div>

            {replyError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/25">
                {replyError}
              </div>
            )}

            <textarea
              required
              rows={4}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Provide actionable guidance, founder contacts, regulatory steps, or technical lessons from your experience..."
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-[#ECF1EF]/50 font-sans hidden sm:block">
                Constructive, concrete answers help fellow Odisha founders succeed.
              </p>

              <button
                type="submit"
                disabled={submittingReply || !newReply.trim()}
                className="px-6 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReply ? "Posting Answer..." : "Post Response"}</span>
              </button>
            </div>
          </form>

          {/* List of Replies */}
          <div className="space-y-4">
            {replies.length === 0 ? (
              <div className="p-10 rounded-3xl border border-dashed border-white/10 text-center space-y-2 bg-[#070D12]/50">
                <p className="text-sm font-medium text-[#F5FAF6]">
                  No responses yet.
                </p>
                <p className="text-xs text-[#ECF1EF]/50 max-w-sm mx-auto">
                  Be the first mentor or peer to guide this founder on their journey!
                </p>
              </div>
            ) : (
              replies.map((reply) => {
                const repRole = reply.authorRole;
                return (
                  <div
                    key={reply.id}
                    className={cn(
                      "p-5 sm:p-6 rounded-3xl border transition-all space-y-4 relative overflow-hidden",
                      reply.isAccepted
                        ? "bg-[#071714] border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.15)]"
                        : "bg-[#070D12] border-white/10 hover:border-white/20"
                    )}
                  >
                    {reply.isAccepted && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-[#88DECC] font-bold text-xs flex items-center justify-center border border-white/10 shrink-0">
                          {reply.avatarInitials}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#F5FAF6]">
                              {reply.authorName}
                            </span>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase border tracking-wider",
                                repRole === "mentor"
                                  ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                                  : repRole === "aspiring_entrepreneur"
                                  ? "bg-blue-400/10 text-blue-300 border-blue-400/30"
                                  : "bg-[#88DECC]/10 text-[#88DECC] border-[#88DECC]/30"
                              )}
                            >
                              {repRole === "mentor"
                                ? "Mentor"
                                : repRole === "aspiring_entrepreneur"
                                ? "Aspiring"
                                : "Founder"}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#ECF1EF]/50">
                            {reply.authorHeadline || reply.authorCity || "Community Member"}
                          </p>
                        </div>
                      </div>

                      {reply.isAccepted ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Accepted Solution</span>
                        </span>
                      ) : (
                        !post.isResolved && (
                          <button
                            type="button"
                            onClick={() => handleAcceptAnswer(reply.id)}
                            className="text-[11px] font-mono text-[#ECF1EF]/50 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer bg-white/[0.03] hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-white/10 hover:border-emerald-500/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Solution</span>
                          </button>
                        )
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[#ECF1EF]/80 leading-relaxed whitespace-pre-wrap font-sans">
                      {reply.body}
                    </p>
                  </div>
                );
              })
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
    <Suspense fallback={<div className="min-h-screen bg-[#03080B] text-[#F5FAF6]" />}>
      <QuestionDetailContent params={params} />
    </Suspense>
  );
}
