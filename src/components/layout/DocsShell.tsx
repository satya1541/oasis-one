"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  Shield,
  Compass,
  HelpCircle,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: "policies" | "community" | "support";
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "policies",
    title: "Policies & Legal",
    icon: "policies",
    items: [
      { href: "/legal", label: "Legal & Governance Hub" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/guidelines", label: "Community Guidelines" },
      { href: "/legal/grievance", label: "Grievance & Appeals" },
      { href: "/legal/cookies", label: "Operations & Cookies" },
    ],
  },
  {
    id: "community",
    title: "Community & Admission",
    icon: "community",
    items: [
      { href: "/who-its-for", label: "Who It's For" },
      { href: "/experience", label: "The Experience" },
      { href: "/admission", label: "Admission Protocol" },
      { href: "/faq", label: "FAQ & Migration Guide" },
    ],
  },
  {
    id: "support",
    title: "Account & Help",
    icon: "support",
    items: [
      { href: "/join", label: "Apply for Membership" },
      { href: "/login", label: "Member Sign In" },
      { href: "/contact", label: "Help & Grievance Desk" },
    ],
  },
];

const PAGE_LABELS: Record<string, string> = {
  "/legal": "Legal & Governance Hub",
  "/legal/privacy": "Privacy Policy",
  "/legal/terms": "Terms of Service",
  "/legal/guidelines": "Community Guidelines",
  "/legal/grievance": "Grievance & Appeals",
  "/legal/cookies": "Operations & Cookies",
  "/who-its-for": "Who It's For",
  "/experience": "The Experience",
  "/admission": "Admission Protocol",
  "/faq": "FAQ & Migration Guide",
};

interface TocEntry {
  id: string;
  title: string;
}

