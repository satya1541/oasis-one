"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MemberShell } from "@/components/layout/MemberShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LockedDashboardView } from "@/components/dashboard/LockedDashboardView";
import { UnlockMomentAnimation } from "@/components/dashboard/UnlockMomentAnimation";
import {
  Search,
  X,
  Sparkles,
  Calendar,
  CheckSquare,
  ArrowRight,
  ShieldCheck,
  Check,
  Plus,
  MessageSquare,
  Clock,
  RotateCw,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToAccountStatus } from "@/lib/socket";

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  primaryRole: string;
  accountStatus: string;
  adminLevel?: string | null;
  showUnlockAnimation?: boolean;
}

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
}

interface EventItem {
  id: string;
  title: string;
  startAt: string;
  endAt?: string;
  venueOrLink?: string;
  isRegistered?: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  dueAt?: string | null;
}

interface MentorItem {
  id: string;
  name: string;
  headline?: string;
  bio?: string;
  city?: string;
  state?: string;
  mentorVerified?: boolean;
}

interface QuestionItem {
  id: string;
  title: string;
  category?: string;
  responseCount: number;
  isResolved?: boolean;
  author?: {
    name?: string;
    headline?: string;
  };
}

interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  author?: {
    name?: string;
  };
  expiresAt?: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState("Member");
  const [userRole, setUserRole] = useState("Founders");
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [highlightGetStarted, setHighlightGetStarted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [announcement, setAnnouncement] = useState<AnnouncementItem | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [achievement, setAchievement] = useState<AchievementItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [forYouTab, setForYouTab] = useState<"mentors" | "questions">("mentors");
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);

  // Load live user session & data
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Session check
        const meRes = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          if (meRes.status === 401) {
            router.push("/login");
            return;
          }
        }
        const meJson = await meRes.json();
        const currentUser: UserProfile = meJson.data;

        if (!isMounted) return;

        // Strict segregation: Super Admins are restricted strictly to /admin console
        if (currentUser?.adminLevel) {
          router.replace("/admin");
          return;
        }

        setUser(currentUser);

        const displayName = currentUser.name || currentUser.email.split("@")[0] || "Member";
        setUserName(displayName.split(" ")[0]);
        const roleLabel =
          currentUser.primaryRole === "mentor"
            ? "Mentors"
            : currentUser.primaryRole === "aspiring_entrepreneur"
            ? "Aspiring Builders"
            : "Founders";
        setUserRole(roleLabel);

        // Check account locked status & restrictions
        if (
          currentUser.accountStatus === "suspended" ||
          currentUser.accountStatus === "revoked" ||
          currentUser.accountStatus === "blacklisted"
        ) {
          router.push("/suspended");
          return;
        }

        if (currentUser.accountStatus !== "active") {
          setIsLocked(true);
        } else {
          setIsLocked(false);
        }

        // Check unlock animation - ensure it plays ONLY ONCE per user
        const unlockSeenStorageKey = `oasis_unlock_seen_${currentUser.id || currentUser.email}`;
        const hasSeenUnlock =
          typeof window !== "undefined" &&
          (localStorage.getItem(unlockSeenStorageKey) === "true" ||
            sessionStorage.getItem(unlockSeenStorageKey) === "true");

        if (currentUser.showUnlockAnimation && !hasSeenUnlock) {
          // Immediately mark as seen so refreshes or fast reloads never trigger it again
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(unlockSeenStorageKey, "true");
              sessionStorage.setItem(unlockSeenStorageKey, "true");
              const bc = new BroadcastChannel("oasis_unlock_channel");
              bc.postMessage({ type: "UNLOCK_SEEN", userId: currentUser.id });
              bc.close();
            } catch (_) {}
          }
          setIsUnlocking(true);
          // Persist to server immediately so DB is updated
          fetch("/api/v1/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
          fetch("/api/v1/users/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
        } else if (currentUser.showUnlockAnimation && hasSeenUnlock) {
          // Silently clear lingering backend flag without showing modal
          fetch("/api/v1/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
          fetch("/api/v1/users/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
        }

        // 2. Fetch Active Announcement
        try {
          const annRes = await fetch("/api/v1/announcements/active");
          if (annRes.ok) {
            const annJson = await annRes.json();
            const list = annJson.data || [];
            if (list.length > 0) {
              setAnnouncement(list[0]);
            }
          }
        } catch (e) {
          console.error("Failed to load announcements:", e);
        }

        // 3. Fetch Active Achievement
        try {
          const achRes = await fetch("/api/v1/achievements/active");
          if (achRes.ok) {
            const achJson = await achRes.json();
            const list = achJson.data || [];
            if (list.length > 0) {
              setAchievement(list[0]);
            }
          }
        } catch (e) {
          console.error("Failed to load achievements:", e);
        }

        // 4. Fetch Upcoming Events (limit 3)
        try {
          const evRes = await fetch("/api/v1/events?limit=3");
          if (evRes.ok) {
            const evJson = await evRes.json();
            setEvents(evJson.data || []);
          }
        } catch (e) {
          console.error("Failed to load events:", e);
        }

        // 5. Fetch Tasks
        try {
          const taskRes = await fetch("/api/v1/tasks");
          if (taskRes.ok) {
            const taskJson = await taskRes.json();
            setTasks(taskJson.data || []);
          }
        } catch (e) {
          console.error("Failed to load tasks:", e);
        }

        // 6. Fetch Mentors (limit 3)
        try {
          const menRes = await fetch("/api/v1/mentors?limit=3");
          if (menRes.ok) {
            const menJson = await menRes.json();
            setMentors(menJson.data || []);
          }
        } catch (e) {
          console.error("Failed to load mentors:", e);
        }

        // 7. Fetch Community Questions (limit 3)
        try {
          const postRes = await fetch("/api/v1/posts?type=question&limit=3");
          if (postRes.ok) {
            const postJson = await postRes.json();
            setQuestions(postJson.data || []);
          }
        } catch (e) {
          console.error("Failed to load questions:", e);
        }
      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    // BroadcastChannel listener to sync across tabs
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("oasis_unlock_channel");
      bc.onmessage = (event) => {
        if (event.data?.type === "UNLOCK_SEEN") {
          setIsUnlocking(false);
        }
      };
    } catch (_) {}

    // WebSocket approval listener
    const handleApproval = (payload?: any) => {
      console.log("[Dashboard] Realtime approval received via WebSocket:", payload);
      setIsLocked(false);
      const targetUserId = payload?.userId || payload?.id;
      const seenKey = targetUserId ? `oasis_unlock_seen_${targetUserId}` : null;
      const alreadySeen =
        typeof window !== "undefined" &&
        ((seenKey && localStorage.getItem(seenKey) === "true") ||
          sessionStorage.getItem("oasis_unlock_seen_global") === "true");

      if (!alreadySeen) {
        if (typeof window !== "undefined" && seenKey) {
          localStorage.setItem(seenKey, "true");
          sessionStorage.setItem(seenKey, "true");
        }
        setIsUnlocking(true);
        fetch("/api/v1/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
        fetch("/api/v1/users/me/unlock-seen", { method: "POST", credentials: "include" }).catch(() => {});
      }
      loadDashboardData();
    };

    const unsubscribe = subscribeToAccountStatus((payload) => {
      if (payload?.accountStatus === "active") {
        handleApproval(payload);
      } else if (payload?.accountStatus && payload.accountStatus !== "active") {
        setIsLocked(true);
      }
    });

    const windowHandler = (e: any) => handleApproval(e.detail);
    window.addEventListener("oasis:account_unlocked", windowHandler);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener("oasis:account_unlocked", windowHandler);
      if (bc) bc.close();
    };
  }, [router]);

  const handleUnlockFinished = async () => {
    setIsUnlocking(false);
    setIsLocked(false);
    setHighlightGetStarted(true);
    if (typeof window !== "undefined") {
      const storageKey = user?.id ? `oasis_unlock_seen_${user.id}` : "oasis_unlock_seen";
      localStorage.setItem(storageKey, "true");
      sessionStorage.setItem(storageKey, "true");
      sessionStorage.setItem("oasis_unlock_seen_global", "true");
    }
    try {
      await Promise.any([
        fetch("/api/v1/me/unlock-seen", { method: "POST", credentials: "include" }),
        fetch("/api/v1/users/me/unlock-seen", { method: "POST", credentials: "include" }),
        fetch("/api/v1/users/unlock-seen", { method: "POST", credentials: "include" }),
      ]);
    } catch (e) {
      console.error("Error setting unlock-seen:", e);
    }
    setTimeout(() => setHighlightGetStarted(false), 5000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      setRegisteringEventId(eventId);
      const res = await fetch(`/api/v1/events/${eventId}/register`, {
        method: "POST",
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, isRegistered: true } : ev))
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setRegisteringEventId(null);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "open" : "completed";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskInput.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTasks((prev) => [json.data, ...prev]);
        }
        setNewTaskInput("");
        setShowTaskInput(false);
      }
    } catch (err) {
      console.error("Task creation error:", err);
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: "OCT", day: 20 };
    }
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-[#ECF1EF]/60 space-y-4 select-none">
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <p className="text-xs font-mono text-[#ECF1EF]/60">Connecting to OASIS ONE Network...</p>
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell>
      {isUnlocking && (
        <UnlockMomentAnimation
          userName={userName}
          onComplete={handleUnlockFinished}
        />
      )}

      {isLocked ? (
        <LockedDashboardView
          userName={userName}
          onSimulateApproval={() => {
            const unlockKey = user?.id ? `oasis_unlock_seen_${user.id}` : "oasis_unlock_seen";
            const alreadySeen =
              typeof window !== "undefined" &&
              (localStorage.getItem(unlockKey) === "true" ||
                sessionStorage.getItem(unlockKey) === "true");
            if (!alreadySeen) {
              setIsUnlocking(true);
            } else {
              setIsLocked(false);
            }
          }}
        />
      ) : (
        <div className="space-y-9 pb-16">
          <div className="space-y-5">
            {/* Live Dismissible Announcement Bar */}
            {announcement && !announcementDismissed && (
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl join-glass-panel border border-[#88DECC]/30 text-xs text-[#F5FAF6] transition-all shadow-md">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#88DECC] shrink-0 shadow-[0_0_8px_rgba(136,222,204,0.8)] animate-pulse" />
                  <span>
                    <strong className="font-semibold text-[#F5FAF6]">{announcement.title}</strong> — <span className="text-[#ECF1EF]/80">{announcement.body}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncementDismissed(true)}
                  className="text-[#ECF1EF]/60 hover:text-white p-1 transition-colors cursor-pointer rounded-lg hover:bg-white/10"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Time-of-day Cinematic Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-light text-[#F5FAF6] tracking-tight">
                  Good day, <span className="font-normal text-white">{userName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#ECF1EF]/60 mt-1 font-sans">
                  Odisha {userRole} Cohort • Connected &amp; Verified
                </p>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 text-xs font-mono text-[#88DECC] bg-[#88DECC]/10 px-3.5 py-1.5 rounded-full border border-[#88DECC]/25 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
                <span>650+ Active Members</span>
              </div>
            </div>

            {/* Live Hero Search Field with Specular Focus Halo */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-5 h-5 text-[#ECF1EF]/40 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mentors, fellow founders, questions and events..."
                className="w-full h-13 pl-12 pr-4 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-200"
              />
            </form>

            {/* Live Achievement Card */}
            {achievement && (
              <div className="p-4 sm:p-4.5 rounded-2xl join-glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#122B2A] text-[#88DECC] border border-[#88DECC]/30 flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-[#ECF1EF]/90 leading-relaxed">
                    <strong className="font-semibold text-sm text-[#F5FAF6]">
                      {achievement.author?.name || "Community Member"}
                    </strong>
                    : {achievement.title}. {achievement.description}
                  </p>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-mono uppercase tracking-wider text-[#88DECC] whitespace-nowrap bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 font-semibold">
                  Ecosystem Showcase
                </span>
              </div>
            )}
          </div>

          {/* ── Block 2: "Next Up" (Upcoming Events & My Tasks) ─────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Upcoming Events */}
            <div className="join-glass-panel rounded-2xl sm:rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(0,0,0,0.45)] relative overflow-hidden text-[#F5FAF6]">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4.5 h-4.5 text-[#88DECC]" />
                    <h3 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6]">Upcoming Events</h3>
                  </div>
                  <Link
                    href="/events"
                    className="text-xs font-semibold text-[#88DECC] hover:underline flex items-center gap-1 group"
                  >
                    See all
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {events.length === 0 ? (
                    <p className="text-xs text-[#ECF1EF]/50 py-6 text-center">
                      No upcoming events scheduled right now. Check back soon.
                    </p>
                  ) : (
                    events.map((evt) => {
                      const { month, day } = formatEventDate(evt.startAt);
                      return (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex flex-col items-center justify-center text-center font-display border border-white/10 shrink-0 shadow-xs">
                              <span className="text-[10px] text-[#88DECC] uppercase font-mono font-semibold">
                                {month}
                              </span>
                              <span className="text-sm font-bold text-[#F5FAF6] leading-none">
                                {day}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-[#F5FAF6] text-sm truncate">
                                {evt.title}
                              </h4>
                              <p className="text-[#ECF1EF]/60 text-[11px] truncate">
                                {evt.venueOrLink || "Odisha Startup Corridor"}
                              </p>
                            </div>
                          </div>
                          {evt.isRegistered ? (
                            <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#88DECC] text-xs font-mono font-medium shrink-0">
                              Registered
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={registeringEventId === evt.id}
                              onClick={() => handleRegisterEvent(evt.id)}
                              className="px-4 py-1.5 rounded-full bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_15px_rgba(136,222,204,0.35)] transition-all cursor-pointer shrink-0 disabled:opacity-50"
                            >
                              {registeringEventId === evt.id ? "Registering..." : "Register"}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Live Tasks */}
            <div className="join-glass-panel rounded-2xl sm:rounded-3xl border border-white/10 p-6 flex flex-col justify-between shadow-[0_12px_36px_rgba(0,0,0,0.45)] relative overflow-hidden text-[#F5FAF6]">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4.5 h-4.5 text-[#88DECC]" />
                    <h3 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6]">My Tasks</h3>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#ECF1EF]/60">
                    {tasks.filter((t) => t.status === "completed").length} of {tasks.length} done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-[#ECF1EF]/50 py-6 text-center">
                      No active milestones. Add your first goal below.
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                      >
                        <div
                          className={cn(
                            "w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0",
                            task.status === "completed"
                              ? "bg-[#88DECC] border-[#88DECC] text-[#03080B]"
                              : "border-white/20 bg-white/[0.04] group-hover:border-[#88DECC]"
                          )}
                        >
                          {task.status === "completed" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={cn(
                            "text-xs sm:text-sm text-[#F5FAF6] flex-1",
                            task.status === "completed" && "line-through text-[#ECF1EF]/40"
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10">
                {showTaskInput ? (
                  <form onSubmit={handleCreateTask} className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Task or milestone title..."
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 focus:outline-none focus:ring-1 focus:ring-[#88DECC]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white transition-all cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTaskInput(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#ECF1EF]/60 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-[#88DECC] hover:text-white flex items-center gap-1.5 font-medium transition-colors cursor-pointer py-1"
                    onClick={() => setShowTaskInput(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add task</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Block 3: "For You" (Mentors | Questions Switch) ───── */}
          <div className="space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg sm:text-xl font-medium text-[#F5FAF6]">For you</h2>
                <div className="flex items-center rounded-xl bg-white/[0.04] p-1 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setForYouTab("mentors")}
                    className={cn(
                      "px-3.5 py-1.5 min-h-[34px] rounded-lg font-medium transition-all duration-150 cursor-pointer",
                      forYouTab === "mentors"
                        ? "bg-[#EEF1EA] text-[#03080B] shadow-xs font-semibold"
                        : "text-[#ECF1EF]/60 hover:text-white"
                    )}
                  >
                    Mentors
                  </button>
                  <button
                    type="button"
                    onClick={() => setForYouTab("questions")}
                    className={cn(
                      "px-3.5 py-1.5 min-h-[34px] rounded-lg font-medium transition-all duration-150 cursor-pointer",
                      forYouTab === "questions"
                        ? "bg-[#EEF1EA] text-[#03080B] shadow-xs font-semibold"
                        : "text-[#ECF1EF]/60 hover:text-white"
                    )}
                  >
                    Questions
                  </button>
                </div>
              </div>

              <Link
                href={forYouTab === "mentors" ? "/people?tab=mentors" : "/community"}
                className="text-xs font-semibold text-[#88DECC] hover:underline flex items-center gap-1 group self-start xs:self-auto"
              >
                Browse all {forYouTab}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {forYouTab === "mentors" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {mentors.length === 0 ? (
                  <div className="col-span-full py-10 text-center join-glass-panel rounded-2xl border border-white/10 text-xs text-[#ECF1EF]/50">
                    No mentors currently available in this cohort.
                  </div>
                ) : (
                  mentors.map((m) => {
                    const initials = m.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <div key={m.id} className="join-glass-panel rounded-2xl border border-white/10 hover:border-white/20 p-5 flex flex-col justify-between text-[#F5FAF6] relative overflow-hidden transition-all duration-200">
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/25 to-transparent" />
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-full bg-[#122B2A] text-[#88DECC] font-display font-semibold flex items-center justify-center border border-[#88DECC]/40 shadow-xs">
                              {initials}
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/30 uppercase">
                              Verified Mentor
                            </span>
                          </div>
                          <h3 className="font-display text-base font-semibold text-[#F5FAF6]">
                            {m.name}
                          </h3>
                          <p className="text-xs text-[#ECF1EF]/60 mt-0.5 font-medium">
                            {m.city || "Odisha"} • {m.headline || "Ecosystem Mentor"}
                          </p>
                          <p className="text-xs text-[#ECF1EF]/75 mt-3.5 leading-relaxed line-clamp-3">
                            {m.bio || "Active mentor advising founders across the Odisha startup network."}
                          </p>
                        </div>
                        <div className="pt-4 mt-5 border-t border-white/10">
                          <Link
                            href={`/people/${m.id}`}
                            className="text-xs font-semibold text-[#88DECC] hover:underline inline-flex items-center gap-1"
                          >
                            Request guidance
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {questions.length === 0 ? (
                  <div className="col-span-full py-10 text-center join-glass-panel rounded-2xl border border-white/10 text-xs text-[#ECF1EF]/50">
                    No community discussions posted yet. Be the first to ask!
                  </div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="join-glass-panel rounded-2xl border border-white/10 hover:border-white/20 p-5 flex flex-col justify-between text-[#F5FAF6] relative overflow-hidden transition-all duration-200">
                      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/25 to-transparent" />
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#ECF1EF]/60 mb-3 font-mono">
                          <MessageSquare className="w-3.5 h-3.5 text-[#88DECC]" />
                          <span>{q.responseCount || 0} replies</span>
                          {q.isResolved && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold">Resolved</span>
                            </>
                          )}
                        </div>
                        <h3 className="font-display text-base font-semibold text-[#F5FAF6] leading-snug line-clamp-2">
                          {q.title}
                        </h3>
                        <p className="text-xs text-[#ECF1EF]/60 mt-2.5">
                          Asked by {q.author?.name || "Community Member"}
                        </p>
                      </div>
                      <div className="pt-3.5 mt-4 border-t border-white/10">
                        <Link
                          href={`/community/${q.id}`}
                          className="text-xs text-[#88DECC] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Read replies
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Block 4: "Get Started" Card ─────────── */}
          <div
            className={cn(
              "join-glass-panel rounded-2xl sm:rounded-3xl border border-white/10 p-6 sm:p-7 relative overflow-hidden text-[#F5FAF6] shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-700",
              highlightGetStarted && "border-[#88DECC]/60 shadow-[0_0_30px_rgba(136,222,204,0.2)]"
            )}
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display text-lg font-medium text-[#F5FAF6]">
                  Getting Started with OASIS ONE
                </h3>
                <p className="text-xs text-[#ECF1EF]/60 mt-1">
                  Complete these three quick milestones to unlock maximum community value.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#88DECC] bg-white/[0.04] px-3 py-1 rounded-full border border-white/10">
                Active Member
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <Link href="/settings" className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs hover:border-[#88DECC]/40 hover:bg-white/[0.05] transition-all">
                <div className="w-7 h-7 rounded-full bg-[#88DECC] text-[#03080B] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="font-medium text-[#F5FAF6] hover:text-[#88DECC]">
                  Profile &amp; Visibility
                </span>
              </Link>

              <Link href="/events" className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs hover:border-[#88DECC]/40 hover:bg-white/[0.05] transition-all">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 text-[#88DECC] flex items-center justify-center shrink-0 font-mono text-[11px] font-semibold">
                  2
                </div>
                <span className="font-medium text-[#F5FAF6] hover:text-[#88DECC]">
                  Register for an Event
                </span>
              </Link>

              <Link href="/community" className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs hover:border-[#88DECC]/40 hover:bg-white/[0.05] transition-all">
                <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 text-[#88DECC] flex items-center justify-center shrink-0 font-mono text-[11px] font-semibold">
                  3
                </div>
                <span className="font-medium text-[#F5FAF6] hover:text-[#88DECC]">
                  Ask a Community Question
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </MemberShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg" />}>
      <DashboardContent />
    </Suspense>
  );
}
