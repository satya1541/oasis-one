"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MessageSquare, Plus, CheckCircle2, ArrowRight, X, RotateCw } from "lucide-react";
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

export default function CommunityPage() {
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = activeFilter === "All"
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
        const errJson = await res.json();
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
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Community
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Live questions, insights, and collaborative answers across Odisha’s founder network.
            </p>
          </div>

          <Button
            size="md"
            className="gap-2 shrink-0 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Ask a question
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs",
                activeFilter === chip
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold border border-[var(--brand-gold)]/40 shadow-xs"
                  : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--muted)] gap-3 text-xs">
            <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
            <span className="font-mono">Loading community threads...</span>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-14 text-center text-xs text-[var(--muted)] border-dashed card-luxury">
            No discussions found in this sector. Start the first conversation!
          </Card>
        ) : (
          <div className="space-y-4.5">
            {posts.map((post) => (
              <Card
                key={post.id}
                hoverEffect
                className="p-6 transition-all"
              >
                <div className="flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text)]">
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
                      <span>•</span>
                      <span>{post.category || "General"}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    {post.isResolved && (
                      <div className="flex items-center gap-1 text-[var(--success)] text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved
                      </div>
                    )}
                  </div>

                  <Link href={`/community/${post.id}`} className="group">
                    <h2 className="font-display text-lg font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {post.body}
                  </p>

                  <div className="pt-3 mt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {post.responseCount || 0} replies
                    </span>
                    <Link
                      href={`/community/${post.id}`}
                      className="text-[var(--accent)] font-semibold hover:underline flex items-center gap-1"
                    >
                      View discussion
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Post Dialog Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="font-display text-lg font-medium text-[var(--text)]">
                  Ask a Community Question
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 text-[var(--danger)] text-xs border border-rose-200">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
                    Question Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., What are the STPI registration requirements in Bhubaneswar?"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="Collaboration">Collaboration</option>
                    <option value="Regulation">Regulation</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Funding">Funding</option>
                    <option value="Hiring">Hiring</option>
                    <option value="DeepTech">DeepTech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--muted)] mb-1">
                    Details / Context
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Describe your context, background, and specific advice you are looking for..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || !newTitle.trim() || !newBody.trim()}
                  >
                    {submitting ? "Publishing..." : "Post Question"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
