"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
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
  ArrowLeft,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: FileCheck2, badgeKey: "pendingApplications" },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Taxonomy", href: "/admin/taxonomy", icon: Tag },
  { name: "Migration & Invites", href: "/admin/migration", icon: FileText },
  { name: "Posts & Reports", href: "/admin/reports", icon: Flag, badgeKey: "openReports" },
  { name: "Achievements", href: "/admin/achievements", icon: Award, badgeKey: "pendingAchievements" },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Audit Log", href: "/admin/audit-log", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminNavLinks() {
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

  return (
    <nav className="p-3 space-y-1">
      {adminNav.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
              isActive
                ? "bg-white/10 text-[var(--brand-cream)] font-semibold border-l-2 border-[var(--brand-gold)]"
                : "text-[var(--brand-cream)]/70 hover:bg-white/5 hover:text-[var(--brand-cream)]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-[var(--brand-gold)]"
                    : "text-[var(--brand-cream)]/50 group-hover:text-[var(--brand-cream)]"
                )}
              />
              <span>{item.name}</span>
            </div>
            {Boolean(badgeCount && badgeCount > 0) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--accent-fill)] text-[var(--brand-navy)]">
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col lg:flex-row">
      {/* ── Desktop Admin Sidebar (Midnight Navy) ─────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[var(--brand-navy)] flex-col justify-between shrink-0 border-r border-[var(--brand-gold)]/20 min-h-screen sticky top-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-white/10">
            <BrandLockup variant="horizontal" href="/admin" />
            <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[var(--accent)] font-semibold">
              <Shield className="w-3 h-3" />
              <span>Admin Console · MFA Active</span>
            </div>
          </div>

          {/* Navigation Items wrapped in Suspense */}
          <Suspense fallback={<div className="p-3 space-y-1 h-64" />}>
            <AdminNavLinks />
          </Suspense>
        </div>

        {/* Return to Member Portal */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-[var(--brand-cream)]/70 hover:text-[var(--brand-cream)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Member View</span>
          </Link>
          <div className="text-[10px] font-mono text-[var(--brand-cream)]/40">
            OASIS v2.0 · Committee ID 04
          </div>
        </div>
      </aside>

      {/* ── Mobile Admin Header ────────────────────────────────────────────────── */}
      <div className="lg:hidden bg-[var(--brand-navy)] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10">
        <BrandLockup variant="wordmark" href="/admin" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--accent)]">Admin</span>
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
          {adminNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs text-[var(--brand-cream)]/80 hover:bg-white/10"
            >
              <span>{item.name}</span>
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="block pt-2 text-xs text-[var(--brand-gold)] border-t border-white/10"
          >
            ← Return to Member View
          </Link>
        </div>
      )}

      {/* ── Content View ──────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
    </div>
  );
}
