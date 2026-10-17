"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  User,
  Bell,
  Key,
  UserX,
  FileText,
  Eye,
  Lock,
  Check,
  Save,
  MapPin,
  RotateCw,
} from "lucide-react";

interface PrivacyFieldConfig {
  id: string;
  label: string;
  value: string;
  visibleToMembers: boolean;
  shareOnConnection: boolean;
  defaultPrivate?: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "profile" | "security">("privacy");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [visibilityEmail, setVisibilityEmail] = useState(false);
  const [visibilityPhone, setVisibilityPhone] = useState(false);
  const [shareEmailOnConnect, setShareEmailOnConnect] = useState(true);
  const [sharePhoneOnConnect, setSharePhoneOnConnect] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/me/profile");
        if (res.ok) {
          const json = await res.json();
          const p = json.data;
          if (p) {
            setName(p.name || "");
            setHeadline(p.headline || "");
            setBio(p.bio || "");
            setCity(p.city || "");
            setState(p.state || "");
            setEmail(p.email || "");
            setPhone(p.phone || "");
            setLinkedin(p.linkedinUrl || "");

            if (p.visibilitySettings) {
              setVisibilityEmail(p.visibilitySettings.email === "members");
              setVisibilityPhone(p.visibilitySettings.phone === "members");
            }
            if (p.contactPreferences) {
              setShareEmailOnConnect(!!p.contactPreferences.shareEmailOnConnect);
              setSharePhoneOnConnect(!!p.contactPreferences.sharePhoneOnConnect);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/v1/me/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility: {
            email: visibilityEmail ? "members" : "private",
            phone: visibilityPhone ? "members" : "private",
          },
          contactPreferences: {
            shareEmailOnConnect,
            sharePhoneOnConnect,
          },
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to update privacy settings");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          bio,
          city,
          state,
          linkedinUrl: linkedin,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const errJson = await res.json();
        alert(errJson.error?.message || "Failed to update profile");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="flex items-center justify-center min-h-[50vh] text-[var(--muted)] gap-2 text-xs">
          <RotateCw className="w-5 h-5 animate-spin text-[var(--accent)]" />
          <span>Loading member settings...</span>
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#EAE1CF]/70 dark:border-[#2C2E4A]/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#86601F]/10 dark:bg-[#F3D3A2]/10 border border-[#86601F]/20 dark:border-[#F3D3A2]/20 mb-3">
              <Shield className="w-3.5 h-3.5 text-[#86601F] dark:text-[#F3D3A2]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#86601F] dark:text-[#F3D3A2] font-semibold">
                Member Governance
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-[var(--text)] tracking-tight">
              Settings &amp; Privacy
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-sans leading-relaxed">
              Manage personal data visibility, mutual connection rules, and founder profile details.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl animate-fade-in">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="font-medium font-sans">Settings saved successfully</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#EFE8D8]/60 dark:bg-[#181928]/80 border border-[#D9CDAE]/50 dark:border-[#2C2E4A] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "privacy"
                ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Controls (DPDP)</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#1E1F33] dark:bg-[#FBF7EE] text-[#FBF7EE] dark:text-[#1E1F33] font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Profile Details</span>
            </span>
          </button>
        </div>

        {/* Tab 1: Privacy Controls */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-linear-to-b from-[#86601F]/5 to-transparent border border-[#86601F]/20 dark:border-[#F3D3A2]/20 space-y-2 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#86601F] dark:text-[#F3D3A2]" />
                <h3 className="font-display font-medium text-sm text-[var(--text)]">
                  Privacy-by-Default Architecture (DPDP Act Compliance)
                </h3>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-sans max-w-2xl">
                Your direct communication coordinates (email and direct phone) remain strictly masked by default. Other founders and verified mentors can only view your direct contact info if you explicitly allow directory display or accept mutual connection requests.
              </p>
            </div>

            <div className="space-y-5">
              {/* Email Privacy Card */}
              <div className="p-6 rounded-3xl border border-[#EAE1CF] dark:border-[#2C2E4A]/90 bg-[var(--surface)] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-medium text-base text-[var(--text)]">Email Address Visibility</h3>
                    <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{email || "Account email address"}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#86601F]/10 text-[#86601F] dark:text-[#F3D3A2] border border-[#86601F]/20 font-semibold">
                    Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] cursor-pointer hover:border-[#86601F]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={visibilityEmail}
                      onChange={(e) => setVisibilityEmail(e.target.checked)}
                      className="rounded-md border-[#D9CDAE] text-[#86601F] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[var(--text)] font-sans">Visible in Member Directory</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] cursor-pointer hover:border-[#86601F]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={shareEmailOnConnect}
                      onChange={(e) => setShareEmailOnConnect(e.target.checked)}
                      className="rounded-md border-[#D9CDAE] text-[#86601F] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[var(--text)] font-sans">Auto-share upon mutual connection</span>
                  </label>
                </div>
              </div>

              {/* Phone Privacy Card */}
              <div className="p-6 rounded-3xl border border-[#EAE1CF] dark:border-[#2C2E4A]/90 bg-[var(--surface)] shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-medium text-base text-[var(--text)]">Direct Phone Number Visibility</h3>
                    <p className="text-xs font-mono text-[var(--muted)] mt-0.5">{phone || "No phone number configured"}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#86601F]/10 text-[#86601F] dark:text-[#F3D3A2] border border-[#86601F]/20 font-semibold">
                    Restricted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] cursor-pointer hover:border-[#86601F]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={visibilityPhone}
                      onChange={(e) => setVisibilityPhone(e.target.checked)}
                      className="rounded-md border-[#D9CDAE] text-[#86601F] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[var(--text)] font-sans">Visible in Member Directory</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[#EAE1CF] dark:border-[#2C2E4A] cursor-pointer hover:border-[#86601F]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={sharePhoneOnConnect}
                      onChange={(e) => setSharePhoneOnConnect(e.target.checked)}
                      className="rounded-md border-[#D9CDAE] text-[#86601F] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[var(--text)] font-sans">Auto-share upon mutual connection</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="gap-2 cursor-pointer rounded-2xl px-6 py-2.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Preferences..." : "Save Privacy Preferences"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Profile Details */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="p-7 rounded-3xl border border-[#EAE1CF] dark:border-[#2C2E4A]/90 bg-[var(--surface)] shadow-xs space-y-5">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-semibold">
                  Full Name (Verified Identity)
                </label>
                <input
                  type="text"
                  disabled
                  value={name}
                  className="w-full h-11 px-4 bg-[var(--surface-2)]/60 border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--muted)] cursor-not-allowed font-sans text-xs sm:text-sm"
                />
                <p className="text-[11px] text-[var(--muted)] mt-1.5 font-sans">
                  Identity modifications require Admissions Committee re-audit to preserve network trust.
                </p>
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-semibold">
                  Headline / Venture Designation
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Founder @ SolarIoT | CleanTech & IoT Hardware"
                  className="w-full h-11 px-4 bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 font-sans text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-semibold">
                  Founder Bio &amp; Focus Area
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your current venture focus, milestone trajectory, and mentor/founder collaboration interests..."
                  className="w-full p-4 bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 font-sans text-xs sm:text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-semibold">
                    Odisha Regional Hub
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bhubaneswar, Cuttack, Rourkela"
                    className="w-full h-11 px-4 bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 font-sans text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-semibold">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full h-11 px-4 bg-[var(--surface-2)] border border-[#D9CDAE]/60 dark:border-[#2C2E4A] rounded-2xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#86601F]/30 dark:focus:ring-[#F3D3A2]/30 font-sans text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 cursor-pointer rounded-2xl px-6 py-2.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </MemberShell>
  );
}
