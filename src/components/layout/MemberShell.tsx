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
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#ECF1EF]/30 bg-white/[0.015] border border-transparent cursor-not-allowed select-none transition-all"
              title="Locked — Pending Admin Approval"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[#ECF1EF]/25" />
                <span>{item.label}</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-[#88DECC]/40" />
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
                ? "bg-white/[0.08] text-[#F5FAF6] font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border-l-2 border-[#88DECC]"
                : "text-[#ECF1EF]/70 hover:bg-white/[0.04] hover:text-[#F5FAF6]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors duration-200",
                  isActive
                    ? "text-[#88DECC]"
                    : "text-[#ECF1EF]/45 group-hover:text-[#F5FAF6]"
                )}
              />
              <span>{item.label}</span>
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] shadow-[0_0_8px_rgba(136,222,204,0.8)]" />
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
    <nav className="lg:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-50 bg-[#070D12]/95 text-[#F5FAF6] backdrop-blur-2xl border border-white/10 rounded-2xl px-1.5 py-1.5 flex items-center justify-around shadow-[0_16px_36px_-6px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]">
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
              className="flex flex-col items-center justify-center gap-1 min-h-[46px] min-w-[48px] py-1 px-2.5 text-[10px] font-medium text-[#ECF1EF]/30 cursor-not-allowed select-none"
              title="Locked — Pending Admin Approval"
            >
              <div className="relative">
                <Icon className="w-5 h-5 opacity-35" />
                <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-[#88DECC]/50" />
              </div>
              <span className="leading-none text-[9px] sm:text-[10px]">{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-h-[46px] min-w-[48px] py-1 px-2.5 rounded-xl text-[10px] font-medium transition-all duration-200 relative select-none",
              isActive
                ? "text-[#88DECC] font-semibold bg-white/10 shadow-inner"
                : "text-[#ECF1EF]/65 hover:text-white active:bg-white/5"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="leading-none text-[9px] sm:text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Module-level session cache to ensure instant, flicker-free page transitions
let globalSessionUser: any = null;

function getCachedSession() {
  if (globalSessionUser) return globalSessionUser;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("oasis_member_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && parsed.id) {
          globalSessionUser = parsed;
          return parsed;
        }
      }
    } catch (_) {}
  }
  return null;
}

function setCachedSession(u: any) {
  globalSessionUser = u;
  if (typeof window !== "undefined") {
    try {
      if (u) {
        sessionStorage.setItem("oasis_member_session", JSON.stringify(u));
      } else {
        sessionStorage.removeItem("oasis_member_session");
      }
    } catch (_) {}
  }
}

