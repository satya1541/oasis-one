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
  Menu,
  X,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function DesktopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="p-3 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
              isActive
                ? "bg-white/10 text-[var(--brand-cream)] font-semibold border-l-2 border-[var(--brand-gold)]"
                : "text-[var(--brand-cream)]/70 hover:bg-white/5 hover:text-[var(--brand-cream)]"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 transition-colors",
                isActive
                  ? "text-[var(--brand-gold)]"
                  : "text-[var(--brand-cream)]/50 group-hover:text-[var(--brand-cream)]"
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function MobileBottomNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--brand-navy)] text-[var(--brand-cream)] border-t border-[var(--brand-gold)]/20 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors",
              isActive
                ? "text-[var(--brand-gold)] font-semibold"
                : "text-[var(--brand-cream)]/70 hover:text-[var(--brand-cream)]"
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
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const [userName, setUserName] = useState("Member");
  const [userRole, setUserRole] = useState("Member");
  const [userInitials, setUserInitials] = useState("M");

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (res.ok) {
          const json = await res.json();
          const u = json.data;
          if (isMounted && u) {
            setUser(u);
            const name = u.name || u.email?.split("@")[0] || "Member";
            setUserName(name);
            const parts = name.trim().split(" ");
            if (parts.length > 1) {
              setUserInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
            } else if (parts[0]) {
              setUserInitials(parts[0].slice(0, 2).toUpperCase());
            }
            const role = u.adminLevel ? "Super Admin" : u.primaryRole === "mentor" ? "Mentor" : u.primaryRole === "aspiring_entrepreneur" ? "Aspiring" : "Founder";
            setUserRole(role);
          }
        } else if (res.status === 401) {
          // If unauthenticated in member shell, redirect to login
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login") && !window.location.pathname.startsWith("/join")) {
            window.location.href = "/login";
          }
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    }
    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col lg:flex-row">
      {/* ── Left Sidebar (Desktop ≥1024px) ────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-[var(--brand-navy)] flex-col justify-between shrink-0 border-r border-[var(--brand-gold)]/20 min-h-screen sticky top-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[var(--brand-gold)]/15">
            <BrandLockup variant="wordmark" href="/dashboard" />
          </div>

          {/* Five Core Destinations Navigation wrapped in Suspense */}
          <Suspense fallback={<div className="p-3 space-y-1 h-48" />}>
            <DesktopNavLinks />
          </Suspense>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[var(--brand-gold)]/10 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[var(--brand-cream)]/70 hover:bg-white/5 hover:text-[var(--brand-cream)] transition-colors"
          >
            <Settings className="w-4 h-4 text-[var(--brand-cream)]/50" />
            <span>Settings & Privacy</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-[var(--brand-cream)]/70 hover:bg-white/5 hover:text-[var(--brand-cream)] transition-colors"
          >
            <Shield className="w-4 h-4 text-[var(--accent)]" />
            <span>Admin Console</span>
          </Link>
          <div className="px-3 pt-2 text-[10px] text-[var(--brand-cream)]/40 font-mono tracking-wider">
            650+ VERIFIED MEMBERS
          </div>
        </div>
      </aside>

      {/* ── Main Work Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--border)] px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
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
              placeholder="Search people, questions and events (⌘K)"
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)]/60 cursor-pointer focus:outline-none hover:border-[var(--border-strong)] transition-colors"
            />
          </div>

          {/* Right utility actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* "New" Dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setNewMenuOpen(!newMenuOpen)}
                className="gap-1.5 shadow-xs"
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
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)]"
                  >
                    <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                    Ask a question
                  </Link>
                  <Link
                    href="/community?action=new-win"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)]"
                  >
                    <Rocket className="w-4 h-4 text-[var(--success)]" />
                    Share an achievement
                  </Link>
                  <Link
                    href="/planner?action=new-task"
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-2)] text-[var(--text)]"
                  >
                    <CheckSquare className="w-4 h-4 text-[var(--brand-navy)]" />
                    Add a task
                  </Link>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--warning)]" />
            </Link>

            {/* User Avatar with Persona & Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-[var(--brand-gold)]/40 hover:opacity-90 transition-opacity cursor-pointer"
                title={`${userName} (${userRole})`}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--brand-navy)] text-[var(--brand-cream)] text-xs font-semibold flex items-center justify-center font-display shadow-xs">
                  {userInitials}
                </div>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-2)] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[var(--border)]">
                    <div className="font-semibold text-[var(--text)]">{userName}</div>
                    <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      Role: {userRole}
                    </div>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[var(--muted)]" />
                      Settings & Privacy
                    </Link>
                    {(user?.adminLevel || userRole === "Super Admin") && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--accent)] font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[var(--accent)]" />
                        Admin Console
                      </Link>
                    )}
                  </div>

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

        {/* Command Palette Modal */}
        {commandPaletteOpen && (
          <div
            className="fixed inset-0 z-50 bg-[var(--brand-navy)]/65 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-[560px] w-full shadow-[var(--shadow-2)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Palette Input */}
              <div className="relative border-b border-[var(--border)] p-3.5 flex items-center gap-3">
                <Search className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  placeholder="Type a command, question, or person name..."
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
                      { href: "/admin", name: "Admin Review Console" },
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
                      href="/people/mentor-1"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <span>Dr. Alok Mohanty (Verified Mentor · HealthTech)</span>
                      <span className="text-[10px] text-[var(--muted)]">Bhubaneswar</span>
                    </Link>
                    <Link
                      href="/community/q-1"
                      onClick={() => setCommandPaletteOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text)]"
                    >
                      <span>How did you find your first 3 pilot customers?</span>
                      <span className="text-[10px] text-[var(--muted)]">4 replies</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-6 lg:p-10 max-w-[1200px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar (<1024px) wrapped in Suspense ────────────────── */}
      <Suspense fallback={null}>
        <MobileBottomNavLinks />
      </Suspense>
    </div>
  );
}
