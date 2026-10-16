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
      <div className="space-y-6 max-w-4xl pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h1 className="font-display text-3xl font-light text-[var(--text)] tracking-tight">
              Settings & Privacy
            </h1>
            <p className="text-xs text-[var(--muted)] mt-1">
              Manage your personal data visibility, contact sharing preferences, and account security.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 text-xs text-[var(--success)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-full">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
              activeTab === "privacy"
                ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Privacy Controls (DPDP)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
              activeTab === "profile"
                ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] font-semibold"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Profile Details
            </span>
          </button>
        </div>

        {/* Tab 1: Privacy Controls */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
              <p className="font-semibold text-[var(--text)]">
                Privacy by Default Guarantee (PRD §3.5 & India DPDP Act)
              </p>
              <p className="text-[var(--muted)] leading-relaxed">
                Your direct contact details (email and phone) are strictly hidden by default. They are only revealed to members when you explicitly choose to share them or when you accept an invitation to connect.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Privacy */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-xs text-[var(--text)]">Email Address Visibility</h3>
                    <p className="text-[11px] font-mono text-[var(--muted)] mt-0.5">{email || "Your account email"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibilityEmail}
                      onChange={(e) => setVisibilityEmail(e.target.checked)}
                      className="rounded border-[var(--border)] text-[var(--accent)]"
                    />
                    <span className="text-[var(--text)]">Visible in Member Directory</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareEmailOnConnect}
                      onChange={(e) => setShareEmailOnConnect(e.target.checked)}
                      className="rounded border-[var(--border)] text-[var(--accent)]"
                    />
                    <span className="text-[var(--text)]">Auto-share upon mutual connection</span>
                  </label>
                </div>
              </div>

              {/* Phone Privacy */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-xs text-[var(--text)]">Phone Number Visibility</h3>
                    <p className="text-[11px] font-mono text-[var(--muted)] mt-0.5">{phone || "Not configured"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibilityPhone}
                      onChange={(e) => setVisibilityPhone(e.target.checked)}
                      className="rounded border-[var(--border)] text-[var(--accent)]"
                    />
                    <span className="text-[var(--text)]">Visible in Member Directory</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharePhoneOnConnect}
                      onChange={(e) => setSharePhoneOnConnect(e.target.checked)}
                      className="rounded border-[var(--border)] text-[var(--accent)]"
                    />
                    <span className="text-[var(--text)]">Auto-share upon mutual connection</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Privacy Preferences"}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Profile Details */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4">
              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Full Name (Verified)
                </label>
                <input
                  type="text"
                  disabled
                  value={name}
                  className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--muted)] cursor-not-allowed"
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  Name change requires admin audit approval per community verification policy.
                </p>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Headline / Professional Title
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Founder @ SolarIoT | CleanTech & IoT Hardware"
                  className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                  Bio & Mission
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your background, current venture focus, or mentorship interests..."
                  className="w-full p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    City / Regional Hub
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bhubaneswar, Cuttack, Rourkela"
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full h-10 px-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </MemberShell>
  );
}
