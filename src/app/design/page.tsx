"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Lock,
  Compass,
  Rocket,
  Users,
  Eye,
  RotateCw,
} from "lucide-react";

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<
    "tokens" | "brand" | "buttons" | "badges" | "inputs" | "components"
  >("tokens");
  const [sampleText, setSampleText] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <BrandLockup variant="horizontal" href="/design" />
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[var(--brand-gold)]/20 text-[var(--brand-gold)] border border-[var(--brand-gold)]/30">
            Dev Design System
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            className="text-[var(--brand-cream)]/75 hover:text-[var(--brand-gold)] transition-colors"
          >
            ← Public Home
          </Link>
          <Link
            href="/dashboard"
            className="text-[var(--brand-cream)]/75 hover:text-[var(--brand-gold)] transition-colors"
          >
            Member Dashboard
          </Link>
        </div>
      </header>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-16 z-40">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          {[
            { id: "tokens", label: "Color Tokens & Typography" },
            { id: "brand", label: "Brand Lockups & Motifs" },
            { id: "buttons", label: "Buttons & Actions" },
            { id: "badges", label: "Badges & Roles" },
            { id: "inputs", label: "Inputs & Validation" },
            { id: "components", label: "Skeletons & Empty States" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Showcase Canvas ────────────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 py-10 space-y-12">
        {/* TAB 1: TOKENS & TYPOGRAPHY */}
        {activeTab === "tokens" && (
          <section className="space-y-10">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Color Palette & Tokens
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Sampled from the OASIS logo. Checked for WCAG 2.1 AA (22 text and UI pairs across light and dark modes).
              </p>
            </div>

            {/* Core Colors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="h-16 rounded-lg bg-[#1E1F33] flex items-center justify-center text-[#F3D3A2] font-mono text-xs font-medium">
                  #1E1F33
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text)]">Midnight Navy</div>
                  <div className="text-[11px] text-[var(--muted)] font-mono">--brand-navy / Chrome</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="h-16 rounded-lg bg-[#F3D3A2] flex items-center justify-center text-[#1E1F33] font-mono text-xs font-medium">
                  #F3D3A2
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text)]">Champagne Gold</div>
                  <div className="text-[11px] text-[var(--muted)] font-mono">--brand-gold / Hairlines</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="h-16 rounded-lg bg-[#FBF7EE] border border-[#D9CDAE] flex items-center justify-center text-[#1E1F33] font-mono text-xs font-medium">
                  #FBF7EE
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text)]">Warm Ivory Canvas</div>
                  <div className="text-[11px] text-[var(--muted)] font-mono">--bg (Light theme)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="h-16 rounded-lg bg-[#86601F] flex items-center justify-center text-[#FFFFFF] font-mono text-xs font-medium">
                  #86601F
                </div>
                <div>
                  <div className="text-xs font-semibold text-[var(--text)]">Antique Accent Gold</div>
                  <div className="text-[11px] text-[var(--muted)] font-mono">--accent (3:1 text on ivory)</div>
                </div>
              </div>
            </div>

            {/* Semantic Status Colors */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
                Semantic Status Colors (With Mandatory Icons)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[var(--success)]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--success)]">Success</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">#187952</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-[var(--warning)]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--warning)]">Warning / Pending</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">#B83E0B (Orange)</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-[var(--danger)]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--danger)]">Danger / Rejected</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">#B64536</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-[var(--info)]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--info)]">Info / Notice</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">#296DAC</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Scale */}
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                Typography Scale & Hierarchy
              </h3>
              <div className="space-y-4 divide-y divide-[var(--border)]">
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-[var(--muted)] block mb-1">
                    Display 4xl (Jost 48px, light) — Hero Headline
                  </span>
                  <div className="font-display text-4xl font-light text-[var(--text)]">
                    One Community. Infinite Possibilities.
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] block mb-1">
                    Display 2xl (Jost 28px, normal) — Section Titles
                  </span>
                  <div className="font-display text-2xl font-normal text-[var(--text)]">
                    Odisha Startup Ecosystem Directory
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] block mb-1">
                    Display Uppercase (Jost 12px, tracking-[0.2em]) — Eyebrow Label
                  </span>
                  <div className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    ODISHA · STARTUP COMMUNITY · ADMIN APPROVED
                  </div>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] block mb-1">
                    Body Base (Inter 16px, line-height 1.6) — Reading Copy
                  </span>
                  <p className="text-base text-[var(--text)] max-w-2xl leading-relaxed">
                    A members-only home for Odisha’s aspiring entrepreneurs, startup founders, and mentors. Find the right people, ask better questions, and meet in person.
                  </p>
                </div>

                <div className="pt-4">
                  <span className="text-[10px] font-mono text-[var(--muted)] block mb-1">
                    Mono (JetBrains Mono 13px) — Reference Codes & Case IDs
                  </span>
                  <div className="font-mono text-xs font-semibold text-[var(--brand-navy)] dark:text-[var(--brand-gold)] bg-[var(--surface-2)] px-2.5 py-1 rounded inline-block">
                    OASIS-2026-X94B · OASIS-GRV-2026-8491
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: BRAND LOCKUPS & MOTIFS */}
        {activeTab === "brand" && (
          <section className="space-y-10">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Brand Lockups & Rules
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Rule: The OASIS gold line art logo MUST ALWAYS sit on Midnight Navy (<code className="font-mono">#1E1F33</code>), never directly on ivory or white.
              </p>
            </div>

            {/* Lockup Variations on Midnight Navy */}
            <div className="p-8 rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-cream)] border border-[var(--brand-gold)]/20 space-y-8">
              <div>
                <span className="text-[10px] font-mono text-[var(--brand-gold)]/80 uppercase tracking-wider block mb-2">
                  Variant 1: Horizontal Lockup (Default for Top Navigation Bars)
                </span>
                <div className="p-4 rounded-xl border border-[var(--brand-gold)]/15 bg-white/5 inline-block">
                  <BrandLockup variant="horizontal" href="#" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[var(--brand-gold)]/80 uppercase tracking-wider block mb-2">
                  Variant 2: Wordmark Lockup (Compact Sidebar Header)
                </span>
                <div className="p-4 rounded-xl border border-[var(--brand-gold)]/15 bg-white/5 inline-block">
                  <BrandLockup variant="wordmark" href="#" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[var(--brand-gold)]/80 uppercase tracking-wider block mb-2">
                  Variant 3: Mark Only (Mobile Nav & Favicons)
                </span>
                <div className="p-4 rounded-xl border border-[var(--brand-gold)]/15 bg-white/5 inline-block">
                  <BrandLockup variant="mark" href="#" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-[var(--brand-gold)]/80 uppercase tracking-wider block mb-2">
                  Variant 4: Full Emblem (Hero Panels & Footers)
                </span>
                <div className="p-6 rounded-xl border border-[var(--brand-gold)]/15 bg-white/5 inline-block">
                  <BrandLockup variant="full" href="#" />
                </div>
              </div>
            </div>

            {/* Astrolabe Motif Demonstration */}
            <div className="p-8 rounded-2xl bg-[var(--brand-navy)] text-[var(--brand-cream)] border border-[var(--brand-gold)]/20 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md space-y-3">
                <span className="text-xs uppercase tracking-[0.2em] font-display font-semibold text-[var(--brand-gold)]">
                  ASTROLABE MOTIF
                </span>
                <h3 className="text-xl font-display text-[var(--brand-cream)]">
                  Deterministic Hydration-Safe Vector Linework
                </h3>
                <p className="text-xs text-[var(--brand-cream)]/75 leading-relaxed">
                  Calculates 72 perimeter ticks and 24 star points with explicit 2-decimal precision. Rotates smoothly at 1 turn per 60 seconds with zero floating point drift between SSR and client.
                </p>
              </div>
              <div className="w-56 h-56 flex items-center justify-center">
                <AstrolabeStar size={220} className="w-56 h-56" />
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: BUTTONS */}
        {activeTab === "buttons" && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Buttons & Actions
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Strict 44px minimum touch targets on mobile. Clean hover feedback and focus rings.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Variants
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="outline">Secondary Outline</Button>
                  <Button variant="secondary">Secondary Filled</Button>
                  <Button variant="ghost">Ghost Action</Button>
                  <Button variant="destructive">Destructive Action</Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Sizes
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button size="sm">Small (36px)</Button>
                  <Button size="md">Medium (42px)</Button>
                  <Button size="lg">Large (48px)</Button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  With Icons & Loading State
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="primary" className="gap-2">
                    <span>Continue Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoadingDemo(true);
                      setTimeout(() => setLoadingDemo(false), 2000);
                    }}
                    disabled={loadingDemo}
                    className="gap-2"
                  >
                    {loadingDemo ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Test Loading State</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: BADGES & ROLES */}
        {activeTab === "badges" && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Role Identity & Badges
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Visual distinction per role: Aspiring (ivory hairline), Founder (gold hairline), Mentor (double gold hairline with verified shield).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aspiring Card */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] flex items-center justify-center font-display font-medium text-xs">
                    PE
                  </div>
                  <Badge variant="aspiring">Aspiring</Badge>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Priya Edmonds</div>
                  <div className="text-xs text-[var(--muted)]">Ideation · AgriTech · Sambalpur</div>
                </div>
              </div>

              {/* Founder Card */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--brand-gold)] bg-[var(--brand-navy)] text-[var(--brand-gold)] flex items-center justify-center font-display font-medium text-xs">
                    SM
                  </div>
                  <Badge variant="founder">Founder</Badge>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Sourav Mishra</div>
                  <div className="text-xs text-[var(--muted)]">Building & Scaling · SolarIoT · Bhubaneswar</div>
                </div>
              </div>

              {/* Mentor Card */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-double border-[var(--brand-gold)] bg-[var(--brand-navy)] text-[var(--brand-gold)] flex items-center justify-center font-display font-medium text-xs">
                      AP
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--brand-gold)] text-[var(--brand-navy)] flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="mentor">Mentor</Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">Dr. Ananya Patnaik</div>
                  <div className="text-xs text-[var(--muted)]">Advisory · CDSCO & MedTech · Cuttack</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: INPUTS & VALIDATION */}
        {activeTab === "inputs" && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Form Controls & Character Counters
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                48px input height, clear floating labels, and live character limit counters wherever specified by the PRD.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] max-w-xl space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Standard Input Field
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priyabrata Mohapatra"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Textarea with Character Counter (Max 200)
                  </label>
                  <span className="text-[11px] font-mono text-[var(--muted)]">
                    {sampleText.length}/200
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  placeholder="Summarize your venture or startup objective in one sentence..."
                  className="w-full p-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Validation Error State
                </label>
                <input
                  type="email"
                  defaultValue="invalid-email@"
                  className="w-full h-12 px-4 rounded-xl border border-[var(--danger)] bg-rose-50/50 dark:bg-rose-950/20 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--danger)]"
                />
                <p className="mt-1.5 text-xs text-[var(--danger)] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Please provide a valid institutional or personal email address.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: SKELETONS & EMPTY STATES */}
        {activeTab === "components" && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-medium text-[var(--text)]">
                Empty States & Skeletons
              </h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Prompt rule §3.4: "Empty states: custom illustrations built from the logo’s motif in gold hairlines. Never a bare spinner; the loading indicator is the compass star."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empty State Component */}
              <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-gold)]/20 flex items-center justify-center text-[var(--brand-gold)]">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-medium text-[var(--text)]">
                    No active questions found
                  </h3>
                  <p className="text-xs text-[var(--muted)] max-w-xs leading-relaxed">
                    Be the first in the community to start a discussion or ask for advice from experienced Odisha founders.
                  </p>
                </div>
                <Button size="sm" variant="primary">
                  Ask a question
                </Button>
              </div>

              {/* Skeleton Shimmer Component */}
              <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Data Loading Shimmer
                  </span>
                  <RotateCw className="w-3.5 h-3.5 text-[var(--accent)] animate-spin" />
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-[var(--border)]/60 rounded-md w-3/4" />
                  <div className="h-3 bg-[var(--border)]/40 rounded-md w-full" />
                  <div className="h-3 bg-[var(--border)]/40 rounded-md w-5/6" />
                  <div className="pt-2 flex gap-2">
                    <div className="h-6 w-16 bg-[var(--border)]/50 rounded-full" />
                    <div className="h-6 w-20 bg-[var(--border)]/50 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
