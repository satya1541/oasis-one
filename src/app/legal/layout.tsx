"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import {
  ArrowLeft,
  Shield,
  FileText,
  Lock,
  Users,
  AlertCircle,
  Cookie,
  HelpCircle,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";

const POLICY_LINKS = [
  { href: "/legal", label: "Overview", icon: Shield },
  { href: "/legal/terms", label: "Terms of Service", icon: FileText },
  { href: "/legal/privacy", label: "Privacy Notice", icon: Lock },
  { href: "/legal/guidelines", label: "Community Guidelines", icon: Users },
  { href: "/legal/grievance", label: "Grievance & Appeals", icon: AlertCircle },
  { href: "/legal/cookies", label: "Operations & Cookies", icon: Cookie },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      className="dark min-h-screen flex flex-col bg-gradient-to-b from-[#12131F] via-[#151624] to-[#12131F] text-[#FCF6E3] selection:bg-[#F3D3A2]/30 selection:text-[#1E1F33] relative overflow-hidden"
      style={
        {
          "--surface-2": "rgba(255, 255, 255, 0.04)",
          "--surface": "rgba(255, 255, 255, 0.02)",
          "--border": "rgba(255, 255, 255, 0.10)",
          "--border-strong": "rgba(255, 255, 255, 0.18)",
          "--text": "#FCF6E3",
          "--muted": "rgba(252, 246, 227, 0.70)",
          "--brand-gold": "#F3D3A2",
          "--accent": "#88DECC",
          "--brand-cream": "#FCF6E3",
          "--brand-navy": "#12131F",
        } as React.CSSProperties
      }
    >
      {/* ── Ambient Radial Atmosphere (Pure CSS, Strictly NO Background Video) ──── */}
      <div
        className="absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(136,222,204,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Top Header (Apple-Style Translucent Luxury Glass) ───────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#1E1F33]/90 backdrop-blur-2xl border-b border-[#F3D3A2]/15 px-4 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <BrandLockup variant="horizontal" href="/" priority />
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase bg-[#88DECC]/10 text-[#88DECC] px-2.5 py-1 rounded-full border border-[#88DECC]/25 font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
              Statutory Governance Hub
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/faq"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#FCF6E3]/75 hover:text-[#F3D3A2] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#F3D3A2]" />
              <span>Migration FAQ</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FCF6E3]/90 hover:text-white transition-all px-3.5 py-1.5 rounded-full border border-white/15 hover:border-[#F3D3A2]/50 bg-white/5 hover:bg-white/10 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Secondary Sub-Navigation Bar (Glass Pill Tabs) ──────────────────────── */}
      <nav className="w-full bg-[#181928]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 lg:px-12 py-2.5 overflow-x-auto scrollbar-none sticky top-16 sm:top-[72px] z-40">
        <div className="max-w-[1240px] mx-auto flex items-center gap-2 text-xs whitespace-nowrap min-w-max">
          {POLICY_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 ${
                  isActive
                    ? "bg-[#F3D3A2]/15 text-[#F3D3A2] border border-[#F3D3A2]/40 shadow-[0_2px_12px_rgba(243,211,162,0.15)] font-semibold"
                    : "text-[#FCF6E3]/70 hover:text-white hover:bg-white/5 border border-transparent font-medium"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#F3D3A2]" : "text-[#FCF6E3]/50"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Document Body Canvas (Dark Luxury Glass Card) ──────────────────────── */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-white/[0.03] border border-white/10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {children}
        </div>
      </main>

      {/* ── Standardized Official Footer ────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