export function MemberShell({ children }: MemberShellProps) {
  const pathname = usePathname();
  const cached = getCachedSession();

  const [user, setUser] = useState<any>(cached);
  // If we already have a cached session, do NOT block the screen with a loading splash
  const [loadingAuth, setLoadingAuth] = useState(!cached);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");

  const [userName, setUserName] = useState(() => {
    if (cached) return cached.name || cached.email?.split("@")[0] || "Member";
    return "Member";
  });
  const [userRole, setUserRole] = useState(() => {
    if (!cached) return "Member";
    return cached.primaryRole === "mentor"
      ? "Mentor"
      : cached.primaryRole === "aspiring_entrepreneur"
      ? "Aspiring"
      : "Founder";
  });
  const [userInitials, setUserInitials] = useState(() => {
    if (!cached) return "M";
    const name = cached.name || cached.email?.split("@")[0] || "Member";
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || "M";
  });

  // Default to locked until authenticated user is confirmed to have active status
  const isLocked = loadingAuth || !user || user.accountStatus !== "active";

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      // Only show full loading screen if we have no cached session at all (cold initial visit)
      if (!globalSessionUser) {
        setLoadingAuth(true);
      }

      try {
        const res = await fetch("/api/v1/auth/me", { cache: "no-store" });
        if (!isMounted) return;

        if (res.ok) {
          const json = await res.json();
          const u = json.data;
          if (u) {
            // Strict segregation: Super Admins and moderators are restricted strictly to /admin
            if (u.adminLevel) {
              if (typeof window !== "undefined") {
                window.location.href = "/admin";
              }
              return;
            }

            setCachedSession(u);
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
          setCachedSession(null);
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

  // While authenticating on initial cold visit, show luxury obsidian loading splash
  if (loadingAuth) {
    return (
      <div className="admin-portal dark min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="join-glass-panel rounded-3xl p-8 max-w-[340px] w-full text-center border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-sm font-medium text-[#F5FAF6] tracking-wide">
              OASIS ONE
            </h3>
            <p className="text-xs font-mono text-[#ECF1EF]/60">
              Verifying OASIS ONE credentials...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirecting to login
  if (!user) {
    return (
      <div className="admin-portal dark min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="join-glass-panel rounded-3xl p-8 max-w-[340px] w-full text-center border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-4 animate-in fade-in duration-200">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-sm font-medium text-[#F5FAF6] tracking-wide">
              OASIS ONE
            </h3>
            <p className="text-xs font-mono text-[#ECF1EF]/60">
              Redirecting to sign in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is locked and on any page other than /dashboard, display strict guard screen
  if (isLocked && pathname && pathname !== "/dashboard") {
    return (
      <div className="admin-portal dark min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full join-glass-panel border border-white/10 text-[#F5FAF6] rounded-3xl p-8 space-y-4 shadow-[0_24px_60px_rgba(0,0,0,0.85)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Application Under Review</span>
          </div>
          <h2 className="font-display text-xl font-medium text-[#F5FAF6]">
            Access Restricted
          </h2>
          <p className="text-xs text-[#ECF1EF]/70 leading-relaxed font-sans">
            Your membership application is currently under review by the OASIS Admissions Committee. All member destinations are locked until an administrator approves your account.
          </p>
          <div className="pt-2">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#EEF1EA] text-[#03080B] text-xs font-semibold hover:bg-white hover:shadow-[0_0_15px_rgba(136,222,204,0.35)] transition-all cursor-pointer shadow-md"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal dark min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg flex flex-col lg:flex-row relative selection:bg-[#88DECC]/30 selection:text-[#03080B]">
      {/* ── Left Sidebar (Desktop ≥1024px) ────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#070D12]/95 backdrop-blur-2xl flex-col justify-between shrink-0 border-r border-white/10 min-h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-40">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-white/10">
            <Link href="/dashboard" className="join-logo-pill" aria-label="OASIS ONE home">
              <div className="w-[30px] h-[30px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 46 46" width="30" height="30" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24.2 37V24" />
                  <path d="M19.8 39.3c1.2-1.9 2.8-2.7 4.4-2.7s3.2.8 4.4 2.7" />
                  <path d="M23.8 30.2c-2.8-.6-5.5-2.6-7.2-5-2-1.8-5.2-2-7-4.2-1.4-1.8-1.4-4.2 0-6 2-3 5.8-5.2 8.8-6.2 1.4-.5 2.8-1 4.2-1.3" />
                  <path d="M14.8 23V13.2c0-1.4.8-2.6 2.4-3.4" />
                  <path d="M24 24.2c-1.8-1.8-3.2-3.8-3.7-6.4-.5-2.6-.6-5.2-.3-7.2" />
                  <path d="M24.3 23.2c1.5-3 3.5-6.4 4.3-10.2.4-2.6 1.2-4.1 2.8-4.3H35" />
                  <path d="M24.6 25.7c3-.7 5.8-2.1 7.4-4.5 1.2-1.8 1.4-3.8 2.8-5.2 1.4-1.4 3.2-2.1 5.2-2.4" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5 pl-2 select-none">
                <span className="font-semibold text-xs tracking-[0.16em] text-[#F5FAF6] uppercase">
                  OASIS
                </span>
                <span className="font-bold text-[8px] tracking-wider bg-[#88DECC] text-[#03080B] px-1.5 py-0.5 rounded leading-none uppercase">
                  ONE
                </span>
              </div>
            </Link>
          </div>

          {/* Five Core Destinations Navigation */}
          <Suspense fallback={<div className="p-3.5 space-y-1.5 h-48" />}>
            <DesktopNavLinks isLocked={isLocked} />
          </Suspense>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Verified Membership Node Badge */}
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#88DECC] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#F5FAF6] leading-tight">
                {isLocked ? "Pending Verification" : `Verified ${userRole}`}
              </span>
              <span className="text-[9px] font-mono text-[#88DECC]/80 tracking-wider uppercase">
                ODISHA NODE #042
              </span>
            </div>
          </div>

          {isLocked ? (
            <div
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#ECF1EF]/35 cursor-not-allowed select-none bg-white/[0.02]"
              title="Settings locked — Pending Admin Approval"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-[#ECF1EF]/30" />
                <span>Settings & Privacy</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-[#88DECC]/40" />
            </div>
          ) : (
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[#ECF1EF]/70 hover:bg-white/[0.04] hover:text-[#F5FAF6] transition-colors duration-200"
            >
              <Settings className="w-4 h-4 text-[#ECF1EF]/50" />
              <span>Settings & Privacy</span>
            </Link>
          )}
          <div className="px-3 text-[10px] text-[#ECF1EF]/40 font-mono tracking-wider">
            650+ VERIFIED MEMBERS
          </div>
        </div>
      </aside>

      {/* ── Main Work Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Obsidian Luxury Glass) */}
        <header className="sticky top-0 z-40 bg-[#070D12]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 pt-[max(0.75rem,env(safe-area-inset-top,0px))] flex items-center justify-between gap-2.5 sm:gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          {/* Mobile Menu & Logo on left */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 -ml-1 rounded-xl text-[#ECF1EF]/70 hover:text-[#F5FAF6] hover:bg-white/[0.04] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="join-logo-pill" aria-label="OASIS ONE home">
              <div className="w-[28px] h-[28px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
                <svg viewBox="0 0 46 46" width="22" height="22" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M24.2 37V24" />
                </svg>
              </div>
              <span className="font-semibold text-xs tracking-wider text-[#F5FAF6] pl-2 uppercase">
                OASIS ONE
              </span>
            </Link>
          </div>

          {/* Search Trigger (⌘K) */}
          <div className="hidden sm:flex items-center flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-[#ECF1EF]/40 absolute left-3.5 pointer-events-none" />
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
                "w-full h-10 pl-10 pr-14 text-xs sm:text-sm bg-white/[0.04] border border-white/10 rounded-xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/40 transition-all duration-200",
                isLocked
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer focus:outline-none hover:border-[#88DECC]/40 focus:border-[#88DECC]/60"
              )}
            />
            <div className="absolute right-3 top-2.5 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-[#ECF1EF]/60 border border-white/10 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-2 sm:gap-3.5 ml-auto">
            {/* Mobile Search Button (<640px) */}
            {!isLocked && (
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="sm:hidden p-2 rounded-xl text-[#ECF1EF]/70 hover:text-[#F5FAF6] hover:bg-white/[0.04] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* "New" Dropdown - only available for approved members */}
            {!isLocked && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNewMenuOpen(!newMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF1EA] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_15px_rgba(136,222,204,0.35)] transition-all cursor-pointer shadow-xs min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New</span>
                </button>

                {newMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl join-glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] py-1.5 z-50 text-xs text-[#F5FAF6] animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setNewMenuOpen(false)}
                  >
                    <Link
                      href="/community?action=new-question"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.06] text-[#F5FAF6] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-[#88DECC]" />
                      Ask a question
                    </Link>
                    <Link
                      href="/community?action=new-win"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.06] text-[#F5FAF6] transition-colors"
                    >
                      <Rocket className="w-4 h-4 text-emerald-400" />
                      Share an achievement
                    </Link>
                    <Link
                      href="/planner?action=new-task"
                      className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.06] text-[#F5FAF6] transition-colors"
                    >
                      <CheckSquare className="w-4 h-4 text-[#88DECC]" />
                      Add a task
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            {isLocked ? (
              <div
                className="p-2 rounded-xl text-[#ECF1EF]/30 cursor-not-allowed select-none"
                title="Notifications locked — Pending Admin Approval"
              >
                <Bell className="w-4 h-4" />
              </div>
            ) : (
              <Link
                href="/notifications"
                className="relative p-2.5 rounded-xl text-[#ECF1EF]/70 hover:text-[#F5FAF6] hover:bg-white/[0.04] transition-colors duration-150"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#88DECC] animate-pulse" />
              </Link>
            )}

            {/* User Avatar with Persona & Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full border-2 border-[#88DECC]/40 hover:border-[#88DECC] transition-colors cursor-pointer shadow-[0_0_12px_rgba(136,222,204,0.2)]"
                title={`${userName} (${userRole})`}
              >
                <div className="w-8 h-8 rounded-full bg-[#122B2A] text-[#88DECC] text-xs font-semibold flex items-center justify-center font-display shadow-xs">
                  {userInitials}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2.5 w-64 rounded-2xl join-glass-panel border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] py-2 z-50 text-xs text-[#F5FAF6] animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="font-semibold text-sm text-[#F5FAF6]">{userName}</div>
                    <div className="text-[11px] text-[#ECF1EF]/60 flex items-center gap-1.5 mt-1">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isLocked ? "bg-amber-400 animate-pulse" : "bg-[#88DECC]"
                        )}
                      />
                      <span>Role: {userRole}</span>
                      {isLocked && <span className="text-amber-400 font-medium">(Locked)</span>}
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] text-[#F5FAF6] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#ECF1EF]/60" />
                        Settings & Privacy
                      </Link>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch("/api/v1/auth/logout", { method: "POST" });
                        } catch (e) {
                          console.error("Logout error:", e);
                        }
                        setCachedSession(null);
                        if (typeof window !== "undefined") {
                          sessionStorage.clear();
                          localStorage.clear();
                          window.location.href = "/login";
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 text-left transition-colors cursor-pointer"
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
            className="fixed inset-0 z-50 bg-[#03080B]/80 backdrop-blur-xl flex items-start justify-center pt-24 px-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div
              className="join-glass-panel border border-white/10 rounded-2xl max-w-[560px] w-full shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-[#F5FAF6]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Palette Input */}
              <div className="relative border-b border-white/10 p-4 flex items-center gap-3">
                <Search className="w-4 h-4 text-[#88DECC] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a destination, query, or member name..."
                  className="w-full bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(false)}
                  className="text-xs font-mono text-[#ECF1EF]/60 px-2 py-0.5 rounded bg-white/[0.04] border border-white/10"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions List */}
              <div className="p-3 max-h-[380px] overflow-y-auto space-y-3 text-xs auth-scrollbar">
                {/* Destinations */}
                <div>
                  <span className="px-2 text-[10px] uppercase font-display tracking-wider text-[#ECF1EF]/50 font-semibold">
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
                          className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-[#F5FAF6] transition-colors"
                        >
                          <span>{d.name}</span>
                          <span className="text-[10px] font-mono text-[#ECF1EF]/50">{d.href}</span>
                        </Link>
                      ))}
                  </div>
                </div>

                {/* Quick Results */}
                <div>
                  <span className="px-2 text-[10px] uppercase font-display tracking-wider text-[#ECF1EF]/50 font-semibold">
                    Quick Search Matches
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/search?q=agritech"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-[#F5FAF6]"
                    >
                      <span>Search for &ldquo;Agritech&rdquo; in Odisha</span>
                      <span className="text-[10px] text-[#88DECC] font-medium">12 matches</span>
                    </Link>
                    <Link
                      href="/people"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-[#F5FAF6]"
                    >
                      <span>Browse Verified Mentors Directory</span>
                      <span className="text-[10px] text-[#ECF1EF]/50">Directory</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-10 max-w-[1240px] w-full mx-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
          {children}
        </main>
      </div>

      {/* ── Tablet & Mobile Slide-out Drawer (<1024px) ────────────────────────── */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#03080B]/80 backdrop-blur-xl flex"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-[280px] sm:w-[320px] bg-[#070D12]/95 backdrop-blur-2xl text-[#F5FAF6] flex flex-col justify-between h-full p-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Link href="/dashboard" className="join-logo-pill" aria-label="OASIS ONE home">
                  <div className="w-[28px] h-[28px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 46 46" width="22" height="22" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M24.2 37V24" />
                    </svg>
                  </div>
                  <span className="font-semibold text-xs tracking-wider text-[#F5FAF6] pl-2 uppercase">
                    OASIS ONE
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-4" onClick={() => setMobileDrawerOpen(false)}>
                <DesktopNavLinks isLocked={isLocked} />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#88DECC] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-[#F5FAF6] leading-tight">
                    {isLocked ? "Pending Verification" : `Verified ${userRole}`}
                  </span>
                  <span className="text-[9px] font-mono text-[#88DECC]/80 tracking-wider uppercase">
                    ODISHA NODE #042
                  </span>
                </div>
              </div>

              {!isLocked && (
                <Link
                  href="/settings"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-[#ECF1EF]/75 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#ECF1EF]/50" />
                  <span>Settings & Privacy</span>
                </Link>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch("/api/v1/auth/logout", { method: "POST" });
                  } catch (e) {}
                  setCachedSession(null);
                  if (typeof window !== "undefined") {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = "/login";
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar (<1024px) ────────────────────────────────────── */}
      <Suspense fallback={null}>
        <MobileBottomNavLinks isLocked={isLocked} />
      </Suspense>
    </div>
  );
}
