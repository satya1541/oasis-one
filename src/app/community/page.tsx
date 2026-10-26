"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MemberShell } from "@/components/layout/MemberShell";
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  ArrowRight,
  X,
  RotateCw,
  ChevronDown,
  Sparkles,
  Search,
  Rocket,
  Check,
  Award,
  Upload,
  Heart,
  Share2,
  Flame,
  HelpCircle,
  Trophy,
  Lightbulb,
  MapPin,
  Tag,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  Send,
  MessageCircle,
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

type FeedTab = "trending" | "latest" | "unanswered" | "wins";

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: "Seeking MVP Feedback",
    category: "Collaboration",
    prompt: "Looking for founder feedback on our MVP: [Describe your product & target customer]",
  },
  {
    icon: Award,
    label: "Seed Grants & Funding",
    category: "Funding",
    prompt: "What are the most accessible angel networks / startup grants currently active in Odisha?",
  },
  {
    icon: ShieldCheck,
    label: "STPI / Odisha Policy",
    category: "Regulation",
    prompt: "Navigating STPI & Startup Odisha benefits: What was your exact timeline & documentation?",
  },
  {
    icon: Users,
    label: "Hiring Tech / Co-Founders",
    category: "Hiring",
    prompt: "Best practices for sourcing early engineering talent or co-founders from Odisha colleges?",
  },
  {
    icon: Zap,
    label: "Hardware Prototyping",
    category: "Hardware",
    prompt: "Which maker spaces or fabrication labs in Bhubaneswar / Rourkela do you recommend for rapid hardware prototyping?",
  },
];

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  Funding: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
  },
  DeepTech: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/25",
    dot: "bg-cyan-400",
  },
  Hardware: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
  },
  Regulation: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/25",
    dot: "bg-purple-400",
  },
  Collaboration: {
    bg: "bg-[#88DECC]/10",
    text: "text-[#88DECC]",
    border: "border-[#88DECC]/25",
    dot: "bg-[#88DECC]",
  },
  Hiring: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/25",
    dot: "bg-blue-400",
  },
};

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
    role?: string;
    city?: string;
    avatarUrl?: string;
  };
}

interface AchievementItem {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  approvedAt?: string;
  createdAt?: string;
  author: {
    id: string;
    name: string;
    headline?: string;
    avatarUrl?: string;
    role?: string;
  };
}

function CommunityContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FeedTab>("trending");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upvotes & Share UX states
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ask Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("Collaboration");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Share Win Modal
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [winTitle, setWinTitle] = useState("");
  const [winDescription, setWinDescription] = useState("");
  const [winFile, setWinFile] = useState<File | null>(null);
  const [submittingWin, setSubmittingWin] = useState(false);
  const [winError, setWinError] = useState<string | null>(null);
  const [winSuccess, setWinSuccess] = useState(false);

  // Sync saved upvotes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oasis_community_upvotes");
      if (saved) {
        setUserUpvotes(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  // Handle URL query actions
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new-question") {
      setIsModalOpen(true);
    } else if (action === "new-win") {
      setIsWinModalOpen(true);
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
        const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
        setPosts(list);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/v1/achievements/active");
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : json.data?.items || [];
        setAchievements(list);
      }
    } catch {}
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  useEffect(() => {
    fetchAchievements();
  }, []);

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
        throw new Error(
          errJson.error?.message || errJson.message || "Failed to publish question"
        );
      }

      const json = await res.json();
      if (json.data) {
        setPosts((prev) => [json.data, ...prev]);
      } else {
        await fetchPosts();
      }
      setNewTitle("");
      setNewBody("");
      setIsModalOpen(false);
      setActiveTab("latest");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create question");
    } finally {
      setSubmitting(false);
    }
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
          errJson.error?.message || errJson.message || "Failed to share achievement"
        );
      }

      setWinSuccess(true);
      fetchAchievements();
      setTimeout(() => {
        setWinSuccess(false);
        setIsWinModalOpen(false);
        setWinTitle("");
        setWinDescription("");
        setWinFile(null);
        setActiveTab("wins");
      }, 1000);
    } catch (err: any) {
      setWinError(err.message || "Failed to share achievement");
    } finally {
      setSubmittingWin(false);
    }
  };

  const handleToggleUpvote = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUserUpvotes((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      try {
        localStorage.setItem(
          "oasis_community_upvotes",
          JSON.stringify(Array.from(next))
        );
      } catch {}
      return next;
    });
  };

  const handleSharePost = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/community/${postId}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopiedId(postId);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch(() => {});
    }
  };

  const openPromptComposer = (category: string, promptText: string) => {
    setNewCategory(category);
    setNewTitle(promptText);
    setNewBody("");
    setIsModalOpen(true);
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Filtered & Sorted Posts
  const processedPosts = useMemo(() => {
    let list = [...posts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.body?.toLowerCase().includes(q) ||
          p.author?.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    // Tabs logic
    if (activeTab === "trending") {
      return list.sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0));
    }
    if (activeTab === "latest") {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (activeTab === "unanswered") {
      return list
        .filter((p) => !p.responseCount || p.responseCount === 0)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    return list;
  }, [posts, searchQuery, activeTab]);

  return (
    <MemberShell>
      <div className="space-y-6 max-w-6xl pb-20 mx-auto">
        {/* ── Community Hero & Live Pulse ─────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-[#071318] via-[#050D11] to-[#03080B] border border-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#88DECC]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/30 text-[#88DECC] text-[11px] font-mono uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#88DECC] animate-ping" />
                <span>Odisha Founder &amp; Mentor Collective</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-light text-[#F5FAF6] tracking-tight leading-tight">
                Solve Bottlenecks. <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F5FAF6] via-[#88DECC] to-[#88DECC]/80">Build Together.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#ECF1EF]/70 leading-relaxed font-sans">
                Real-time questions, candid feedback, and playbooks across Odisha&apos;s verified
                entrepreneurial network. Ask anything — no approval gates, instant visibility.
              </p>

              {/* Live Signal Badges */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#ECF1EF]/60">
                <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>140+ Active Founders</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span>~18m avg first response</span>
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Instant Publishing</span>
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-row md:flex-col sm:flex-row gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setNewCategory(activeFilter === "All" ? "Collaboration" : activeFilter);
                  setNewTitle("");
                  setNewBody("");
                  setIsModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3 min-h-[44px] bg-[#EEF1EA] text-[#03080B] font-semibold text-xs sm:text-sm rounded-2xl hover:bg-white hover:shadow-[0_0_25px_rgba(136,222,204,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#03080B]" />
                <span>Start a Discussion</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWinModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-3 min-h-[44px] bg-white/[0.05] border border-emerald-500/30 text-emerald-300 font-medium text-xs sm:text-sm rounded-2xl hover:bg-emerald-500/15 hover:border-emerald-400 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Share a Win</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Fast Discussion Starter Box ──────────────────────────────────── */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#070D12] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#88DECC]/30 to-white/10 border border-[#88DECC]/40 flex items-center justify-center text-[#88DECC] shrink-0 font-bold text-xs shadow-inner">
              <Sparkles className="w-4 h-4 text-[#88DECC]" />
            </div>

            <button
              type="button"
              onClick={() => {
                setNewCategory("Collaboration");
                setNewTitle("");
                setNewBody("");
                setIsModalOpen(true);
              }}
              className="flex-1 h-11 px-4 text-left rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#88DECC]/50 text-xs sm:text-sm text-[#ECF1EF]/50 hover:text-[#ECF1EF]/80 transition-all cursor-pointer flex items-center justify-between"
            >
              <span>What startup question or bottleneck are you solving today?</span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/15">
                Ask network ↵
              </span>
            </button>
          </div>

          {/* Quick Discussion Prompt Starters */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-[#ECF1EF]/40 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-[#88DECC]" />
              Quick Prompts:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openPromptComposer(qp.category, qp.prompt)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white/[0.03] hover:bg-white/[0.08] text-[#ECF1EF]/75 hover:text-[#F5FAF6] border border-white/8 hover:border-[#88DECC]/40 transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <Icon className="w-3 h-3 text-[#88DECC] group-hover:scale-110 transition-transform" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Layout: Feed (8 cols) + Sidebar (4 cols) on Desktop ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Feed & Controls (8 cols) ──────────────────────── */}
          <div className="lg:col-span-8 space-y-5">
            {/* Nav Tabs & Search */}
            <div className="space-y-3">
              {/* Tabs: Trending / Latest / Unanswered / Wins */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("trending")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                      activeTab === "trending"
                        ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/40 font-semibold shadow-xs"
                        : "text-[#ECF1EF]/60 hover:text-[#F5FAF6] hover:bg-white/[0.04]"
                    )}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Trending Discussions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("latest")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                      activeTab === "latest"
                        ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/40 font-semibold shadow-xs"
                        : "text-[#ECF1EF]/60 hover:text-[#F5FAF6] hover:bg-white/[0.04]"
                    )}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Latest Questions</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("unanswered")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap relative",
                      activeTab === "unanswered"
                        ? "bg-amber-400/15 text-amber-300 border border-amber-400/40 font-semibold shadow-xs"
                        : "text-[#ECF1EF]/60 hover:text-[#F5FAF6] hover:bg-white/[0.04]"
                    )}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Needs Answers</span>
                    {posts.filter((p) => !p.responseCount || p.responseCount === 0).length > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-black font-bold">
                        {posts.filter((p) => !p.responseCount || p.responseCount === 0).length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("wins")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                      activeTab === "wins"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-xs"
                        : "text-[#ECF1EF]/60 hover:text-[#F5FAF6] hover:bg-white/[0.04]"
                    )}
                  >
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Milestones &amp; Wins</span>
                    {achievements.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold">
                        {achievements.length}
                      </span>
                    )}
                  </button>
                </div>

                <span className="text-[10px] font-mono text-[#ECF1EF]/40 hidden sm:inline">
                  {activeTab === "wins"
                    ? `${achievements.length} wins`
                    : `${processedPosts.length} discussions`}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#ECF1EF]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, keyword, or founder (e.g. STPI, angel investment, cofounder)..."
                  className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#070D12] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-1 focus:ring-[#88DECC]/30 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#ECF1EF]/40 hover:text-[#F5FAF6] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Topic Category Chips (when on questions tabs) */}
              {activeTab !== "wins" && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {filterChips.map((chip) => {
                    const isSelected = activeFilter === chip;
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setActiveFilter(chip)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer select-none",
                          isSelected
                            ? "bg-[#EEF1EA] text-[#03080B] font-semibold shadow-xs"
                            : "bg-white/[0.04] text-[#ECF1EF]/70 border border-white/10 hover:border-[#88DECC]/40 hover:text-[#F5FAF6]"
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unanswered Banner Notice */}
            {activeTab === "unanswered" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200/90">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-amber-300">
                    Be the First to Answer &amp; Guide a Peer
                  </div>
                  <p className="text-[11px] text-amber-200/70">
                    These questions are waiting for their first response. Mentors and experienced founders who answer earn high community karma and visibility.
                  </p>
                </div>
              </div>
            )}

            {/* ── Feed Content ────────────────────────────────────────────── */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#ECF1EF]/60 space-y-4 select-none">
                <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
                  <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
                </div>
                <span className="font-mono text-xs">Loading live discussions...</span>
              </div>
            ) : activeTab === "wins" ? (
              /* Wins Stream */
              achievements.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#ECF1EF]/60 join-glass-panel border border-white/10 rounded-3xl border-dashed space-y-3">
                  <Rocket className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-sm font-medium text-[#F5FAF6]">
                    No milestones shared yet.
                  </p>
                  <p className="text-xs text-[#ECF1EF]/50">
                    Closed a round? Shipped a feature? Won a pilot? Celebrate with Odisha&apos;s founders!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsWinModalOpen(true)}
                    className="px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Share the First Win</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#071318]/90 border border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all duration-200 relative overflow-hidden space-y-3"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                            {ach.author?.name ? ach.author.name[0].toUpperCase() : "M"}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#F5FAF6]">
                              {ach.author?.name || "Community Member"}
                            </div>
                            <div className="text-[10px] text-[#ECF1EF]/50">
                              {ach.author?.headline || "Founder / Member"}
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <Rocket className="w-3 h-3" />
                          Milestone
                        </span>
                      </div>

                      <h2 className="font-display text-lg sm:text-xl font-medium text-[#F5FAF6] tracking-tight">
                        {ach.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-[#ECF1EF]/80 font-sans leading-relaxed whitespace-pre-line">
                        {ach.description}
                      </p>

                      {ach.mediaUrl && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 max-h-80 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ach.mediaUrl}
                            alt={ach.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#ECF1EF]/50">
                        <span className="font-mono text-[11px]">
                          {ach.approvedAt || ach.createdAt
                            ? formatTimeAgo(ach.approvedAt || ach.createdAt!)
                            : "Recently"}
                        </span>
                        <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                          🎉 Verified Milestone
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : processedPosts.length === 0 ? (
              /* Empty Discussions */
              <div className="p-10 sm:p-14 text-center text-xs text-[#ECF1EF]/60 join-glass-panel border border-white/10 rounded-3xl border-dashed space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#88DECC]">
                  <MessageSquare className="w-6 h-6 opacity-80" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F5FAF6]">
                    {searchQuery
                      ? `No discussions match "${searchQuery}"`
                      : activeTab === "unanswered"
                      ? "Awesome! All questions have answers."
                      : activeFilter === "All"
                      ? "No community discussions yet."
                      : `No discussions found in ${activeFilter}.`}
                  </p>
                  <p className="mt-1 text-xs text-[#ECF1EF]/50 max-w-sm mx-auto">
                    Be the trailblazer — ask your question or share insights with Odisha&apos;s verified
                    founder network.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewCategory(activeFilter === "All" ? "Collaboration" : activeFilter);
                    setNewTitle("");
                    setNewBody("");
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-[#EEF1EA] text-[#03080B] rounded-full text-xs font-semibold hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.3)] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a Discussion</span>
                </button>
              </div>
            ) : (
              /* Discussions List */
              <div className="space-y-4">
                {processedPosts.map((post) => {
                  const role = post.author?.primaryRole || post.author?.role || "founder";
                  const authorInitials = (post.author?.name || "M")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const catStyle =
                    CATEGORY_STYLES[post.category || ""] || CATEGORY_STYLES["Collaboration"];
                  const isUpvoted = userUpvotes.has(post.id);
                  const isCopied = copiedId === post.id;
                  const isUnanswered = !post.responseCount || post.responseCount === 0;

                  return (
                    <article
                      key={post.id}
                      className="group rounded-3xl bg-[#070D12]/90 hover:bg-[#070D12] border border-white/10 hover:border-[#88DECC]/30 p-5 sm:p-6 text-[#F5FAF6] shadow-[0_12px_36px_rgba(0,0,0,0.45)] relative overflow-hidden transition-all duration-200"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent group-hover:via-[#88DECC]/60 transition-all" />

                      <div className="space-y-3">
                        {/* Author Meta Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#88DECC]/20 to-white/10 text-[11px] font-bold flex items-center justify-center text-[#88DECC] border border-white/12 shrink-0">
                              {authorInitials}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#F5FAF6] hover:text-[#88DECC] transition-colors">
                                {post.author?.name || "Community Member"}
                              </span>

                              {/* Role Badge */}
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

                              {/* Locality if present */}
                              {post.author?.city && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#ECF1EF]/50 font-sans">
                                  <MapPin className="w-3 h-3 text-[#ECF1EF]/40" />
                                  {post.author.city}
                                </span>
                              )}
                            </div>

                            <span className="text-[#ECF1EF]/30 hidden sm:inline">•</span>

                            {/* Category Pill */}
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1",
                                catStyle.bg,
                                catStyle.text,
                                catStyle.border
                              )}
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full", catStyle.dot)} />
                              {post.category || "General"}
                            </span>

                            <span className="text-[#ECF1EF]/30 hidden sm:inline">•</span>

                            {/* Relative Time */}
                            <span className="text-[11px] font-mono text-[#ECF1EF]/50">
                              {formatTimeAgo(post.createdAt)}
                            </span>
                          </div>

                          {/* Status Flags */}
                          <div className="flex items-center gap-1.5">
                            {post.isResolved && (
                              <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Solved
                              </div>
                            )}

                            {isUnanswered && (
                              <span className="text-[10px] font-mono font-medium text-amber-300/80 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded-full">
                                Needs answer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <Link href={`/community/${post.id}`} className="block group/title">
                          <h2 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6] group-hover/title:text-[#88DECC] transition-colors leading-snug">
                            {post.title}
                          </h2>
                        </Link>

                        {/* Body Preview */}
                        <p className="text-xs sm:text-sm text-[#ECF1EF]/70 line-clamp-2 leading-relaxed font-sans">
                          {post.body}
                        </p>

                        {/* Action Bar */}
                        <div className="pt-3 border-t border-white/8 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Replies Pill / Link */}
                            <Link
                              href={`/community/${post.id}`}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer",
                                isUnanswered
                                  ? "bg-[#88DECC]/15 text-[#88DECC] hover:bg-[#88DECC]/25 border border-[#88DECC]/30 font-semibold"
                                  : "bg-white/[0.04] text-[#ECF1EF]/70 hover:text-white border border-white/8"
                              )}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#88DECC]" />
                              {isUnanswered ? (
                                <span>Be the first to reply ✨</span>
                              ) : (
                                <span>
                                  {post.responseCount}{" "}
                                  {post.responseCount === 1 ? "reply" : "replies"}
                                </span>
                              )}
                            </Link>

                            {/* Helpful Upvote Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleUpvote(post.id, e)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border",
                                isUpvoted
                                  ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                                  : "bg-white/[0.03] text-[#ECF1EF]/60 hover:text-[#F5FAF6] border-white/8 hover:bg-white/[0.06]"
                              )}
                              title="Mark as helpful / interesting"
                            >
                              <Heart
                                className={cn(
                                  "w-3.5 h-3.5",
                                  isUpvoted ? "fill-rose-400 text-rose-400" : ""
                                )}
                              />
                              <span className="font-mono text-[11px]">
                                {isUpvoted ? "Helpful (1)" : "Helpful"}
                              </span>
                            </button>

                            {/* Share Link */}
                            <button
                              type="button"
                              onClick={(e) => handleSharePost(post.id, e)}
                              className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#ECF1EF]/50 hover:text-[#F5FAF6] border border-white/8 transition-colors cursor-pointer"
                              title="Copy discussion link"
                            >
                              {isCopied ? (
                                <span className="flex items-center gap-1 text-[10px] text-[#88DECC] font-mono px-1">
                                  <Check className="w-3 h-3" /> Copied!
                                </span>
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Join CTA */}
                          <Link
                            href={`/community/${post.id}`}
                            className="font-semibold text-xs text-[#88DECC] hover:text-white flex items-center gap-1 group/link"
                          >
                            <span>Join Discussion</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right Column: Community Pulse Sidebar (4 cols) ─────────────── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Widget 1: Daily Founder Conversation Starter */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B171A] to-[#060D10] border border-[#88DECC]/25 space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-semibold text-[#88DECC]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#88DECC]" />
                  <span>Discussion of the Day</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Featured
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#F5FAF6] leading-snug">
                &ldquo;What was the single most cost-effective customer acquisition channel for your first 10 paying customers in Odisha?&rdquo;
              </p>

              <p className="text-[11px] text-[#ECF1EF]/60 font-sans">
                Founders who share transparent metrics help the entire Odisha ecosystem scale faster.
              </p>

              <button
                type="button"
                onClick={() =>
                  openPromptComposer(
                    "Collaboration",
                    "Customer Acquisition: Our first 10 customers came from [Channel] — here is what worked and what failed:"
                  )
                }
                className="w-full py-2.5 px-4 rounded-xl bg-[#88DECC]/20 hover:bg-[#88DECC]/30 text-[#88DECC] border border-[#88DECC]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chime In / Share Experience</span>
              </button>
            </div>

            {/* Widget 2: Recent Wins Ticker */}
            {achievements.length > 0 && (
              <div className="p-5 rounded-3xl bg-[#070D12] border border-emerald-500/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Trophy className="w-4 h-4" />
                    <span>Founder Milestones</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("wins")}
                    className="text-[11px] font-mono text-emerald-300 hover:underline cursor-pointer"
                  >
                    View all →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {achievements.slice(0, 3).map((ach) => (
                    <div
                      key={ach.id}
                      className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 space-y-1 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="text-xs font-semibold text-[#F5FAF6] line-clamp-1">
                        {ach.title}
                      </div>
                      <p className="text-[11px] text-[#ECF1EF]/65 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                      <div className="text-[10px] font-mono text-[#88DECC] pt-1">
                        by {ach.author?.name || "Member"}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsWinModalOpen(true)}
                  className="w-full py-2 text-center text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-all cursor-pointer border border-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Post Your Startup Milestone</span>
                </button>
              </div>
            )}

            {/* Widget 3: Community Code & Guidelines */}
            <div className="p-5 rounded-3xl bg-[#070D12] border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#F5FAF6]">
                <ShieldCheck className="w-4 h-4 text-[#88DECC]" />
                <span>The OASIS Community Code</span>
              </div>

              <ul className="space-y-2.5 text-[#ECF1EF]/70 text-[11px] font-sans leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#88DECC] font-bold">1.</span>
                  <span>
                    <strong>Zero Gatekeeping:</strong> Share real metrics, honest post-mortems, and actual regulatory steps.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#88DECC] font-bold">2.</span>
                  <span>
                    <strong>Pay It Forward:</strong> If you ask a question, try to answer at least one question for a peer.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#88DECC] font-bold">3.</span>
                  <span>
                    <strong>Constructive Mentorship:</strong> Senior founders and mentors provide actionable, empathetic advice.
                  </span>
                </li>
              </ul>
            </div>

            {/* Widget 4: Trending Tags in Odisha */}
            <div className="p-5 rounded-3xl bg-[#070D12] border border-white/10 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#F5FAF6]">
                <Tag className="w-4 h-4 text-[#88DECC]" />
                <span>Hot Ecosystem Topics</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "#SeedRound",
                  "#StartupOdishaGrant",
                  "#IITBhubaneswar",
                  "#STPITaxBenefits",
                  "#B2BSaaS",
                  "#AgriTechOdisha",
                  "#CoFounderHunt",
                  "#MVPValidation",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag.replace("#", ""));
                      setActiveTab("trending");
                    }}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/[0.03] hover:bg-[#88DECC]/15 text-[#ECF1EF]/60 hover:text-[#88DECC] border border-white/8 hover:border-[#88DECC]/30 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Ask a Community Question Modal ───────────────────────────────── */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-xl max-h-[92dvh] overflow-y-auto join-glass-panel border border-white/12 rounded-3xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-5 text-[#F5FAF6] my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/60 to-transparent" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#88DECC]" />
                    <h3 className="font-display text-xl font-light text-[#F5FAF6] tracking-tight">
                      Start a Community Discussion
                    </h3>
                  </div>
                  <p className="text-xs text-[#ECF1EF]/60 font-sans">
                    Live immediately across Odisha&apos;s founder network — no approval required.
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
                {/* Topic Category */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                    Topic Category
                  </label>
                  <div className="relative">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full appearance-none px-4 py-3 pr-10 text-xs sm:text-sm rounded-2xl border border-white/10 bg-[#070D12] text-[#F5FAF6] focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all cursor-pointer font-sans"
                    >
                      <option value="Collaboration" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        Collaboration &amp; Co-founders
                      </option>
                      <option value="Funding" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        Funding &amp; Angel Grants
                      </option>
                      <option value="Regulation" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        Regulation &amp; Odisha Policies
                      </option>
                      <option value="Hardware" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        Hardware &amp; Manufacturing
                      </option>
                      <option value="DeepTech" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        DeepTech &amp; AI
                      </option>
                      <option value="Hiring" className="bg-[#070D12] text-[#F5FAF6] py-2">
                        Hiring &amp; Team Growth
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#88DECC]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                    Question / Discussion Title
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

                {/* Body / Context */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2 flex items-center justify-between">
                    <span>Context &amp; Details</span>
                    <span className="text-[10px] text-[#88DECC] font-mono normal-case">
                      Markdown supported
                    </span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Explain your situation: What customer or tech problem are you solving? What have you tried so far? What specific advice do you need?"
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans resize-none"
                  />
                </div>

                {/* Pro-Tip Box */}
                <div className="p-3 rounded-2xl bg-[#88DECC]/10 border border-[#88DECC]/20 text-[11px] text-[#ECF1EF]/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#88DECC] shrink-0" />
                  <span>
                    <strong>Community Tip:</strong> Posts with specific milestones and clear questions get replies 3x faster from verified mentors.
                  </span>
                </div>

                {/* Footer Buttons */}
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
                    {submitting ? "Publishing Live..." : "Publish Discussion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Share an Achievement / Win Modal ───────────────────────────────── */}
        {isWinModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03080B]/85 backdrop-blur-xl animate-in fade-in duration-200 select-none overflow-y-auto"
            onClick={() => setIsWinModalOpen(false)}
          >
            <div
              className="w-full max-w-xl max-h-[92dvh] overflow-y-auto join-glass-panel border border-white/12 rounded-3xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-5 text-[#F5FAF6] my-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-display text-xl font-light text-[#F5FAF6] tracking-tight">
                      Share an Achievement
                    </h3>
                  </div>
                  <p className="text-xs text-[#ECF1EF]/60 font-sans">
                    Celebrate product milestones, funding, pilots, or team wins — goes live immediately!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWinModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/10 text-[#ECF1EF]/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {winSuccess ? (
                <div className="p-8 text-center space-y-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <p className="font-semibold text-sm text-[#F5FAF6]">
                    Achievement Published Live!
                  </p>
                  <p className="text-xs text-[#ECF1EF]/70">
                    Your win is now featured on the OASIS community feed.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateWin} className="space-y-4">
                  {winError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-300 text-xs border border-rose-500/25">
                      {winError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                      Achievement Title
                    </label>
                    <input
                      type="text"
                      required
                      value={winTitle}
                      onChange={(e) => setWinTitle(e.target.value)}
                      placeholder="e.g., Closed ₹50L seed round from Odisha Angel Network"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                      Details / Story
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={winDescription}
                      onChange={(e) => setWinDescription(e.target.value)}
                      placeholder="Share what this means for your startup, key challenges overcome, or credit to mentors..."
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-sans resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#ECF1EF]/70 mb-2">
                      Photo / Evidence (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setWinFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-[#ECF1EF]/70 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/[0.08] file:text-[#F5FAF6] hover:file:bg-white/[0.15] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsWinModalOpen(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-medium text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingWin || !winTitle.trim() || !winDescription.trim()}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      {submittingWin ? "Publishing..." : "Publish Win (Live Now)"}
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
    <Suspense fallback={<div className="min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg" />}>
      <CommunityContent />
    </Suspense>
  );
}
