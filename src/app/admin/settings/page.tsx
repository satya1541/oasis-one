"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Scale,
  Save,
  RotateCw,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Shield,
  Lock,
  Network,
  Database,
  Building,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsState {
  min_age: string;
  cooling_off_days: string;
  application_retention_days: string;
  invite_expiry_days: string;
  support_email: string;
  grievance_email: string;
  oversight_email: string;
  max_connection_requests_24h: string;
  connection_expiry_days: string;
  connection_cooldown_days: string;
  achievement_expiry_hours: string;
  inactivity_warning_months: string;
  inactivity_deactivate_months: string;
  report_retention_days: string;
  audit_retention_days: string;
  app_name: string;
}

const PRD_DEFAULTS: SettingsState = {
  min_age: "18",
  cooling_off_days: "30",
  application_retention_days: "90",
  invite_expiry_days: "14",
  support_email: "support@oasis.community",
  grievance_email: "grievance@oasis.community",
  oversight_email: "oversight@oasis.community",
  max_connection_requests_24h: "10",
  connection_expiry_days: "14",
  connection_cooldown_days: "7",
  achievement_expiry_hours: "24",
  inactivity_warning_months: "12",
  inactivity_deactivate_months: "15",
  report_retention_days: "365",
  audit_retention_days: "1095",
  app_name: "OASIS",
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<SettingsState>(PRD_DEFAULTS);
  const [initialSettings, setInitialSettings] = useState<SettingsState>(PRD_DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState<"admissions" | "dpdp" | "network" | "retention" | "platform">("admissions");

  // Check if form is dirty
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const fetchSettingsAndAuth = async () => {
    try {
      setLoading(true);
      const [meRes, settingsRes] = await Promise.all([
        fetch("/api/v1/auth/me"),
        fetch("/api/v1/admin/settings"),
      ]);

      if (meRes.ok) {
        const meJson = await meRes.json();
        const level = meJson.data?.adminLevel;
        setIsSuperAdmin(level === "super_admin");
      }

      if (settingsRes.ok) {
        const json = await settingsRes.json();
        const list: { key: string; value: string }[] = json.data || [];
        const map: Record<string, string> = {};
        for (const s of list) {
          map[s.key] = s.value;
        }

        const loaded: SettingsState = {
          min_age: map.min_age || PRD_DEFAULTS.min_age,
          cooling_off_days: map.cooling_off_days || PRD_DEFAULTS.cooling_off_days,
          application_retention_days: map.application_retention_days || PRD_DEFAULTS.application_retention_days,
          invite_expiry_days: map.invite_expiry_days || PRD_DEFAULTS.invite_expiry_days,
          support_email: map.support_email || PRD_DEFAULTS.support_email,
          grievance_email: map.grievance_email || PRD_DEFAULTS.grievance_email,
          oversight_email: map.oversight_email || PRD_DEFAULTS.oversight_email,
          max_connection_requests_24h: map.max_connection_requests_24h || PRD_DEFAULTS.max_connection_requests_24h,
          connection_expiry_days: map.connection_expiry_days || PRD_DEFAULTS.connection_expiry_days,
          connection_cooldown_days: map.connection_cooldown_days || PRD_DEFAULTS.connection_cooldown_days,
          achievement_expiry_hours: map.achievement_expiry_hours || PRD_DEFAULTS.achievement_expiry_hours,
          inactivity_warning_months: map.inactivity_warning_months || PRD_DEFAULTS.inactivity_warning_months,
          inactivity_deactivate_months: map.inactivity_deactivate_months || PRD_DEFAULTS.inactivity_deactivate_months,
          report_retention_days: map.report_retention_days || PRD_DEFAULTS.report_retention_days,
          audit_retention_days: map.audit_retention_days || PRD_DEFAULTS.audit_retention_days,
          app_name: map.app_name || PRD_DEFAULTS.app_name,
        };

        setSettings(loaded);
        setInitialSettings(loaded);
      } else if (settingsRes.status === 403) {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndAuth();
  }, []);

  const handleChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setNotice(null);

      // Basic client validation
      if (parseInt(settings.min_age, 10) < 16) {
        throw new Error("Minimum age gate cannot be below 16 years.");
      }
      if (!settings.support_email.includes("@") || !settings.grievance_email.includes("@")) {
        throw new Error("Please specify valid email addresses for DPDP legal contacts.");
      }

      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setInitialSettings(settings);
        setNotice({
          type: "success",
          message: "Governance policies successfully committed and recorded in immutable audit logs.",
        });
        setTimeout(() => setNotice(null), 5000);
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to persist governance settings");
      }
    } catch (err: any) {
      setNotice({
        type: "error",
        message: err.message || "Failed to commit settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const confirmed = window.confirm(
      "Are you sure you want to restore all governance parameters to their official Oasis PRD baseline defaults?"
    );
    if (!confirmed) return;
    setSettings(PRD_DEFAULTS);
  };

  const handleDiscardChanges = () => {
    setSettings(initialSettings);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-xs text-[#ECF1EF]/60 gap-3">
        <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
        <span className="font-mono">Loading governance configuration...</span>
      </div>
    );
  }

  if (isSuperAdmin === false) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-light text-white">Super Administrator Access Required</h1>
        <p className="text-xs text-[#A9A7C4]">
          Global threshold configuration and legal compliance parameters are strictly reserved for Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-24">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-[#D4AF37] tracking-wider font-semibold">
              Root Governance
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-light font-display text-[#F5FAF6] tracking-tight mt-1">
            Admin Governance &amp; Policy Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans mt-0.5">
            Configure admissions gates, DPDP Act statutory contacts, network rate limits, and data retention thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={fetchSettingsAndAuth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-[#ECF1EF] text-xs transition-colors cursor-pointer"
            title="Reload settings from database"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#88DECC]" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-[#ECF1EF]/70 hover:text-white text-xs transition-colors cursor-pointer"
            title="Restore PRD default parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Defaults</span>
          </button>
        </div>
      </div>

      {/* ── Status Toast ──────────────────────────────────────────────────────── */}
      {notice && (
        <div
          className={cn(
            "p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200",
            notice.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          )}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Section Navigator Tabs ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2 text-xs">
        {[
          { id: "admissions", label: "Admissions & Gates", icon: Scale },
          { id: "dpdp", label: "DPDP & Statutory Contacts", icon: Mail },
          { id: "network", label: "Network & Rate Limits", icon: Network },
          { id: "retention", label: "Lifecycles & Retention", icon: Clock },
          { id: "platform", label: "Platform Identity", icon: Building },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium text-xs",
                isActive
                  ? "bg-[#88DECC]/15 border border-[#88DECC]/40 text-[#88DECC] shadow-[0_0_15px_rgba(136,222,204,0.15)] font-semibold"
                  : "bg-white/[0.02] border border-transparent text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── 1. Admissions & Eligibility Gates ───────────────────────────────── */}
        {activeSection === "admissions" && (
          <div className="join-glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-light text-[#F5FAF6]">
                    Admissions &amp; Age Gate Criteria
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/60">
                    Thresholds for cohort admission vetting, age verification, and cooling-off intervals.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/20">
                PRD §10.1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Minimum Age Gate (Years)
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Required</span>
                </div>
                <input
                  type="number"
                  min={16}
                  max={100}
                  required
                  value={settings.min_age}
                  onChange={(e) => handleChange("min_age", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Minimum age verified during signup consent. Defaults to 18 per Indian legal majority laws.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Rejection Cooling-Off (Days)
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Cooldown</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={365}
                  required
                  value={settings.cooling_off_days}
                  onChange={(e) => handleChange("cooling_off_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Number of days a rejected applicant must wait before re-submitting their admission dossier.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Application Dossier Retention (Days)
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Privacy</span>
                </div>
                <input
                  type="number"
                  min={7}
                  max={730}
                  required
                  value={settings.application_retention_days}
                  onChange={(e) => handleChange("application_retention_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Days unadmitted application documents (pitch decks, proof of company) are kept before auto-cleanup.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Invite Link Lifespan (Days)
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Onboarding</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={90}
                  required
                  value={settings.invite_expiry_days}
                  onChange={(e) => handleChange("invite_expiry_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Validity duration for pre-approved cohort admissions invite tokens before cryptographic expiry.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. DPDP Legal & Grievance Contact Channels ─────────────────────── */}
        {activeSection === "dpdp" && (
          <div className="join-glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-light text-[#F5FAF6]">
                    DPDP Act Compliance &amp; Statutory Contacts
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/60">
                    Mandatory statutory channels published under India Digital Personal Data Protection Act 2023.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/20">
                DPDP 2023 §11
              </span>
            </div>

            <div className="space-y-4 text-xs pt-1">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Statutory Grievance Redressal Officer Email
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">Section 11(1) Mandate</span>
                </div>
                <input
                  type="email"
                  required
                  value={settings.grievance_email}
                  onChange={(e) => handleChange("grievance_email", e.target.value)}
                  placeholder="grievance@oasis.community"
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Published in the public Privacy Policy for data principal grievances and consent revocation disputes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Community Support &amp; Member Inquiries Email
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Support Desk</span>
                </div>
                <input
                  type="email"
                  required
                  value={settings.support_email}
                  onChange={(e) => handleChange("support_email", e.target.value)}
                  placeholder="support@oasis.community"
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  General inquiries, founder support, mentor coordination, and technical help desk routing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold">
                    Regulatory &amp; Government Oversight Email
                  </label>
                  <span className="text-[10px] font-mono text-[#88DECC]">Govt / Startup Odisha</span>
                </div>
                <input
                  type="email"
                  required
                  value={settings.oversight_email}
                  onChange={(e) => handleChange("oversight_email", e.target.value)}
                  placeholder="oversight@oasis.community"
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Designated address for communications with Startup Odisha, incubators, and state innovation agencies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. Network & Rate Limits ────────────────────────────────────────── */}
        {activeSection === "network" && (
          <div className="join-glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-light text-[#F5FAF6]">
                    Network Rate Limits &amp; Cooldown Controls
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/60">
                    Anti-spam protection, connection velocity controls, and community achievement tickers.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/20">
                PRD §8.3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Max Connection Requests (24h)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={settings.max_connection_requests_24h}
                  onChange={(e) => handleChange("max_connection_requests_24h", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Maximum outbound connection requests an individual member can initiate per day to prevent scraping.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Connection Request Expiry (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  required
                  value={settings.connection_expiry_days}
                  onChange={(e) => handleChange("connection_expiry_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Days a pending connection request remains unanswered before automatically lapsing.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Declined Connection Cooldown (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  required
                  value={settings.connection_cooldown_days}
                  onChange={(e) => handleChange("connection_cooldown_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Cooldown interval required before an applicant can re-request connection with someone who declined.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Achievement Spotlight Expiry (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  required
                  value={settings.achievement_expiry_hours}
                  onChange={(e) => handleChange("achievement_expiry_hours", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Duration an approved founder win remains highlighted in the real-time community milestone banner.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. Lifecycles & Retention ────────────────────────────────────────── */}
        {activeSection === "retention" && (
          <div className="join-glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-light text-[#F5FAF6]">
                    Inactivity Lifecycles &amp; Data Retention
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/60">
                    Audit log preservation, account inactivity triggers, and disciplinary report retention.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/20">
                PRD §14.2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Inactivity Warning Trigger (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={settings.inactivity_warning_months}
                  onChange={(e) => handleChange("inactivity_warning_months", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Dormancy window before an automated email warning is dispatched alerting member of upcoming deactivation.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Automatic Deactivation Trigger (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={settings.inactivity_deactivate_months}
                  onChange={(e) => handleChange("inactivity_deactivate_months", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Total dormancy duration before account status transitions to suspended/deactivated.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  Content Report Retention (Days)
                </label>
                <input
                  type="number"
                  min={30}
                  max={3650}
                  required
                  value={settings.report_retention_days}
                  onChange={(e) => handleChange("report_retention_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Duration resolved moderation tickets and content report evidence are preserved.
                </p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                  System Audit Log Retention (Days)
                </label>
                <input
                  type="number"
                  min={365}
                  max={3650}
                  required
                  value={settings.audit_retention_days}
                  onChange={(e) => handleChange("audit_retention_days", e.target.value)}
                  className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
                />
                <p className="text-[10.5px] text-[#ECF1EF]/50">
                  Mandatory retention period for cryptographic audit trails. Defaults to 3 years (1095 days).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. Platform Identity ────────────────────────────────────────────── */}
        {activeSection === "platform" && (
          <div className="join-glass-panel rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#88DECC]/10 border border-[#88DECC]/25 flex items-center justify-center text-[#88DECC]">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-light text-[#F5FAF6]">
                    Platform Identity &amp; Ecosystem Branding
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/60">
                    System-wide legal name, email subject branding, and ecosystem signatures.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/20">
                Brand Registry
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs">
              <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/80 font-semibold block">
                Platform Name
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={settings.app_name}
                onChange={(e) => handleChange("app_name", e.target.value)}
                placeholder="OASIS"
                className="w-full h-10 px-3.5 bg-white/[0.04] border border-white/12 rounded-xl text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none transition-all font-mono"
              />
              <p className="text-[10.5px] text-[#ECF1EF]/50">
                Primary name utilized across email notification templates, legal consents, and browser headers.
              </p>
            </div>
          </div>
        )}

        {/* ── Floating Action Bar for Unsaved Changes ────────────────────────── */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2 text-xs">
            {isDirty ? (
              <span className="flex items-center gap-2 text-amber-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                You have unsaved governance modifications.
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-400 font-mono">
                <Check className="w-3.5 h-3.5" />
                All policies synchronized with database.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-4 py-2 rounded-full border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-white hover:bg-white/[0.04] cursor-pointer transition-colors"
              >
                Discard
              </button>
            )}

            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#88DECC] text-[#03080B] font-semibold text-xs hover:bg-white hover:shadow-[0_0_20px_rgba(136,222,204,0.35)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Committing to Database..." : "Save Policy Settings"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
