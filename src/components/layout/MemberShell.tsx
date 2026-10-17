"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  Home,
  MessageSquare,
  Users,
  Calendar,
  CheckSquare,
  Search,
  Bell,
  Plus,
  Compass,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Menu,
  X,
  Rocket,
  Lock,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subscribeToAccountStatus } from "@/lib/socket";

interface MemberShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/community", label: "Community", icon: MessageSquare },
  { href: "/people", label: "People", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/planner", label: "Planner", icon: CheckSquare },
];

function DesktopNavLinks({ isLocked = false }: { isLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="p-3.5 space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        const itemLocked = isLocked && item.href !== "/dashboard";

        if (itemLocked) {
          return (
            <div
              key={item.href}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[var(--brand-cream)]/30 bg-white/[0.015] border border-transparent cursor-not-allowed select-none transition-all"
              title="Locked — Pending Admin Approval"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--brand-cream)]/25" />
                <span>{item.label}</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-[var(--brand-gold)]/50" />
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group relative",
              isActive
                ? "bg-white/[0.09] text-[var(--brand-cream)] font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border-l-2 border-[var(--brand-gold)]"
                : "text-[var(--brand-cream)]/70 hover:bg-white/[0.05] hover:text-[var(--brand-cream)]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isActive
                    ? "text-[var(--brand-gold)]"
                    : "text-[var(--brand-cream)]/45 group-hover:text-[var(--brand-cream)]"
                )}
              />
              <span>{item.label}</span>
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-gold)] shadow-[0_0_8px_rgba(243,211,162,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileBottomNavLinks({ isLocked = false }: { isLocked?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-3 left-4 right-4 z-50 bg-[#1E1F33]/92 text-[var(--brand-cream)] backdrop-blur-2xl border border-[var(--brand-gold)]/25 rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_16px_36px_-6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        const itemLocked = isLocked && item.href !== "/dashboard";

        if (itemLocked) {
          return (
            <div
              key={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium text-[var(--brand-cream)]/30 cursor-not-allowed select-none"
              title="Locked — Pending Admin Approval"
            >
              <div className="relative">
                <Icon className="w-5 h-5 opacity-35" />
                <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[var(--brand-gold)]/60" />
              </div>
              <span>{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl text-[10px] font-medium transition-all duration-200 relative",
              isActive
                ? "text-[var(--brand-gold)] font-semibold bg-white/10"
                : "text-[var(--brand-cream)]/65 hover:text-[var(--brand-cream)]"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MemberShell({ children }: MemberShellProps) {
  const pathname = usePathname();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [userName, setUserName] = useState("Member");
  const [userRole, setUserRole] = useState("Member");
  const [userInitials, setUserInitials] = useState("M");

  const [user, setUser] = useState<any>(null);
  // Default to locked until authenticated user is confirmed to have active status
  const isLocked = loadingAuth || !user || user.accountStatus !== "active";

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        setLoadingAuth(true);
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const u = json.data;
          if (isMounted && u) {
            // Strict segregation: Super Admins and moderators are restricted strictly to /admin
            if (u.adminLevel) {
              if (typeof window !== "undefined") {
                window.location.href = "/admin";
              }
              return;
            }

            setUser(u);
            const name = u.name || u.email?.split("@")[0] || "Member";
            setUserName(name);
            const parts = name.trim().split(" ");
            if (parts.length > 1) {
              setUserInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
            } else if (parts[0]) {
              setUserInitials(parts[0].slice(0, 2).toUpperCase());
            }
            const role =
              u.primaryRole === "mentor"
                ? "Mentor"
                : u.primaryRole === "aspiring_entrepreneur"
                ? "Aspiring"
                : "Founder";
            setUserRole(role);

            // If unapproved and trying to access any page other than /dashboard, bounce immediately
            if (u.accountStatus !== "active" && pathname && pathname !== "/dashboard") {
              if (typeof window !== "undefined") {
                window.location.replace("/dashboard");
              }
            }
          }
        } else if (res.status === 401) {
          // If unauthenticated in member shell, redirect to login
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/login") &&
            !window.location.pathname.startsWith("/join")
          ) {
            window.location.href = "/login";
          }
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      } finally {
        if (isMounted) setLoadingAuth(false);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Realtime WebSocket: Listen for instant account approval or status changes
  useEffect(() => {
    const handleStatusChanged = (payload: {
      accountStatus: string;
      applicationStatus?: string;
    }) => {
      console.log("[MemberShell] Realtime account.status_changed received via WebSocket:", payload);
      if (payload?.accountStatus) {
        setUser((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            accountStatus: payload.accountStatus,
          };
        });

        if (payload.accountStatus === "active") {
          window.dispatchEvent(
            new CustomEvent("oasis:account_unlocked", {
              detail: payload,
            })
          );
        }
      }
    };

    const unsubscribe = subscribeToAccountStatus(handleStatusChanged);

    // Also listen for cross-window / custom unlocked event
    const handleWindowUnlocked = (e: any) => {
      if (e.detail?.accountStatus === "active") {
        setUser((prev: any) => (prev ? { ...prev, accountStatus: "active" } : prev));
      }
    };
    window.addEventListener("oasis:account_unlocked", handleWindowUnlocked);

    return () => {
      unsubscribe();
      window.removeEventListener("oasis:account_unlocked", handleWindowUnlocked);
    };
  }, []);

  // Polling fallback every 10 seconds while locked to catch any approval event
  useEffect(() => {
    if (!isLocked) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const u = json.data;
          if (u?.accountStatus === "active") {
            setUser((prev: any) => ({ ...(prev || {}), ...u, accountStatus: "active" }));
            window.dispatchEvent(
              new CustomEvent("oasis:account_unlocked", {
                detail: { accountStatus: "active" },
              })
            );
          }
        }
      } catch (e) {
        // Silently ignore background polling errors
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLocked]);

  // Keyboard shortcut ⌘K / Ctrl+K (disabled when locked)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isLocked) {
          setCommandPaletteOpen((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked]);

  // While authenticating, show minimal loading splash — NEVER leak protected pages
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center space-y-3 select-none">
        <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <p className="text-xs font-mono text-[var(--muted)]">Verifying OASIS ONE credentials...</p>
      </div>
    );
  }

  // If unauthenticated, redirecting to login
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center space-y-3 select-none">
        <RotateCw className="w-6 h-6 animate-spin text-[var(--accent)]" />
        <p className="text-xs font-mono text-[var(--muted)]">Redirecting to sign in...</p>
      </div>
    );
  }

  // If user is locked and on any page other than /dashboard, display strict guard screen
  if (isLocked && pathname && pathname !== "/dashboard") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 space-y-4 shadow-[var(--shadow-2)] animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Application Under Review</span>
          </div>
          <h2 className="font-display text-xl font-medium text-[var(--text)]">
            Access Restricted
          </h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Your membership application is currently under review by the OASIS Admissions Committee. All member destinations are locked until an administrator approves your account.
          </p>
          <div className="pt-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-xs"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col lg:flex-row">
      {/* ── Left Sidebar (Desktop ≥1024px) ────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#181928] via-[#1E1F33] to-[#12131F] text-[var(--brand-cream)] flex-col justify-between shrink-0 border-r border-[var(--brand-gold)]/15 min-h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-40">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[var(--brand-gold)]/15">
            <BrandLockup variant="wordmark" href="/dashboard" />
          </div>

          {/* Five Core Destinations Navigation */}
          <Suspense fallback={<div className="p-3.5 space-y-1.5 h-48" />}>
            <DesktopNavLinks isLocked={isLocked} />
          </Suspense>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--brand-gold)]/15 space-y-3">
          {/* Verified Membership Node Badge */}
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-[var(--brand-gold)]/20 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-gold)] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[var(--brand-cream)] leading-tight">
                {isLocked ? "Pending Verification" : `Verified ${userRole}`}
              </span>
              <span className="text-[9px] font-mono text-[var(--brand-gold)]/80 tracking-wider uppercase">
                ODISHA NODE #042
              </span>
            </div>
          </div>

          {isLocked ? (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[var(--brand-cream)]/35 cursor-not-allowed select-none bg-white/[0.02]"
              title="Settings locked — Pending Admin Approval"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[var(--brand-cream)]/30" />
                <span>Settings & Privacy</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-[var(--brand-gold)]/50" />
            </div>
          ) : (
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[var(--brand-cream)]/70 hover:bg-white/5 hover:text-[var(--brand-cream)] transition-colors duration-200"
            >
              <Settings className="w-4 h-4 text-[var(--brand-cream)]/50" />
              <span>Settings & Privacy</span>
            </Link>
          )}
          <div className="px-3 text-[10px] text-[var(--brand-cream)]/40 font-mono tracking-wider">
            650+ VERIFIED MEMBERS
          </div>
        </div>
      </aside>

      {/* ── Main Work Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Apple-style Translucent Luxury Glass) */}
        <header className="sticky top-0 z-40 bg-[var(--surface)]/90 backdrop-blur-2xl border-b border-[var(--border)] px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(30,31,51,0.03)]">
          {/* Mobile Logo on left */}
          <div className="flex lg:hidden items-center gap-3">
            <BrandLockup variant="mark" href="/dashboard" />
            <span className="font-display font-medium tracking-wider text-sm uppercase text-[var(--brand-navy)]">
              OASIS ONE
            </span>
          </div>

          {/* Search Trigger (⌘K) */}
          <div className="hidden sm:flex items-center flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              readOnly
              disabled={isLocked}
              placeholder={
                isLocked
                  ? "Search locked — Pending Admin Approval"
                  : "Search people, questions and events (⌘K)"
              }
              onClick={() => {
                if (!isLocked) setCommandPaletteOpen(true);
              }}
              className={cn(
                "w-full h-10 pl-10 pr-14 text-xs sm:text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)]/60 transition-all duration-200",
                isLocked
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer focus:outline-none hover:border-[var(--accent)]/50 focus:border-[var(--accent)]"
              )}
            />
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-3.5 ml-auto">
            {/* "New" Dropdown - only available for approved members */}
            {!isLocked && (
              <div className="relative">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setNewMenuOpen(!newMenuOpen)}
                  className="gap-1.5 shadow-sm rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New</span>
                </Button>

                {newMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-2)] py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setNewMenuOpen(false)}
                  >
                    <Link
                      href="/community?action=new-question"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                      Ask a question
                    </Link>
                    <Link
                      href="/community?action=new-win"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-[var(--success)]" />
                      Share an achievement
                    </Link>
                    <Link
                      href="/planner?action=new-task"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                    >
                      <CheckSquare className="w-4 h-4 text-[var(--brand-navy)]" />
                      Add a task
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            {isLocked ? (
              <div
                className="p-2 rounded-xl text-[var(--muted)]/40 cursor-not-allowed select-none"
                title="Notifications locked — Pending Admin Approval"
              >
                <Bell className="w-4 h-4" />
              </div>
            ) : (
              <Link
                href="/notifications"
                className="relative p-2.5 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors duration-150"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
              </Link>
            )}

            {/* User Avatar with Persona & Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full border-2 border-[var(--brand-gold)]/50 hover:border-[var(--brand-gold)] transition-colors cursor-pointer shadow-xs"
                title={`${userName} (${userRole})`}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--brand-navy)] text-[var(--brand-cream)] text-xs font-semibold flex items-center justify-center font-display shadow-xs">
                  {userInitials}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-2)] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <div className="font-semibold text-sm text-[var(--text)]">{userName}</div>
                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-1">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isLocked ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                        )}
                      />
                      <span>Role: {userRole}</span>
                      {isLocked && <span className="text-amber-600 font-medium">(Locked)</span>}
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[var(--muted)]" />
                        Settings & Privacy
                      </Link>
                    </div>
                  )}

                  <div className="border-t border-[var(--border)] pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch("/api/v1/auth/logout", { method: "POST" });
                        } catch (e) {
                          console.error("Logout error:", e);
                        }
                        if (typeof window !== "undefined") {
                          sessionStorage.clear();
                          localStorage.clear();
                          window.location.href = "/login";
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-50 hover:text-[var(--danger)] text-[var(--muted)] text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Command Palette Modal (Only accessible when !isLocked) */}
        {commandPaletteOpen && !isLocked && (
          <div
            className="fixed inset-0 z-50 bg-[#1E1F33]/70 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-[560px] w-full shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Palette Input */}
              <div className="relative border-b border-[var(--border)] p-4 flex items-center gap-3">
                <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a destination, query, or member name..."
                  className="w-full bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(false)}
                  className="text-xs font-mono text-[var(--muted)] px-2 py-0.5 rounded bg-[var(--surface-2)]"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions List */}
              <div className="p-3 max-h-[380px] overflow-y-auto space-y-3 text-xs">
                {/* Destinations */}
                <div>
                  <span className="px-2 text-[10px] uppercase font-display tracking-wider text-[var(--muted)] font-semibold">
                    Destinations
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {[
                      { href: "/dashboard", name: "Home Dashboard" },
                      { href: "/community", name: "Community Questions & Q&A" },
                      { href: "/people", name: "People & Verified Mentors" },
                      { href: "/events", name: "Events & Offline Meetups" },
                      { href: "/planner", name: "Planner & Milestone Calendar" },
                      { href: "/settings", name: "Privacy & Account Settings" },
                    ]
                      .filter((d) =>
                        d.name.toLowerCase().includes(commandSearch.toLowerCase())
                      )
                      .map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          onClick={() => setCommandPaletteOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                        >
                          <span>{d.name}</span>
                          <span className="text-[10px] font-mono text-[var(--muted)]">{d.href}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Quick Results */}
                <div>
                  <span className="px-2 text-[10px] uppercase font-display tracking-wider text-[var(--muted)] font-semibold">
                    Quick Search Matches
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/search?q=agritech"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <span>Search for &ldquo;Agritech&rdquo; in Odisha</span>
                      <span className="text-[10px] text-[var(--accent)] font-medium">12 matches</span>
                    </Link>
                    <Link
                      href="/people"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <span>Browse Verified Mentors Directory</span>
                      <span className="text-[10px] text-[var(--muted)]">Directory</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1240px] w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar (<1024px) ────────────────────────────────────── */}
      <Suspense fallback={null}>
        <MobileBottomNavLinks isLocked={isLocked} />
      </Suspense>
    </div>
  );
}
