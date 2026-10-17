"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Flag,
  Award,
  Calendar,
  Megaphone,
  Tag,
  BarChart3,
  FileText,
  Settings,
  Shield,
  ShieldCheck,
  Building2,
  Scale,
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
  { name: "Taxonomy", href: "/admin/taxonomy", icon: Tag },
  { name: "Migration & Invites", href: "/admin/migration", icon: FileText },
  { name: "Posts & Reports", href: "/admin/reports", icon: Flag, badgeKey: "openReports" },
  { name: "Achievements", href: "/admin/achievements", icon: Award, badgeKey: "pendingAchievements" },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Admins & Committee", href: "/admin/admins", icon: ShieldCheck, superAdminOnly: true },
  { name: "Legal Documents", href: "/admin/legal", icon: Scale, superAdminOnly: true },
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
              "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 group",
              isActive
                ? "bg-white/10 text-[#FBF7EE] font-semibold border-l-2 border-[#D4AF37] shadow-xs backdrop-blur-md"
                : "text-white/70 hover:bg-white/5 hover:text-[#FBF7EE]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-[#F3D3A2]"
                    : "text-white/40 group-hover:text-white/80"
                )}
              />
              <span className="font-sans">{item.name}</span>
            </div>
            {Boolean(badgeCount && badgeCount > 0) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E9C68C] text-[#1E1F33] shadow-xs">
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
          // MFA not verified yet — immediately bounce to MFA verification screen
          if (typeof window !== "undefined") {
            window.location.href = "/admin/mfa";
          }
          return;
        }

        if (isMounted) {
          setAdminLevel(user.adminLevel);
          setAdminEmail(user.email);
          setAuthorized(true);
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col lg:flex-row relative">
      {/* ── Authorization Security Overlay (shown while validating session & MFA) ── */}
      {(checking || !authorized) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#12131F] text-[#FCF6E3]">
          <AstrolabeStar className="w-12 h-12 text-[#D4AF37] animate-spin" />
          <p className="mt-4 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
            Verifying Admin Credentials &amp; MFA...
          </p>
        </div>
      )}

      {/* ── Desktop Admin Sidebar (Midnight Navy) ─────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[var(--brand-navy)] flex-col justify-between shrink-0 border-r border-[var(--brand-gold)]/20 min-h-screen sticky top-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-white/10">
            <BrandLockup variant="horizontal" href="/admin" />
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[var(--accent)] font-semibold">
                <Shield className="w-3 h-3" />
                <span>Console Active</span>
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] uppercase font-semibold border",
                  adminLevel === "super_admin"
                    ? "bg-[#D4AF37]/20 text-[#F3D3A2] border-[#D4AF37]/40"
                    : "bg-indigo-950/60 text-indigo-300 border-indigo-700"
                )}
              >
                {adminLevel === "super_admin" ? "Super Admin" : "Moderator"}
              </span>
            </div>
            {adminEmail && (
              <p className="mt-1.5 text-[10px] font-mono text-white/50 truncate">
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
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[var(--brand-cream)]/70">
            <span className="font-medium">OASIS Governance</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Console</span>
          </button>

          <div className="text-[10px] font-mono text-[var(--brand-cream)]/40">
            OASIS v2.0 · Committee Console
          </div>
        </div>
      </aside>

      {/* ── Mobile Admin Header ────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-[var(--brand-navy)] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10">
        <BrandLockup variant="wordmark" href="/admin" />
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold",
              adminLevel === "super_admin"
                ? "bg-[#D4AF37]/20 text-[#F3D3A2]"
                : "bg-indigo-950/60 text-indigo-300"
            )}
          >
            {adminLevel === "super_admin" ? "Super Admin" : "Moderator"}
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[var(--brand-navy)] p-4 space-y-2 border-b border-white/10">
          {visibleNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs text-[var(--brand-cream)]/80 hover:bg-white/10"
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
      <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
    </div>
  );
}
