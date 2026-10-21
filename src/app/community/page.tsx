"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MemberShell } from "@/components/layout/MemberShell";
import { Badge } from "@/components/ui/Badge";
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  ArrowRight,
  X,
  RotateCw,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const filterChips = [
  "All",
  "Hardware",
  "Regulation",
  "Collaboration",
  "DeepTech",
  "Funding",
  "Hiring",
];

interface PostItem {
  id: string;
  title: string;
  body: string;
  category?: string;
  type?: string;
  status?: string;
  isResolved?: boolean;
  createdAt: string;
  responseCount: number;
  author: {
    id: string;
    name?: string;
    headline?: string;
    primaryRole?: string;
    city?: string;
  };
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("All");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("Collaboration");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-open modal if ?action=new-question is in the URL
  useEffect(() => {
    if (searchParams.get("action") === "new-question") {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url =
        activeFilter === "All"
          ? "/api/v1/posts"
          : `/api/v1/posts?category=${encodeURIComponent(activeFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setPosts(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          body: newBody.trim(),
          category: newCategory,
          type: "question",
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to publish question");
      }

      const json = await res.json();
      if (json.data) {
        setPosts((prev) => [json.data, ...prev]);
      }
      setNewTitle("");
      setNewBody("");
      setIsModalOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create question");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <MemberShell>
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-light text-[#F5FAF6] tracking-tight">
              Community
            </h1>
            <p className="text-xs sm:text-sm text-[#ECF1EF]/60 mt-1 font-sans">
              Live questions, insights, and collaborative answers across Odisha’s founder network.
            </p>
          </div>

          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] bg-[#EEF1EA] text-[#03080B] font-semibold text-xs rounded-full hover:bg-white hover:shadow-[0_0_15px_rgba(136,222,204,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 text-[#03080B]" />
            <span>Ask a question</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2.5 pt-1 scrollbar-none touch-pan-x -mx-1 px-1">
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={cn(
                "px-4 py-2 min-h-[38px] rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                activeFilter === chip
                  ? "bg-[#EEF1EA] text-[#03080B] font-semibold shadow-xs"
                  : "bg-white/[0.04] text-[#ECF1EF]/70 border border-white/10 hover:border-[#88DECC]/40 hover:text-[#F5FAF6]"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#ECF1EF]/60 space-y-4 select-none">
            <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
              <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
            </div>
            <span className="font-mono text-xs">Loading community threads...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-10 sm:p-14 text-center text-xs text-[#ECF1EF]/50 join-glass-panel border border-white/10 rounded-2xl sm:rounded-3xl border-dashed">
            No discussions found in this sector. Start the first conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="join-glass-panel rounded-2xl sm:rounded-3xl border border-white/10 hover:border-white/20 p-5 sm:p-6 text-[#F5FAF6] shadow-[0_12px_36px_rgba(0,0,0,0.45)] relative overflow-hidden transition-all duration-200"
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/25 to-transparent" />
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#ECF1EF]/60">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-semibold text-[#F5FAF6]">
                        {post.author?.name || "Community Member"}
                      </span>
                      {post.author?.primaryRole && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30 uppercase">
                          {post.author.primaryRole === "mentor"
                            ? "Mentor"
                            : post.author.primaryRole === "aspiring_entrepreneur"
                            ? "Aspiring"
                            : "Founder"}
                        </span>
                      )}
                      <span>•</span>
                      <span className="text-[#88DECC]">{post.category || "General"}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    {post.isResolved && (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved
                      </div>
                    )}
                  </div>

                  <Link href={`/community/${post.id}`} className="group">
                    <h2 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6] group-hover:text-[#88DECC] transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-[#ECF1EF]/70 line-clamp-2 leading-relaxed font-sans">
                    {post.body}
                  </p>

                  <div className="pt-3 mt-1 border-t border-white/10 flex items-center justify-between text-xs text-[#ECF1EF]/60">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#88DECC]" />
                      {post.responseCount || 0} replies
                    </span>
                    <Link
                      href={`/community/${post.id}`}
                      className="text-xs font-semibold text-[#88DECC] hover:underline flex items-center gap-1"
                    >
                      View discussion
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Ask a Community Question Modal ───────────────────────────────── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-lg max-h-[92dvh] overflow-y-auto join-glass-panel border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-5 text-[#F5FAF6] my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Specular Top Hairline */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-display text-xl font-light text-[#F5FAF6] tracking-tight">
                    Ask a Community Question
                  </h3>
                  <p className="text-xs text-[#ECF1EF]/60 font-sans">
                    Tap into the collective intelligence of verified founders and mentors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/10 text-[#ECF1EF]/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/25">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                    Question Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., What are the STPI registration requirements in Bhubaneswar?"
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full appearance-none px-4 py-3 pr-10 text-xs sm:text-sm rounded-2xl border border-white/10 bg-[#070D12] text-[#F5FAF6] focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all cursor-pointer font-sans"
                    >
                      <option value="Collaboration" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        Collaboration
                      </option>
                      <option value="Regulation" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        Regulation
                      </option>
                      <option value="Hardware" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        Hardware
                      </option>
                      <option value="Funding" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        Funding
                      </option>
                      <option value="Hiring" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        Hiring
                      </option>
                      <option value="DeepTech" className="bg-[#070D12] text-[#F5FAF6] py-2.5">
                        DeepTech
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#88DECC]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                    Details / Context
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Describe your context, background, and specific advice you are looking for..."
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-medium text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newTitle.trim() || !newBody.trim()}
                    className="px-6 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  >
                    {submitting ? "Publishing..." : "Post Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MemberShell>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg" />}>
      <CommunityContent />
    </Suspense>
  );
}
