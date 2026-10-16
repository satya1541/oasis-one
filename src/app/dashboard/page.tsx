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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        const meRes = await fetch("/api/v1/auth/me");
        if (!meRes.ok) {
          if (meRes.status === 401) {
            router.push("/login");
            return;
          }
        }
        const meJson = await meRes.json();
        const currentUser: UserProfile = meJson.data;

        if (!isMounted) return;
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

        // Check unlock animation
        if (currentUser.showUnlockAnimation) {
          setIsUnlocking(true);
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

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleUnlockFinished = async () => {
    setIsUnlocking(false);
    setIsLocked(false);
    setHighlightGetStarted(true);
    try {
      await fetch("/api/v1/users/me/unlock-seen", { method: "POST" });
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
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--muted)] space-y-3">
          <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
          <p className="text-xs font-mono">Connecting to OASIS ONE Network...</p>
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
          onSimulateApproval={() => setIsUnlocking(true)}
        />
      ) : (
        <div className="space-y-8 pb-16">
          <div className="space-y-4">
            {/* Live Dismissible Announcement Bar */}
            {announcement && !announcementDismissed && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)] transition-all">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-gold)] shrink-0" />
                  <span>
                    <strong>{announcement.title}</strong> — {announcement.body}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncementDismissed(true)}
                  className="text-[var(--muted)] hover:text-[var(--text)] p-1 transition-colors cursor-pointer"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Time-of-day Greeting */}
            <div>
              <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
                Good day, {userName}
              </h1>
              <p className="text-xs text-[var(--muted)] mt-1">
                Odisha {userRole} Cohort • OASIS Connected Network
              </p>
            </div>

            {/* Live Hero Search Field */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-5 h-5 text-[var(--muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people, startups, questions and events..."
                className="w-full h-14 pl-12 pr-4 text-sm sm:text-base bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] shadow-[var(--shadow-1)] transition-all"
              />
            </form>

            {/* Live Achievement Card */}
            {achievement && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--surface-2)] to-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-fill)] text-[var(--brand-navy)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-[var(--text)]">
                    <strong className="font-semibold">{achievement.author?.name || "Community Member"}</strong>: {achievement.title}. {achievement.description}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--muted)] whitespace-nowrap bg-[var(--surface)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                  Active Showcase
                </span>
              </div>
            )}
          </div>

          {/* ── Block 2: "Next Up" (Upcoming Events & My Tasks) ─────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Upcoming Events */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                  <CardTitle>Upcoming events</CardTitle>
                </div>
                <Link
                  href="/events"
                  className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  See all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3.5">
                {events.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] py-4 text-center">
                    No upcoming events scheduled right now. Check back soon.
                  </p>
                ) : (
                  events.map((evt) => {
                    const { month, day } = formatEventDate(evt.startAt);
                    return (
                      <div key={evt.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex flex-col items-center justify-center text-center font-display border border-[var(--border)] shrink-0">
                            <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">{month}</span>
                            <span className="text-xs font-bold text-[var(--text)]">{day}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-[var(--text)] text-sm">{evt.title}</h4>
                            <p className="text-[var(--muted)] text-[11px]">{evt.venueOrLink || "Odisha Startup Corridor"}</p>
                          </div>
                        </div>
                        {evt.isRegistered ? (
                          <Button size="sm" variant="secondary" disabled>
                            Registered
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={registeringEventId === evt.id}
                            onClick={() => handleRegisterEvent(evt.id)}
                          >
                            {registeringEventId === evt.id ? "Registering..." : "Register"}
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Live Tasks */}
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[var(--brand-navy)]" />
                  <CardTitle>My tasks</CardTitle>
                </div>
                <span className="text-xs font-medium text-[var(--muted)]">
                  {tasks.filter((t) => t.status === "completed").length} of {tasks.length} done
                </span>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] py-4 text-center">
                    No active tasks. Add your first goal or milestone below.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0",
                          task.status === "completed"
                            ? "bg-[var(--success)] border-[var(--success)] text-white"
                            : "border-[var(--border-strong)] bg-white group-hover:border-[var(--accent)]"
                        )}
                      >
                        {task.status === "completed" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={cn(
                          "text-xs sm:text-sm text-[var(--text)] flex-1",
                          task.status === "completed" && "line-through text-[var(--muted)]"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 mt-2 border-t border-[var(--border)]">
                {showTaskInput ? (
                  <form onSubmit={handleCreateTask} className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newTaskInput}
                      onChange={(e) => setNewTaskInput(e.target.value)}
                      placeholder="Task or milestone title..."
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <Button size="sm" variant="primary" type="submit">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => setShowTaskInput(false)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[var(--muted)] hover:text-[var(--text)] w-full justify-start gap-2"
                    onClick={() => setShowTaskInput(true)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add task
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* ── Block 3: "For You" (Mentors | Questions Switch) ───── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-medium text-[var(--text)]">For you</h2>
                <div className="flex items-center rounded-xl bg-[var(--surface-2)] p-0.5 border border-[var(--border)] text-xs">
                  <button
                    type="button"
                    onClick={() => setForYouTab("mentors")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-medium transition-all cursor-pointer",
                      forYouTab === "mentors"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    Mentors
                  </button>
                  <button
                    type="button"
                    onClick={() => setForYouTab("questions")}
                    className={cn(
                      "px-3 py-1 rounded-lg font-medium transition-all cursor-pointer",
                      forYouTab === "questions"
                        ? "bg-[var(--surface)] text-[var(--text)] shadow-xs"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    Questions
                  </button>
                </div>
              </div>

              <Link
                href={forYouTab === "mentors" ? "/people?tab=mentors" : "/community"}
                className="text-xs font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                Browse all {forYouTab}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {forYouTab === "mentors" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {mentors.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] col-span-3 py-6 text-center">
                    No mentors currently available in this cohort.
                  </p>
                ) : (
                  mentors.map((m) => {
                    const initials = m.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <Card key={m.id} hoverEffect className="p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--surface-2)] text-[var(--accent)] font-display font-medium flex items-center justify-center border-2 border-[var(--brand-gold)]">
                              {initials}
                            </div>
                            <Badge variant="verified-mentor">Verified</Badge>
                          </div>
                          <h3 className="font-display text-base font-medium text-[var(--text)]">
                            {m.name}
                          </h3>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {m.city || "Odisha"} • {m.headline || "Ecosystem Mentor"}
                          </p>
                          <p className="text-xs text-[var(--text)] mt-3 leading-relaxed line-clamp-3">
                            {m.bio || "Active mentor advising founders across the Odisha startup network."}
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-[var(--border)]">
                          <Link
                            href={`/people/${m.id}`}
                            className="text-xs font-semibold text-[var(--accent)] hover:underline"
                          >
                            Request guidance →
                          </Link>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {questions.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] col-span-3 py-6 text-center">
                    No community discussions posted yet. Be the first to ask!
                  </p>
                ) : (
                  questions.map((q) => (
                    <Card key={q.id} hoverEffect className="p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{q.responseCount || 0} replies</span>
                          {q.isResolved && (
                            <>
                              <span>•</span>
                              <Badge variant="success">Resolved</Badge>
                            </>
                          )}
                        </div>
                        <h3 className="font-display text-base font-medium text-[var(--text)] leading-snug line-clamp-2">
                          {q.title}
                        </h3>
                        <p className="text-xs text-[var(--muted)] mt-2">
                          Asked by {q.author?.name || "Community Member"}
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[var(--border)]">
                        <Link
                          href={`/community/${q.id}`}
                          className="text-xs text-[var(--accent)] font-medium hover:underline"
                        >
                          Read replies →
                        </Link>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Block 4: "Get Started" Card (First visit completion steps) ───────── */}
          <Card
            className={cn(
              "bg-[var(--surface-2)]/80 border-[var(--border)] p-6 transition-all duration-700",
              highlightGetStarted && "ring-2 ring-[var(--brand-gold)] shadow-[var(--shadow-2)] bg-[var(--surface)]"
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-display text-lg font-medium text-[var(--text)]">
                  Getting started with OASIS ONE
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Complete these three steps to make the most of your membership.
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--surface)] px-2.5 py-1 rounded-full border border-[var(--border)]">
                Active Member
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div className="w-6 h-6 rounded-full bg-[var(--success)] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <Link href="/settings" className="font-medium text-[var(--text)] hover:text-[var(--accent)]">
                  Profile & Visibility
                </Link>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center shrink-0 font-mono text-[10px]">
                  2
                </div>
                <Link href="/events" className="font-medium text-[var(--text)] hover:text-[var(--accent)]">
                  Register for an event
                </Link>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs">
                <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center shrink-0 font-mono text-[10px]">
                  3
                </div>
                <Link href="/community" className="font-medium text-[var(--text)] hover:text-[var(--accent)]">
                  Ask a community question
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </MemberShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <DashboardContent />
    </Suspense>
  );
}
