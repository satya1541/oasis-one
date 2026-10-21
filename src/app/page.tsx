"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Rocket,
  Award,
  Sparkles,
  MapPin,
  Lock,
  Search,
  Calendar,
  MessageSquare,
  Users,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[#F3D3A2]/30 selection:text-[#1E1F33]">
      {/* ── Top Bar (Apple-style Translucent Luxury Glass) ───────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[#1E1F33]/85 backdrop-blur-2xl border-b border-[#F3D3A2]/15 px-4 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" priority />

          {/* Desktop & Tablet Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="#membership"
              className="text-xs uppercase tracking-[0.16em] font-medium text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)] transition-colors duration-200"
            >
              Who it's for
            </Link>
            <Link
              href="#how-it-works"
              className="text-xs uppercase tracking-[0.16em] font-medium text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)] transition-colors duration-200"
            >
              Admission
            </Link>
            <Link
              href="#sanctuary"
              className="text-xs uppercase tracking-[0.16em] font-medium text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)] transition-colors duration-200"
            >
              Experience
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors duration-200"
            >
              Log in
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/15 font-medium h-9 px-4.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
              asChild
            >
              <Link href="/join">Join OASIS</Link>
            </Button>
          </nav>

          {/* Mobile Right Bar (<768px) */}
          <div className="flex md:hidden items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/15 font-medium h-8.5 px-3 rounded-full text-xs"
              asChild
            >
              <Link href="/join">Join</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-[var(--brand-cream)]/80 hover:text-[var(--brand-cream)] hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer (<768px) ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#12131F]/80 backdrop-blur-md flex flex-col justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] text-[var(--brand-cream)] animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <BrandLockup variant="horizontal" priority />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col space-y-4 py-8 text-base font-medium">
            <Link
              href="#membership"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Who it's for
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Admission Protocol
            </Link>
            <Link
              href="#sanctuary"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Sanctuary Experience
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Frequently Asked Questions
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Contact &amp; Support
            </Link>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <Button
              variant="gold"
              size="lg"
              className="w-full justify-center rounded-2xl h-12 text-sm font-semibold shadow-lg"
              asChild
            >
              <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                Apply to Join OASIS
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center rounded-2xl h-12 text-sm text-[var(--brand-cream)] border-white/20 hover:bg-white/5"
              asChild
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Member Portal Sign In
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── Hero Section (Cinematic Midnight Navy with Specular Lighting) ────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#151624] via-[#1E1F33] to-[#181928] text-[var(--brand-cream)] px-4 sm:px-8 lg:px-12 pt-12 sm:pt-20 pb-16 sm:pb-28 border-b border-[var(--brand-gold)]/20">
        {/* Apple-grade Atmospheric Ambient Mesh Glows */}
        <div
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 right-10 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(134,96,31,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center relative z-10">
          {/* Hero Content (Left 7 Columns) */}
          <div className="lg:col-span-7 flex flex-col space-y-5 sm:space-y-7">
            {/* Super-title Pill */}
            <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[var(--brand-gold)]/25 backdrop-blur-md w-fit">
              <span className="w-2 h-2 rounded-full bg-[#187952] animate-pulse" />
              <span className="font-display text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[var(--brand-gold)]">
                ODISHA · STARTUP COMMUNITY
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--brand-cream)]/50 hidden sm:inline">
                | Curated &amp; Admin Vetted
              </span>
            </div>

            {/* Monumental Headline */}
            <h1 className="font-display text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-[var(--brand-cream)] leading-[1.12] sm:leading-[1.08]">
              One Community. <br />
              <span className="font-normal text-gold-gradient drop-shadow-[0_2px_12px_rgba(243,211,162,0.2)]">
                Infinite Possibilities.
              </span>
            </h1>

            {/* Cinematic Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[var(--brand-cream)]/80 max-w-xl leading-relaxed font-sans font-normal">
              A private, members-only digital home for Odisha’s 650+ aspiring entrepreneurs, startup founders, and verified mentors. Find your collaborators, ask critical questions, and build lasting companies together.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
              <Button
                variant="gold"
                size="lg"
                className="w-full xs:w-auto justify-center gap-2.5 rounded-full text-sm font-semibold tracking-wide px-7 h-12 shadow-[0_8px_24px_rgba(233,198,140,0.35)]"
                asChild
              >
                <Link href="/join">
                  Apply to Join
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full xs:w-auto justify-center rounded-full text-sm font-medium px-6 h-12 text-[var(--brand-cream)] border-white/20 hover:border-[var(--brand-gold)] hover:bg-white/5"
                asChild
              >
                <Link href="/login">Member Portal Sign In</Link>
              </Button>
            </div>

            {/* Verified Footprint Strip */}
            <div className="pt-5 sm:pt-6 border-t border-[var(--brand-gold)]/15 flex flex-wrap items-center gap-y-2.5 gap-x-5 text-xs text-[var(--brand-cream)]/70 font-sans">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-gold)] shrink-0" />
                <span className="font-medium text-[var(--brand-cream)]">
                  650+ Vetted Members
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--brand-cream)]/60 text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-gold)]/80 shrink-0" />
                <span>Bhubaneswar · Cuttack · Rourkela · Sambalpur</span>
              </div>
            </div>
          </div>

          {/* Astrolabe Motif (Right 5 Columns) with Apple-grade Radial Depth */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative pt-4 lg:pt-0">
            <div className="relative">
              {/* Outer Glow Halo */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(243,211,162,0.18)_0%,transparent_65%)] blur-2xl scale-125" />
              <AstrolabeStar size={440} className="w-[240px] h-[240px] xs:w-[280px] xs:h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Quiet Trust Strip (Warm Ivory Level 2 Surface) ─────────────────────── */}
      <div className="bg-[var(--surface-2)]/80 border-b border-[var(--border)] py-3.5 sm:py-4.5 px-4 sm:px-6 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
            <span className="font-medium text-[var(--text)]">
              Admin review for every candidate before access is granted.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono tracking-wide text-[var(--muted)]">
            <span>NO MARKETING FLUFF</span>
            <span>•</span>
            <span>VERIFIED DIRECTORY</span>
            <span>•</span>
            <span>CLOSED ROUNDTABLES</span>
          </div>
        </div>
      </div>

      {/* ── Section: Interactive Sanctuary Preview (Apple.com-inspired Showcase) ─ */}
      <section id="sanctuary" className="py-24 px-6 lg:px-12 bg-gradient-to-b from-[var(--bg)] to-[var(--surface-2)]/40 relative">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="font-display text-xs uppercase tracking-[0.22em] text-[var(--accent)] font-semibold">
              THE EXPERIENCE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--text)] tracking-tight">
              A Quiet, Focused Workspace.
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
              Designed with the restraint of Linear and Stripe. No flashing banners, no cluttered feeds. Just the people and guidance you need to advance your enterprise.
            </p>
          </div>

          {/* Floating Luxury Mockup Card */}
          <div className="relative mx-auto max-w-5xl rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-[#1E1F33]/90 to-[#12131F]/95 border border-[var(--brand-gold)]/25 shadow-[0_24px_60px_-15px_rgba(30,31,51,0.25)] backdrop-blur-xl">
            {/* Top Bar of the Mockup */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-white/40 tracking-wider">
                  OASIS ONE PORTAL · DASHBOARD
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  REALTIME SECURE
                </span>
              </div>
            </div>

            {/* Inner Dashboard Simulation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-2 sm:p-4 text-white">
              {/* Left Column (Search + Next Up) */}
              <div className="md:col-span-7 space-y-4">
                {/* Search Simulation */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/50 text-sm">
                    <Search className="w-4 h-4 text-[#F3D3A2]" />
                    <span>Search mentors, founders, questions...</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white/10 text-white/60 rounded border border-white/10">
                    ⌘K
                  </kbd>
                </div>

                {/* Event Card Simulation */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#F3D3A2] font-semibold uppercase tracking-wider text-[11px]">
                      UPCOMING ROUNDTABLE
                    </span>
                    <span className="text-white/40">This Saturday · 6:30 PM</span>
                  </div>
                  <h4 className="font-display text-lg text-white font-medium">
                    Founders Demo Night — Bhubaneswar Tech Hub
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Closed-door feedback session with 4 institutional investors and seed-stage operators.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                    <span className="text-emerald-400 font-mono text-[11px]">42 of 60 Registered</span>
                    <span className="text-[#F3D3A2] font-medium hover:underline">Reserve Seat →</span>
                  </div>
                </div>
              </div>

              {/* Right Column (Mentors & Guidance Simulation) */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-[var(--brand-gold)]/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-[#F3D3A2]">
                      VERIFIED ADVISOR
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E9C68C] text-[#1E1F33] text-[10px] font-semibold">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#1E1F33] border border-[#F3D3A2] flex items-center justify-center font-display text-sm font-semibold text-[#F3D3A2]">
                      DB
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Dr. Debashis Barik</h4>
                      <p className="text-xs text-white/60">DeepTech &amp; AI Systems · Bhubaneswar</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    “Helped 14 Odisha startups architect enterprise pilot deployments.”
                  </p>
                  <div className="pt-2">
                    <button className="w-full py-2 rounded-xl bg-white/10 border border-[#F3D3A2]/30 text-xs font-medium text-[#FCF6E3] hover:bg-white/15 transition-all">
                      Request Guidance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Who It's For (Apple-style Horizontal Editorial Rows) ──────── */}
      <section id="membership" className="py-24 px-6 lg:px-12 bg-[var(--bg)] scroll-mt-20 border-t border-[var(--border)]">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-14">
            <span className="font-display text-xs uppercase tracking-[0.22em] text-[var(--accent)] font-semibold">
              MEMBERSHIP TIERS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--text)] mt-2 tracking-tight">
              Built for Every Phase of the Journey
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-1.5 max-w-xl">
              OASIS brings together three interdependent groups across Odisha’s startup ecosystem to accelerate growth with zero friction.
            </p>
          </div>

          {/* Three Editorial Rows */}
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {/* Row 1: Aspiring Entrepreneurs */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors duration-200 hover:bg-[var(--surface-2)]/30 px-3 rounded-xl">
              <div className="md:col-span-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--border)] text-[var(--accent)] shrink-0 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Aspiring Entrepreneurs
                  </h3>
                  <Badge variant="aspiring" className="mt-1.5">
                    Ideation &amp; Validation
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed space-y-1">
                <p className="font-medium text-base text-[var(--text)]">
                  Validate your problem statement before investing capital.
                </p>
                <p className="text-[var(--muted)]">
                  Connect with serial founders, test customer hypotheses in closed roundtables, and find potential co-founders who complement your skill set.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right font-mono">
                Student &amp; Early Builders
              </div>
            </div>

            {/* Row 2: Startup Founders */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors duration-200 hover:bg-[var(--surface-2)]/30 px-3 rounded-xl">
              <div className="md:col-span-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-navy)] flex items-center justify-center border border-[var(--brand-gold)]/30 text-[var(--brand-gold)] shrink-0 shadow-sm">
                  <Rocket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Founders &amp; Co-founders
                  </h3>
                  <Badge variant="founder" className="mt-1.5">
                    Building &amp; Scaling
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed space-y-1">
                <p className="font-medium text-base text-[var(--text)]">
                  Execute faster with direct, peer-level intelligence.
                </p>
                <p className="text-[var(--muted)]">
                  Ask targeted questions, navigate government grant applications, hire key engineering talent, and secure enterprise pilot introductions in Odisha.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right font-mono">
                DeepTech · Agri · Climate · FinTech
              </div>
            </div>

            {/* Row 3: Mentors & Advisors */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline transition-colors duration-200 hover:bg-[var(--surface-2)]/30 px-3 rounded-xl">
              <div className="md:col-span-4 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center border border-[var(--accent)]/40 text-[var(--accent)] shrink-0 shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-medium text-[var(--text)]">
                    Mentors &amp; Advisors
                  </h3>
                  <Badge variant="verified-mentor" className="mt-1.5">
                    Verified Advisory
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-5 text-sm text-[var(--text)] leading-relaxed space-y-1">
                <p className="font-medium text-base text-[var(--text)]">
                  Give back on your own terms with protected privacy.
                </p>
                <p className="text-[var(--muted)]">
                  Controlled connection requests (strictly max 10/day quota), verified credentials, and clinical 1-on-1 sessions with founders who respect your time.
                </p>
              </div>
              <div className="md:col-span-3 text-xs text-[var(--muted)] md:text-right font-mono">
                Operators · CXOs · Investors
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: How Admission Works (Cinematic 3-Stage Progression) ────────── */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-[var(--surface-2)]/50 border-t border-[var(--border)] scroll-mt-20">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-16">
            <span className="font-display text-xs uppercase tracking-[0.22em] text-[var(--accent)] font-semibold">
              ADMISSION PROTOCOL
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[var(--text)] mt-2 tracking-tight">
              Three Steps to Verified Membership
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-1.5 max-w-lg">
              Admission is exclusively by application to preserve high community integrity and mutual trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="card-luxury p-8 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-light text-[var(--accent)] mb-4 block">
                  01
                </span>
                <h3 className="font-display text-xl font-medium text-[var(--text)] mb-2.5">
                  Submit Application
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Complete our 3-minute application detailing your startup concept, current stage, and the support or insights you seek.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[var(--border)] text-xs text-[var(--muted)] font-mono">
                Takes ~3 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-luxury p-8 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-light text-[var(--accent)] mb-4 block">
                  02
                </span>
                <h3 className="font-display text-xl font-medium text-[var(--text)] mb-2.5">
                  Admin Verification
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  An administrator reviews your background and profile alignment. If needed, you can communicate directly via real-time dashboard messages.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[var(--border)] text-xs text-[var(--muted)] font-mono">
                Reply within 48 hours
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-luxury p-8 relative flex flex-col justify-between">
              <div>
                <span className="font-mono text-3xl font-light text-[var(--accent)] mb-4 block">
                  03
                </span>
                <h3 className="font-display text-xl font-medium text-[var(--text)] mb-2.5">
                  Sanctuary Unlocks
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Upon approval, your entire portal unlocks automatically with real-time websocket sync. Connect with mentors and participate in closed roundtables.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[var(--border)] text-xs text-[var(--muted)] font-mono">
                Full Ecosystem Access
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-md" asChild>
              <Link href="/join">Start Your Application</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Section: Final Call to Action (Apple Luxury Monolith) ──────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-[#181928] to-[#12131F] text-[var(--brand-cream)] text-center relative overflow-hidden border-t border-[var(--brand-gold)]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,211,162,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="font-display text-xs uppercase tracking-[0.25em] text-[var(--brand-gold)] font-medium">
            YOUR COMMUNITY IS WAITING
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-light text-[var(--brand-cream)] tracking-tight leading-tight">
            Build the Future of Odisha Together.
          </h2>
          <p className="text-sm sm:text-base text-[var(--brand-cream)]/75 max-w-xl mx-auto leading-relaxed">
            Join 650+ founders, operators, and advisors creating enduring value across the state.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="gold" className="rounded-full px-8 shadow-lg" asChild>
              <Link href="/join">Apply to Join OASIS</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-7" asChild>
              <Link href="/login">Member Portal Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
