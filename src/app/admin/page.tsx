"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  FileCheck2,
  Users,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  RotateCw,
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
        fetch("/api/v1/admin/overview"),
        fetch("/api/v1/admin/applications?status=pending&pageSize=1"),
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
    <div className="max-w-[1040px] mx-auto space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
              Live Governance Telemetry
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
            Governance Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] font-sans">
            Real-time applicant triage, audit logs, and member verification oversight.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="gap-2 rounded-2xl text-xs px-4 py-2 cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#86601F] dark:text-[#F3D3A2]" : ""}`} />
          <span>Synchronize</span>
        </Button>
      </div>

      {/* ── Four KPI Metric Cards (Connected to Live Database) ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/30 dark:hover:border-[#F3D3A2]/30 shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-mono">
            <span className="uppercase tracking-wider text-[11px]">Active Members</span>
            <Users className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[var(--text)] tracking-tight">
            {stats.activeMembers}
          </div>
          <div className="mt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            Pre-vetted ecosystem
          </div>
        </div>

        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/30 dark:hover:border-[#F3D3A2]/30 shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-mono">
            <span className="uppercase tracking-wider text-[11px]">Triage Queue</span>
            <FileCheck2 className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[#86601F] dark:text-[#F3D3A2] tracking-tight">
            {stats.pendingApplications}
          </div>
          <div className="mt-2 text-[11px] font-mono text-amber-600 dark:text-amber-400">
            {stats.pendingApplications > 0 ? "Pending committee decision" : "Review queue clear"}
          </div>
        </div>

        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/30 dark:hover:border-[#F3D3A2]/30 shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-mono">
            <span className="uppercase tracking-wider text-[11px]">Conclaves</span>
            <Calendar className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-[var(--text)] tracking-tight">
            {stats.upcomingEvents}
          </div>
          <div className="mt-2 text-[11px] font-mono text-[var(--muted)]">
            Scheduled across Odisha
          </div>
        </div>

        <div className="group rounded-3xl p-6 bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 hover:border-[#86601F]/30 dark:hover:border-[#F3D3A2]/30 shadow-xs hover:shadow-lg transition-all duration-300 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-2 font-mono">
            <span className="uppercase tracking-wider text-[11px]">Reported Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-display font-light text-rose-600 dark:text-rose-400 tracking-tight">
            {stats.openReports}
          </div>
          <div className="mt-2 text-[11px] font-mono text-rose-600/80 dark:text-rose-400/80">
            {stats.openReports > 0 ? "Requires committee audit" : "Zero open disputes"}
          </div>
        </div>
      </div>

      {/* ── Needs Your Attention Section ───────────────────────────────────────── */}
      <div className="bg-[var(--surface)] border border-[#EAE1CF] dark:border-[#2C2E4A]/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
            Priority Action Stream
          </h2>
          <span className="text-[11px] font-mono text-[var(--muted)]">
            Auto-sorted by SLA
          </span>
        </div>

        <div className="divide-y divide-[#EAE1CF]/70 dark:divide-[#2C2E4A]/80">
          {/* Row 1: Applications */}
          <div className="py-5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 flex items-center justify-center shrink-0 text-[#86601F] dark:text-[#F3D3A2] shadow-2xs">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.pendingApplications > 0
                    ? `${stats.pendingApplications} applicant dossier${stats.pendingApplications > 1 ? "s" : ""} awaiting committee vetting`
                    : "Review pool up to date"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5 font-sans">
                  {oldestApp
                    ? `Earliest submission by ${oldestApp.name} on ${oldestApp.date}`
                    : "No pending founder verification submissions in the triage queue."}
                </p>
              </div>
            </div>
            <Link href="/admin/applications">
              <Button size="sm" className="gap-2 rounded-2xl text-xs px-5 py-2 w-full sm:w-auto cursor-pointer">
                <span>Open Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Row 2: Reports */}
          <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500 shadow-2xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.openReports > 0
                    ? `${stats.openReports} discussion post${stats.openReports > 1 ? "s" : ""} flagged for moderation`
                    : "Zero content violations reported"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5 font-sans">
                  {stats.openReports > 0
                    ? "Audit flagged posts and determine community compliance action."
                    : "All active discussions adhere to Odisha startup community guidelines."}
                </p>
              </div>
            </div>
            <Link href="/admin/reports">
              <Button variant="secondary" size="sm" className="gap-2 rounded-2xl text-xs px-5 py-2 w-full sm:w-auto cursor-pointer">
                <span>Audit Flags</span>
              </Button>
            </Link>
          </div>

          {/* Row 3: Achievements */}
          <div className="py-5 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {stats.pendingAchievements > 0
                    ? `${stats.pendingAchievements} venture milestone${stats.pendingAchievements > 1 ? "s" : ""} pending publication`
                    : "No pending member celebrations"}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5 font-sans">
                  {stats.pendingAchievements > 0
                    ? "Review and authorize milestone celebrations for the community banner."
                    : "Milestone announcements are fully published across member dashboards."}
                </p>
              </div>
            </div>
            <Link href="/admin/achievements">
              <Button variant="secondary" size="sm" className="gap-2 rounded-2xl text-xs px-5 py-2 w-full sm:w-auto cursor-pointer">
                <span>Authorize Milestones</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