function GroupIcon({ kind }: { kind: NavGroup["icon"] }) {
  if (kind === "policies") return <Shield className="w-4 h-4 text-[#4F46E5] shrink-0" />;
  if (kind === "community") return <Compass className="w-4 h-4 text-[#4F46E5] shrink-0" />;
  return <HelpCircle className="w-4 h-4 text-[#4F46E5] shrink-0" />;
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/legal";
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    policies: true,
    community: true,
    support: true,
  });
  const [tocItems, setTocItems] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const currentPageLabel = PAGE_LABELS[pathname] || "Documentation";

  // Discover section headings cleanly on mount & route change without mutating page metadata
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const collectHeadings = () => {
      const sections = Array.from(
        container.querySelectorAll<HTMLElement>("section[id], [data-doc-section][id]"),
      );
      const discovered: TocEntry[] = [];
      for (const sec of sections) {
        const id = sec.getAttribute("id");
        const headingEl = sec.querySelector("h2, h3");
        const rawText = sec.getAttribute("data-toc-title") || headingEl?.textContent || "";
        const title = rawText.replace(/\s+/g, " ").trim();
        if (id && title) {
          discovered.push({ id, title });
        }
      }
      setTocItems(discovered);
      if (discovered.length > 0) {
        setActiveId((prev) =>
          discovered.some((item) => item.id === prev) ? prev : discovered[0].id,
        );
      } else {
        setActiveId("");
      }
    };

    collectHeadings();
    const timer = window.setTimeout(collectHeadings, 120);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  // Scroll-spy for right-hand "On This Page" indicator
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const scrollTop = currentY + 120;
      let current = tocItems[0]?.id || "";
      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.getBoundingClientRect().top + currentY;
          if (top <= scrollTop) {
            current = item.id;
          }
        }
      }
      setActiveId(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, [tocItems]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    setActiveId(id);
    const currentY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const top = Math.max(0, target.getBoundingClientRect().top + currentY - 84);
    window.scrollTo({ top, behavior: "smooth" });
  };

  const renderSidebarGroups = (onNavigate?: () => void) => (
    <div className="space-y-5">
      {/* Static Region / Jurisdiction line matching clean docs hierarchy */}
      <div className="space-y-2 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#4F46E5]">
          <Globe className="w-4 h-4 shrink-0" />
          <span>Jurisdiction</span>
        </div>
        <div className="pl-6 space-y-1.5 text-[12px]">
          <div className="font-medium text-[#4F46E5]">ODISHA, INDIA</div>
          <div className="text-gray-400">Version 1.0 · DPDP 2023</div>
        </div>
      </div>

      {NAV_GROUPS.map((group) => {
        const isOpen = openGroups[group.id] ?? true;
        return (
          <div key={group.id} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between text-left text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-2">
                <GroupIcon kind={group.icon} />
                <span>{group.title}</span>
              </span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              )}
            </button>

            {isOpen && (
              <ul className="pl-6 space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "block py-1.5 px-2.5 -ml-2.5 rounded-md text-[13px] transition-colors",
                          isActive
                            ? "text-[#4F46E5] font-semibold bg-[#EEF2FF]"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="docs-shell min-h-screen flex flex-col bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ── Top Documentation Header ───────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Open documentation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-[#111827] flex items-center justify-center p-1 shadow-xs shrink-0">
                <Image
                  src="/brand/oasis-mark.png"
                  alt="OASIS"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-[15px] font-semibold tracking-tight text-gray-900 group-hover:text-[#4F46E5] transition-colors">
                  OASIS
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:block">
                  Odisha Startup Community
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex items-center gap-4 sm:gap-7 text-[13px] font-medium text-gray-800">
            <Link
              href="/join"
              className="hidden sm:inline-block hover:text-[#4F46E5] transition-colors"
            >
              Apply for Membership
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#4F46E5] transition-colors"
            >
              Help
            </Link>
            <Link
              href="/login"
              className="hover:text-[#4F46E5] transition-colors"
            >
              Login / Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Mobile Sidebar Drawer ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full border-r border-gray-200 flex flex-col overflow-y-auto p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">OASIS Guide &amp; Policies</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderSidebarGroups(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* ── Main 3-Column Documentation Layout ─────────────────────── */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex items-stretch">
        {/* Left Navigation Sidebar */}
        <aside
          className={cn(
            "hidden lg:block shrink-0 border-r border-gray-200 bg-white transition-all duration-200",
            sidebarCollapsed ? "w-12" : "w-[260px]",
          )}
        >
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                title={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
                aria-label={sidebarCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="w-4 h-4" />
                ) : (
                  <ChevronsLeft className="w-4 h-4" />
                )}
              </button>
            </div>
            {!sidebarCollapsed && renderSidebarGroups()}
          </div>
        </aside>

        {/* Center Document Reading Pane */}
        <main className="flex-1 min-w-0 bg-white">
          <div
            ref={contentRef}
            className="max-w-[820px] mx-auto px-5 sm:px-10 lg:px-12 py-8 sm:py-11"
          >
            {/* Mobile Section Quick Jump */}
            {tocItems.length > 0 && (
              <div className="xl:hidden mb-6 p-3.5 rounded-lg border border-gray-200 bg-gray-50/70">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  On this page — {currentPageLabel}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tocItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-md border transition-colors text-left cursor-pointer",
                        activeId === item.id
                          ? "bg-[#EEF2FF] border-[#4F46E5]/40 text-[#4F46E5] font-medium"
                          : "bg-white border-gray-200 text-gray-600 hover:text-gray-900",
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {children}

            {/* Clean Light Footer inside document column */}
            <footer className="mt-14 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium text-gray-800">OASIS</span> · Plot No.: 2762, Brahmeswar Patna, Bhubaneswar, Odisha 751018
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/legal/privacy" className="hover:text-[#4F46E5] transition-colors">
                  Privacy
                </Link>
                <Link href="/legal/terms" className="hover:text-[#4F46E5] transition-colors">
                  Terms
                </Link>
                <Link href="/faq" className="hover:text-[#4F46E5] transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="hover:text-[#4F46E5] transition-colors">
                  Info@oasisodisha.in
                </Link>
              </div>
            </footer>
          </div>
        </main>

        {/* Right Sticky Table of Contents ("On This Page") */}
        <aside className="hidden xl:block w-[260px] shrink-0 border-l border-gray-200 bg-white">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-5 py-8">
            <div className="border-l border-gray-200">
              <div className="pl-3.5 py-1.5 -ml-px border-l-2 border-[#4F46E5] text-[13px] font-medium text-[#4F46E5] mb-3">
                {currentPageLabel}
              </div>

              {tocItems.length > 0 && (
                <ul className="space-y-1">
                  {tocItems.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(item.id)}
                          className={cn(
                            "w-full text-left pl-3.5 py-1.5 -ml-px border-l-2 text-[12px] leading-snug uppercase tracking-wide transition-colors cursor-pointer",
                            isActive
                              ? "border-[#4F46E5] text-[#4F46E5] font-medium"
                              : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300",
                          )}
                        >
                          {item.title}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
