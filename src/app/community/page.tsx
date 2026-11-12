"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { PostComposer } from "@/components/community/PostComposer";
import { PostCard } from "@/components/community/PostCard";
import { MemberAvatar } from "@/components/community/MemberAvatar";
import {
  AchievementItem,
  COMMUNITY_CATEGORIES,
  CommunityPost,
  CurrentMember,
  formatRelativeTime,
  formatRoleLabel,
} from "@/components/community/types";
import { Search, Trophy, X, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewTab = "feed" | "milestones";
type SortMode = "recent" | "top" | "unanswered";

function CommunityContent() {
  const [me, setMe] = useState<CurrentMember | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewTab, setViewTab] = useState<ViewTab>("feed");
  const [sortBy, setSortBy] = useState<SortMode>("recent");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Milestone modal
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [winTitle, setWinTitle] = useState("");
  const [winDescription, setWinDescription] = useState("");
  const [winFile, setWinFile] = useState<File | null>(null);
  const [submittingWin, setSubmittingWin] = useState(false);
  const [winError, setWinError] = useState<string | null>(null);
  const [winSuccess, setWinSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const loadInitialFeed = async () => {
      try {
        const [meRes, postsRes, achRes] = await Promise.all([
          fetch("/api/v1/auth/me"),
          fetch("/api/v1/posts?pageSize=50"),
          fetch("/api/v1/achievements/active"),
        ]);

        if (!active) return;

        if (meRes.ok) {
          const meJson = await meRes.json();
          const u = meJson?.data;
          if (u?.id) {
            setMe({
              id: u.id,
              name: u.name || u.profile?.name || u.email?.split("@")[0] || "Member",
              email: u.email,
              headline: u.headline || u.profile?.headline || null,
              city: u.city || u.profile?.city || null,
              primaryRole: u.primaryRole || u.role || null,
              profilePhotoUrl: u.profilePhotoUrl || u.profile?.profilePhotoUrl || null,
              avatarUrl: u.avatarUrl || null,
            });
          }
        }

        if (postsRes.ok) {
          const postsJson = await postsRes.json();
          setPosts(Array.isArray(postsJson?.data) ? postsJson.data : []);
        }

        if (achRes.ok) {
          const achJson = await achRes.json();
          setAchievements(Array.isArray(achJson?.data) ? achJson.data : []);
        }
      } catch {
        // keep existing UI state on transient error
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialFeed();

    return () => {
      active = false;
    };
  }, []);

  const handlePostCreated = (created: CommunityPost) => {
    setPosts((prev) => [created, ...prev]);
    setViewTab("feed");
    setActiveCategory("All");
    setSortBy("recent");
  };

  const handlePostUpdated = (
    postId: string,
    patch: Partial<CommunityPost>
  ) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p))
    );
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCreateWin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winTitle.trim() || !winDescription.trim()) return;

    try {
      setSubmittingWin(true);
      setWinError(null);

      const formData = new FormData();
      formData.append("title", winTitle.trim());
      formData.append("description", winDescription.trim());
      if (winFile) {
        formData.append("file", winFile);
      }

      const res = await fetch("/api/v1/achievements", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(
          errJson.error?.message || errJson.message || "Could not publish milestone"
        );
      }

      setWinSuccess(true);
      setWinTitle("");
      setWinDescription("");
      setWinFile(null);

      const achRes = await fetch("/api/v1/achievements/active");
      if (achRes.ok) {
        const achJson = await achRes.json();
        setAchievements(Array.isArray(achJson?.data) ? achJson.data : []);
      }

      setTimeout(() => {
        setWinModalOpen(false);
        setWinSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      setWinError(
        err instanceof Error ? err.message : "Failed to publish milestone"
      );
    } finally {
      setSubmittingWin(false);
    }
  };

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matched = posts.filter((post) => {
      if (activeCategory !== "All" && post.category !== activeCategory) {
        return false;
      }
      if (sortBy === "unanswered" && (post.responseCount || 0) > 0) {
        return false;
      }
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q) ||
        (post.author?.name || "").toLowerCase().includes(q) ||
        (post.category || "").toLowerCase().includes(q)
      );
    });

    if (sortBy === "top") {
      return [...matched].sort(
        (a, b) =>
          b.likeCount +
          b.responseCount * 2 -
          (a.likeCount + a.responseCount * 2)
      );
    }

    return [...matched].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts, activeCategory, sortBy, searchQuery]);

  const filterCategories = ["All", ...COMMUNITY_CATEGORIES];

  return (
    <MemberShell>
      <div className="max-w-5xl mx-auto py-4 sm:py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column */}
          <main className="lg:col-span-8 space-y-4">
            {/* Start a Post Card */}
            <PostComposer
              me={me}
              onPostCreated={handlePostCreated}
              onOpenMilestoneModal={() => {
                setWinError(null);
                setWinSuccess(false);
                setWinModalOpen(true);
              }}
            />

            {/* Simple Feed Controls */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-lg border border-[var(--border)] text-xs w-fit">
                  <button
                    type="button"
                    onClick={() => setViewTab("feed")}
                    className={cn(
                      "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer",
                      viewTab === "feed"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    Feed
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab("milestones")}
                    className={cn(
                      "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5",
                      viewTab === "milestones"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    <span>Milestones</span>
                    {achievements.length > 0 && (
                      <span className="text-[11px] text-[var(--muted)]">
                        {achievements.length}
                      </span>
                    )}
                  </button>
                </div>

                {viewTab === "feed" && (
                  <div className="flex items-center gap-2 flex-1 sm:justify-end">
                    <div className="relative flex-1 sm:max-w-[230px]">
                      <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortMode)}
                      aria-label="Sort posts"
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      <option value="recent">Recent</option>
                      <option value="top">Most active</option>
                      <option value="unanswered">Unanswered</option>
                    </select>
                  </div>
                )}
              </div>

              {viewTab === "feed" && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {filterCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer",
                        activeCategory === cat
                          ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]"
                          : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Feed Body */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[var(--surface-2)]" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-36 rounded bg-[var(--surface-2)]" />
                        <div className="h-2.5 w-48 rounded bg-[var(--surface-2)]" />
                      </div>
                    </div>
                    <div className="h-3 w-full rounded bg-[var(--surface-2)]" />
                    <div className="h-3 w-4/5 rounded bg-[var(--surface-2)]" />
                  </div>
                ))}
              </div>
            ) : viewTab === "milestones" ? (
              achievements.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center space-y-3">
                  <Trophy className="w-6 h-6 text-[var(--accent)] mx-auto" />
                  <p className="text-sm font-medium text-[var(--text)]">
                    No milestones shared yet
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Share a product launch, pilot, grant, or team milestone.
                  </p>
                  <button
                    type="button"
                    onClick={() => setWinModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold cursor-pointer"
                  >
                    Share a milestone
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievements.map((ach) => (
                    <article
                      key={ach.id}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 shadow-[var(--shadow-1)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <MemberAvatar
                            name={ach.author?.name}
                            src={ach.author?.avatarUrl}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--text)] truncate">
                              {ach.author?.name || "Community Member"}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">
                              {ach.author?.headline || "Member"} ·{" "}
                              {formatRelativeTime(ach.approvedAt || ach.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)] shrink-0">
                          <Trophy className="w-3 h-3" />
                          Milestone
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-semibold text-[var(--text)]">
                          {ach.title}
                        </h3>
                        <p className="text-sm text-[var(--text)] whitespace-pre-line leading-relaxed">
                          {ach.description}
                        </p>
                      </div>

                      {ach.mediaUrl && (
                        <div className="rounded-lg overflow-hidden border border-[var(--border)] max-h-80 bg-[var(--surface-2)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ach.mediaUrl}
                            alt={ach.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )
            ) : filteredPosts.length === 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center space-y-2">
                <p className="text-sm font-medium text-[var(--text)]">
                  {searchQuery
                    ? `No posts matching "${searchQuery}"`
                    : sortBy === "unanswered"
                    ? "No unanswered posts right now"
                    : "No posts yet"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Be the first to share an update or question with the community.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    me={me}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Quiet Right Rail */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4 sticky top-6">
            {me && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 shadow-[var(--shadow-1)]">
                <div className="flex items-center gap-3">
                  <MemberAvatar
                    name={me.name}
                    src={me.profilePhotoUrl || me.avatarUrl}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/people/${me.id}`}
                      className="text-sm font-semibold text-[var(--text)] hover:underline block truncate"
                    >
                      {me.name || "Member"}
                    </Link>
                    <p className="text-xs text-[var(--muted)] truncate">
                      {me.headline || formatRoleLabel(me.primaryRole)}
                    </p>
                    {me.city && (
                      <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{me.city}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3 shadow-[var(--shadow-1)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Recent milestones
                </h2>
                <button
                  type="button"
                  onClick={() => setViewTab("milestones")}
                  className="text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              {achievements.length === 0 ? (
                <p className="text-xs text-[var(--muted)]">
                  No milestones shared yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {achievements.slice(0, 3).map((ach) => (
                    <div
                      key={ach.id}
                      className="pb-2.5 border-b border-[var(--border)]/60 last:border-none last:pb-0 space-y-0.5"
                    >
                      <p className="text-xs font-medium text-[var(--text)] line-clamp-1">
                        {ach.title}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] truncate">
                        {ach.author?.name || "Member"} ·{" "}
                        {formatRelativeTime(ach.approvedAt || ach.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setWinError(null);
                  setWinSuccess(false);
                  setWinModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] text-xs font-medium text-[var(--text)] transition-colors cursor-pointer"
              >
                Share a milestone
              </button>
            </div>
          </aside>
        </div>

        {/* Share a Milestone Modal */}
        {winModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
            onClick={() => setWinModalOpen(false)}
          >
            <div
              className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-3)] space-y-4 text-[var(--text)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[var(--accent)]" />
                  <h3 className="text-base font-semibold">Share a milestone</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setWinModalOpen(false)}
                  aria-label="Close modal"
                  className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {winSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto" />
                  <p className="text-sm font-semibold">Milestone published</p>
                </div>
              ) : (
                <form onSubmit={handleCreateWin} className="space-y-4">
                  {winError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-[var(--danger)]">
                      {winError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--muted)]">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={winTitle}
                      onChange={(e) => setWinTitle(e.target.value)}
                      placeholder="e.g., Shipped v1 or signed first pilot customer"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--muted)]">
                      Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={winDescription}
                      onChange={(e) => setWinDescription(e.target.value)}
                      placeholder="What happened, and what did you learn along the way?"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-y"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[var(--muted)]">
                      Image (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setWinFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[var(--border)] file:text-xs file:font-medium file:bg-[var(--surface-2)] file:text-[var(--text)] cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setWinModalOpen(false)}
                      className="px-4 py-2 rounded-full text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submittingWin ||
                        !winTitle.trim() ||
                        !winDescription.trim()
                      }
                      className="px-5 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-40 cursor-pointer"
                    >
                      {submittingWin ? "Publishing..." : "Publish"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </MemberShell>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[var(--bg)] text-[var(--text)]" />}
    >
      <CommunityContent />
    </Suspense>
  );
}
