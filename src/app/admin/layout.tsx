"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Flag,
  Award,
  Calendar,
  Megaphone,
  BarChart3,
  FileText,
  Settings,
  Shield,
  ShieldCheck,
  Building2,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  name: string;
  href: string;
  icon: any;
  badgeKey?: string;
  superAdminOnly?: boolean;
}

const adminNav: AdminNavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: FileCheck2, badgeKey: "pendingApplications" },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Startups", href: "/admin/startups", icon: Building2 },
  { name: "Posts & Reports", href: "/admin/reports", icon: Flag, badgeKey: "openReports" },
  { name: "Achievements", href: "/admin/achievements", icon: Award, badgeKey: "pendingAchievements" },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Admins & Committee", href: "/admin/admins", icon: ShieldCheck, superAdminOnly: true },
  { name: "Audit Log", href: "/admin/audit-log", icon: FileText, superAdminOnly: true },
  { name: "Settings", href: "/admin/settings", icon: Settings, superAdminOnly: true },
];

function AdminNavLinks({ adminLevel }: { adminLevel: string | null }) {
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/v1/admin/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setCounts(json.data);
      })
      .catch(() => {});
  }, []);

  const visibleNav = adminNav.filter((item) => {
    if (item.superAdminOnly && adminLevel !== "super_admin") {
      return false;
    }
    return true;
  });

  return (
    <nav className="p-3 space-y-1">
      {visibleNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 group",
              isActive
                ? "bg-white/[0.08] text-[#F5FAF6] font-medium border-l-2 border-[#88DECC] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                : "text-[#ECF1EF]/65 hover:bg-white/[0.04] hover:text-[#F5FAF6]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-[#88DECC]"
                    : "text-[#ECF1EF]/40 group-hover:text-[#88DECC]/80"
                )}
              />
              <span className="font-sans">{item.name}</span>
            </div>
            {Boolean(badgeCount && badgeCount > 0) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#88DECC] text-[#03080B] shadow-xs">
                {badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminLevel, setAdminLevel] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const isMfaRoute = pathname === "/admin/mfa";

  useEffect(() => {
    if (isMfaRoute) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (!res.ok) {
          if (typeof window !== "undefined") {
            window.location.href = "/login?error=session_required";
          }
          return;
        }

        const json = await res.json();
        const user = json.data;

        if (!user || !user.adminLevel) {
          if (typeof window !== "undefined") {
            window.location.href = "/login?error=admin_required";
          }
          return;
        }

        if (!user.mfaVerified) {
          if (typeof window !== "undefined") {
            window.location.href = "/admin/mfa";
          }
          return;
        }

        if (isMounted) {
          setAuthorized(true);
          setAdminLevel(user.adminLevel);
          setAdminEmail(user.email || null);
          setChecking(false);
        }
      } catch (err) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    checkAdminAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, isMfaRoute]);

  // If on MFA security screen, render without sidebar navigation
  if (isMfaRoute) {
    return <>{children}</>;
  }

  const visibleNav = adminNav.filter((item) => {
    if (item.superAdminOnly && adminLevel !== "super_admin") {
      return false;
    }
    return true;
  });

  return (
    <div className="admin-portal dark min-h-screen bg-[#03080B] text-[#F5FAF6] login-bg flex flex-col lg:flex-row relative selection:bg-[#88DECC]/30 selection:text-[#03080B]">
      {/* ── Authorization Security Overlay (shown while validating session & MFA) ── */}
      {(checking || !authorized) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center login-bg bg-[#03080B] text-[#F5FAF6] p-4 select-none">
          <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-[380px] w-full text-center border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-3.5 animate-in fade-in duration-200">
            {/* Top Specular Mint Hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

            {/* Glowing Astrolabe Emblem */}
            <div className="relative flex justify-center items-center py-2">
              <div className="absolute inset-0 rounded-full bg-[#88DECC]/15 blur-2xl" />
              <AstrolabeStar size={110} className="relative z-10" />
            </div>

            {/* Header & Subhead */}
            <div className="space-y-1">
              <h2 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
                Verifying Credentials
              </h2>
              <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 leading-relaxed font-normal">
                Authenticating admin permissions &amp; MFA status for OASIS governance console.
              </p>
            </div>

            {/* Shimmering Loading Bar */}
            <div className="w-32 h-1 mx-auto rounded-full bg-white/10 overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#88DECC] to-transparent animate-pulse" />
            </div>

            {/* Status Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/50 font-mono">
              <Shield className="w-3 h-3 text-[#88DECC] shrink-0" />
              <span>Admin Sanctuary Handshake</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Admin Sidebar (Obsidian Glass) ─────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[#070D12]/95 backdrop-blur-2xl flex-col justify-between shrink-0 border-r border-white/10 min-h-screen sticky top-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <Link href="/admin" className="join-logo-pill" aria-label="OASIS ONE home">
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
                <span className="font-bold text-[8px] tracking-wider bg-[#F3D3A2] text-[#12131F] px-1.5 py-0.5 rounded leading-none uppercase">
                  ADMIN
                </span>
              </div>
            </Link>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[#88DECC] font-semibold">
                <Shield className="w-3 h-3" />
                <span>Console Active</span>
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] uppercase font-semibold border",
                  adminLevel === "super_admin"
                    ? "bg-[#88DECC]/10 text-[#88DECC] border-[#88DECC]/30"
                    : "bg-white/[0.04] text-[#ECF1EF]/70 border-white/10"
                )}
              >
                {adminLevel === "super_admin" ? "Super Admin" : "Moderator"}
              </span>
            </div>
            {adminEmail && (
              <p className="text-[10px] font-mono text-[#ECF1EF]/40 truncate">
                {adminEmail}
              </p>
            )}
          </div>

          {/* Navigation Items wrapped in Suspense */}
          <Suspense fallback={<div className="p-3 space-y-1 h-64" />}>
            <AdminNavLinks adminLevel={adminLevel} />
          </Suspense>
        </div>

        {/* System & Session Status with Sign Out */}
        <div className="p-3.5 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#ECF1EF]/70">
            <span className="font-medium text-xs">OASIS Governance</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#88DECC] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
              MFA Active
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/v1/auth/logout", { method: "POST" });
              } catch {}
              if (typeof window !== "undefined") {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = "/login";
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Console</span>
          </button>

          <div className="text-[9.5px] font-mono text-[#ECF1EF]/40 text-center">
            OASIS v2.0 &middot; Committee Console
          </div>
        </div>
      </aside>

      {/* ── Mobile Admin Header ────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-[#070D12]/95 backdrop-blur-2xl text-[#F5FAF6] px-4 py-3 flex items-center justify-between border-b border-white/10">
        <Link href="/admin" className="join-logo-pill" aria-label="OASIS ONE home">
          <div className="w-[28px] h-[28px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 46 46" width="24" height="24" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M24.2 37V24" />
              <path d="M19.8 39.3c1.2-1.9 2.8-2.7 4.4-2.7s3.2.8 4.4 2.7" />
              <path d="M23.8 30.2c-2.8-.6-5.5-2.6-7.2-5-2-1.8-5.2-2-7-4.2-1.4-1.8-1.4-4.2 0-6 2-3 5.8-5.2 8.8-6.2 1.4-.5 2.8-1 4.2-1.3" />
              <path d="M14.8 23V13.2c0-1.4.8-2.6 2.4-3.4" />
              <path d="M24 24.2c-1.8-1.8-3.2-3.8-3.7-6.4-.5-2.6-.6-5.2-.3-7.2" />
              <path d="M24.3 23.2c1.5-3 3.5-6.4 4.3-10.2.4-2.6 1.2-4.1 2.8-4.3H35" />
              <path d="M24.6 25.7c3-.7 5.8-2.1 7.4-4.5 1.2-1.8 1.4-3.8 2.8-5.2 1.4-1.4 3.2-2.1 5.2-2.4" />
            </svg>
          </div>
          <div className="flex items-center gap-1 pl-1.5 select-none">
            <span className="font-semibold text-xs tracking-wider text-[#F5FAF6] uppercase">
              OASIS
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold border",
              adminLevel === "super_admin"
                ? "bg-[#88DECC]/10 text-[#88DECC] border-[#88DECC]/30"
                : "bg-white/[0.04] text-[#ECF1EF]/70 border-white/10"
            )}
          >
            {adminLevel === "super_admin" ? "Super Admin" : "Moderator"}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070D12]/95 backdrop-blur-2xl p-4 space-y-2 border-b border-white/10">
          {visibleNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs text-[#ECF1EF]/80 hover:bg-white/10"
            >
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              try {
                await fetch("/api/v1/auth/logout", { method: "POST" });
              } catch {}
              if (typeof window !== "undefined") {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = "/login";
              }
            }}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 transition-colors border-t border-white/10 cursor-pointer pt-3 mt-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* ── Content View ──────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
