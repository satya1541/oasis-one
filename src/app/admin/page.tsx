"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Award,
  RotateCw,
  Building2,
  ShieldCheck,
  Compass,
  Sparkles,
} from "lucide-react";

interface OverviewStats {
  pendingApplications: number;
  activeMembers: number;
  openReports: number;
  pendingAchievements: number;
  totalStartups: number;
  upcomingEvents: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    pendingApplications: 0,
    activeMembers: 0,
    openReports: 0,
    pendingAchievements: 0,
    totalStartups: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [oldestApp, setOldestApp] = useState<{ id: string; name: string; date: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewRes, appsRes] = await Promise.all([
        fetch(`/api/v1/admin/overview?_t=${Date.now()}`, { cache: "no-store" }),
        fetch("/api/v1/admin/applications?status=pending&pageSize=1", { cache: "no-store" }),
      ]);

      if (overviewRes.ok) {
        const json = await overviewRes.json();
        if (json.data) setStats(json.data);
      }

      if (appsRes.ok) {
        const json = await appsRes.json();
        const apps = json.data?.items || json.data || [];
        if (apps.length > 0) {
          const first = apps[0];
          setOldestApp({
            id: first.id,
            name: first.user?.profile?.name || first.user?.email || "Applicant",
            date: new Date(first.submittedAt || first.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
          });
        } else {
          setOldestApp(null);
        }
      }
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-[1180px] mx-auto space-y-8 pb-16 selection:bg-[#88DECC]/30 selection:text-[#03080B]">
      {/* ── Ambient Radial Atmosphere (No video) ───────────────────────────── */}
      <div
        className="fixed top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(136,222,204,0.05)_0%,transparent_70%)] blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(243,211,162,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* ── Editorial Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88DECC]/10 border border-[#88DECC]/25 shadow-[0_0_15px_rgba(136,222,204,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
            <span className="text-[10.5px] font-mono uppercase tracking-widest text-[#88DECC] font-semibold">
              Live Governance Telemetry
            </span>
          </div>
          <h1 className="join-hero-headline text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5FAF6] tracking-tight">
            Governance Console
          </h1>
          <p className="join-hero-subhead text-xs sm:text-sm text-[#ECF1EF]/70 font-sans max-w-2xl leading-relaxed font-normal">
            Real-time applicant triage, audit trails, and ecosystem verification oversight for Odisha founders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#88DECC]/40 text-xs font-mono uppercase tracking-wider text-[#F5FAF6] transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-[#88DECC] ${loading ? "animate-spin" : ""}`} />
          <span>Synchronize</span>
        </button>
      </div>

      {/* ── Four KPI Metric Cards (Connected to Live Database) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Active Members */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#88DECC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all duration-300" />
          <div className="flex items-center justify-between text-xs mb-3 font-mono">
            <span className="uppercase tracking-wider text-[10.5px] text-[#ECF1EF]/60">Active Members</span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[#F5FAF6] tracking-tight">
            {stats.activeMembers}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-[#88DECC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC]" />
            <span>Pre-vetted ecosystem</span>
          </div>
        </div>

        {/* Card 2: Triage Queue */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#F3D3A2]/40 transition-all duration-300 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3D3A2]/20 to-transparent group-hover:via-[#F3D3A2]/50 transition-all duration-300" />
          <div className="flex items-center justify-between text-xs mb-3 font-mono">
            <span className="uppercase tracking-wider text-[10.5px] text-[#ECF1EF]/60">Triage Queue</span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F3D3A2]">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[#F3D3A2] tracking-tight">
            {stats.pendingApplications}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-amber-300/90">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{stats.pendingApplications > 0 ? "Pending committee decision" : "Review queue clear"}</span>
          </div>
        </div>

        {/* Card 3: Conclaves */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-[#88DECC]/30 transition-all duration-300 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/20 to-transparent group-hover:via-[#88DECC]/50 transition-all duration-300" />
          <div className="flex items-center justify-between text-xs mb-3 font-mono">
            <span className="uppercase tracking-wider text-[10.5px] text-[#ECF1EF]/60">Conclaves</span>
            <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[#F5FAF6] tracking-tight">
            {stats.upcomingEvents}
          </div>
          <div className="mt-3 text-[11px] font-mono text-[#ECF1EF]/50">
            Scheduled across Odisha
          </div>
        </div>

        {/* Card 4: Reported Flags */}
        <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/10 hover:border-rose-500/30 transition-all duration-300 relative overflow-hidden group shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent group-hover:via-rose-500/50 transition-all duration-300" />
          <div className="flex items-center justify-between text-xs mb-3 font-mono">
            <span className="uppercase tracking-wider text-[10.5px] text-[#ECF1EF]/60">Reported Flags</span>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-rose-400 tracking-tight">
            {stats.openReports}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-rose-400/90">
            <span className={`w-1.5 h-1.5 rounded-full ${stats.openReports > 0 ? "bg-rose-400 animate-pulse" : "bg-emerald-400"}`} />
            <span>{stats.openReports > 0 ? "Requires committee audit" : "Zero open disputes"}</span>
          </div>
        </div>
      </div>

      {/* ── Priority Action Stream ─────────────────────────────────────────── */}
      <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/30 to-transparent" />
        
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#88DECC] font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Priority Action Stream</span>
          </h2>
          <span className="text-[10px] font-mono text-[#ECF1EF]/50 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10">
            Auto-sorted by committee SLA
          </span>
        </div>

        <div className="divide-y divide-white/10">
          {/* Row 1: Applications */}
          <div className="py-5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center shrink-0 text-[#88DECC] shadow-[0_0_15px_rgba(136,222,204,0.15)]">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[#F5FAF6]">
                  {stats.pendingApplications > 0
                    ? `${stats.pendingApplications} applicant dossier${stats.pendingApplications > 1 ? "s" : ""} awaiting committee vetting`
                    : "Review pool up to date"}
                </p>
                <p className="text-xs text-[#ECF1EF]/60 font-sans leading-relaxed">
                  {oldestApp
                    ? `Earliest submission by ${oldestApp.name} on ${oldestApp.date}`
                    : "No pending founder verification submissions in the triage queue."}
                </p>
              </div>
            </div>
            <Link href="/admin/applications" className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-[#EEF1EA] text-[#03080B] font-medium text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer group"
              >
                <span className="font-sans font-semibold">Open Queue</span>
                <span className="w-6 h-6 rounded-full bg-[#03080B] flex items-center justify-center text-[#EEF1EA] group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </Link>
          </div>

          {/* Row 2: Reports */}
          <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[#F5FAF6]">
                  {stats.openReports > 0
                    ? `${stats.openReports} discussion post${stats.openReports > 1 ? "s" : ""} flagged for moderation`
                    : "Zero content violations reported"}
                </p>
                <p className="text-xs text-[#ECF1EF]/60 font-sans leading-relaxed">
                  {stats.openReports > 0
                    ? "Audit flagged posts and determine community compliance action."
                    : "All active discussions adhere to Odisha startup community guidelines."}
                </p>
              </div>
            </div>
            <Link href="/admin/reports" className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
              >
                <span>Audit Flags</span>
              </button>
            </Link>
          </div>

          {/* Row 3: Achievements */}
          <div className="py-5 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F3D3A2]/10 border border-[#F3D3A2]/25 flex items-center justify-center shrink-0 text-[#F3D3A2]">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-[#F5FAF6]">
                  {stats.pendingAchievements > 0
                    ? `${stats.pendingAchievements} venture milestone${stats.pendingAchievements > 1 ? "s" : ""} pending publication`
                    : "No pending member celebrations"}
                </p>
                <p className="text-xs text-[#ECF1EF]/60 font-sans leading-relaxed">
                  {stats.pendingAchievements > 0
                    ? "Review and authorize milestone celebrations for the community banner."
                    : "Milestone announcements are fully published across member dashboards."}
                </p>
              </div>
            </div>
            <Link href="/admin/achievements" className="w-full sm:w-auto shrink-0">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-[#F5FAF6] text-xs font-medium transition-all cursor-pointer"
              >
                <span>Authorize Milestones</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Governance Sanctuary Quick-Access Hub ────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#ECF1EF]/60 font-semibold">
            Executive Sanctuary Directory
          </h2>
          <span className="text-[10.5px] font-mono text-[#88DECC]">
            Odisha Ecosystem Oversight
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/applications"
            className="join-glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 group hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC] mb-3 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#F5FAF6] group-hover:text-[#88DECC] transition-colors">
              Application Triage
            </h3>
            <p className="text-[11px] text-[#ECF1EF]/60 mt-1 font-sans leading-relaxed">
              Review founder dossiers, evaluate pitch decks &amp; issue admission invites.
            </p>
          </Link>

          <Link
            href="/admin/members"
            className="join-glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 group hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC] mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#F5FAF6] group-hover:text-[#88DECC] transition-colors">
              Member Directory
            </h3>
            <p className="text-[11px] text-[#ECF1EF]/60 mt-1 font-sans leading-relaxed">
              Govern active members, assign Verified Mentor badges, and handle sanctions.
            </p>
          </Link>

          <Link
            href="/admin/startups"
            className="join-glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 group hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F3D3A2] mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#F5FAF6] group-hover:text-[#F3D3A2] transition-colors">
              Verified Startups
            </h3>
            <p className="text-[11px] text-[#ECF1EF]/60 mt-1 font-sans leading-relaxed">
              Showcase Odisha startups, evaluate venture stages &amp; investor readiness.
            </p>
          </Link>

          <Link
            href="/admin/audit-log"
            className="join-glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#88DECC]/40 transition-all duration-300 group hover:-translate-y-0.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#88DECC] mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-[#F5FAF6] group-hover:text-[#88DECC] transition-colors">
              Security &amp; Audit Trail
            </h3>
            <p className="text-[11px] text-[#ECF1EF]/60 mt-1 font-sans leading-relaxed">
              Examine immutable committee records, MFA compliance, and administrative actions.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

