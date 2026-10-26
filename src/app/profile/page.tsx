"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MemberShell } from "@/components/layout/MemberShell";
import { Button } from "@/components/ui/Button";
import {
  User,
  Camera,
  UploadCloud,
  FileText,
  FileCheck,
  File,
  Trash2,
  ExternalLink,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  MapPin,
  Globe,
  Mail,
  Phone,
  Save,
  Download,
  Eye,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface DocumentItem {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  purpose: string;
  createdAt: string;
  downloadUrl: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "documents" | "privacy">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Profile data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryRole, setPrimaryRole] = useState("aspiring_entrepreneur");
  const [accountStatus, setAccountStatus] = useState("active");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [mentorVerified, setMentorVerified] = useState(false);

  // Privacy data
  const [visibilityEmail, setVisibilityEmail] = useState(false);
  const [visibilityPhone, setVisibilityPhone] = useState(false);
  const [shareEmailOnConnect, setShareEmailOnConnect] = useState(true);
  const [sharePhoneOnConnect, setSharePhoneOnConnect] = useState(false);

  // Document vault
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docCategory, setDocCategory] = useState("Identity Evidence");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [profRes, docRes] = await Promise.all([
          fetch("/api/v1/me/profile", { cache: "no-store" }),
          fetch("/api/v1/me/documents", { cache: "no-store" }),
        ]);

        if (profRes.ok) {
          const json = await profRes.json();
          const p = json.data;
          if (p && isMounted) {
            setName(p.name || "");
            setEmail(p.email || "");
            setPhone(p.phone || "");
            setHeadline(p.headline || "");
            setBio(p.bio || "");
            setCity(p.city || "");
            setState(p.state || "");
            setCountry(p.country || "India");
            setLinkedinUrl(p.linkedinUrl || "");
            setTwitterUrl(p.twitterUrl || "");
            setGithubUrl(p.githubUrl || "");
            setWebsiteUrl(p.websiteUrl || "");
            setProfilePhotoUrl(p.profilePhotoUrl || null);
            setPrimaryRole(p.primaryRole || "aspiring_entrepreneur");
            setMentorVerified(!!p.mentorVerified);

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

        if (docRes.ok) {
          const docJson = await docRes.json();
          if (isMounted) {
            setDocuments(Array.isArray(docJson.data) ? docJson.data : []);
          }
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((cur) => (cur?.message === message ? null : cur));
    }, 4000);
  };

  // Upload Profile Avatar
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("error", "Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image file size cannot exceed 5 MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch("/api/v1/me/profile/photo", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const newUrl = json.data?.photoUrl || URL.createObjectURL(file);
        setProfilePhotoUrl(newUrl);
        showNotification("success", "Profile photo updated successfully!");
        try {
          const raw = sessionStorage.getItem("oasis_member_session");
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.profilePhotoUrl = newUrl;
            parsed.avatarUrl = newUrl;
            sessionStorage.setItem("oasis_member_session", JSON.stringify(parsed));
          }
        } catch (_) {}
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("oasis:user_updated", {
              detail: { profilePhotoUrl: newUrl, avatarUrl: newUrl },
            })
          );
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        showNotification("error", errJson.message || "Failed to upload photo");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error uploading profile image");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // Save Profile Details
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
          country,
          linkedinUrl,
          twitterUrl,
          githubUrl,
          websiteUrl,
        }),
      });

      if (res.ok) {
        showNotification("success", "Profile details saved successfully!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        showNotification("error", errJson.message || "Failed to update profile");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error saving profile details");
    } finally {
      setSaving(false);
    }
  };

  // Save Privacy Preferences
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
        showNotification("success", "Privacy preferences updated successfully!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        showNotification("error", errJson.message || "Failed to update privacy settings");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error updating privacy preferences");
    } finally {
      setSaving(false);
    }
  };

  // Upload Document
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification("error", "Document file size cannot exceed 10 MB");
      return;
    }

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", docCategory);

      const res = await fetch("/api/v1/me/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        if (created) {
          setDocuments((prev) => [created, ...prev]);
          showNotification(
            "success",
            `"${file.name}" uploaded to your secure vault. Visible to Admins & Superadmins.`
          );
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        showNotification("error", errJson.message || "Failed to upload document");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error uploading document");
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId: string, filename: string) => {
    if (!confirm(`Are you sure you want to remove "${filename}" from your vault?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/me/documents/${docId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        showNotification("success", `Document "${filename}" removed from vault.`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        showNotification("error", errJson.message || "Failed to delete document");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error deleting document");
    }
  };

  const roleLabel =
    primaryRole === "mentor"
      ? "Mentor"
      : primaryRole === "aspiring_entrepreneur"
      ? "Aspiring Entrepreneur"
      : "Startup Founder";

  const initials = name
    ? name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "M";

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <MemberShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#ECF1EF]/60 space-y-4 select-none">
          <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center shadow-[0_0_20px_rgba(136,222,204,0.2)]">
            <RotateCw className="w-5 h-5 animate-spin text-[#88DECC]" />
          </div>
          <p className="text-xs font-mono text-[#ECF1EF]/60">Loading member profile...</p>
        </div>
      </MemberShell>
    );
  }

  return (
    <MemberShell>
      <div className="space-y-7 max-w-4xl mx-auto pb-24">
        {/* Floating Notification */}
        {feedback && (
          <div
            className={cn(
              "fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-xs flex items-center gap-3 shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 max-w-md",
              feedback.type === "success"
                ? "bg-[#071F1A]/95 border-[#88DECC]/40 text-[#88DECC]"
                : "bg-rose-950/95 border-rose-600/40 text-rose-200"
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#88DECC]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-sans leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* ── Top Hero Card (Obsidian Glass Aesthetic) ────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl join-glass-panel border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#88DECC]/40 to-transparent" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with Camera upload button */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-[#88DECC]/40 overflow-hidden bg-[#122B2A] flex items-center justify-center shadow-[0_0_25px_rgba(136,222,204,0.25)] relative">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-display font-medium text-[#88DECC]">
                    {initials}
                  </span>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RotateCw className="w-6 h-6 animate-spin text-[#88DECC]" />
                  </div>
                )}
              </div>

              {/* Camera Trigger */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-[#091114] border border-[#88DECC]/50 text-[#88DECC] hover:bg-[#88DECC] hover:text-[#03080B] transition-all duration-200 shadow-lg cursor-pointer group-hover:scale-105"
                title="Upload profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Summary & Badges */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-light text-[#F5FAF6] tracking-tight">
                  {name || "Community Member"}
                </h1>
                {mentorVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30 font-semibold"
                    title="Verified Mentor"
                  >
                    <ShieldCheck className="w-3 h-3 text-[#88DECC]" />
                    Verified Mentor
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-[#ECF1EF]/70 border border-white/10 font-medium">
                  {roleLabel}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#ECF1EF]/70 font-sans leading-relaxed max-w-xl">
                {headline || "No headline configured. Add your venture designation below."}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#ECF1EF]/50 font-mono">
                {(city || state) && (
                  <span className="flex items-center gap-1 text-[#ECF1EF]/60">
                    <MapPin className="w-3.5 h-3.5 text-[#88DECC]" />
                    {[city, state].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[#88DECC]/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC]" />
                  Odisha Node #042
                </span>
                <span className="text-[#ECF1EF]/40 font-mono text-[11px]">
                  {email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "profile"
                ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-[0_0_15px_rgba(136,222,204,0.35)]"
                : "text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile &amp; Bio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 relative",
              activeTab === "documents"
                ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-[0_0_15px_rgba(136,222,204,0.35)]"
                : "text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents Vault</span>
            {documents.length > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  activeTab === "documents"
                    ? "bg-[#03080B] text-[#88DECC]"
                    : "bg-[#88DECC]/20 text-[#88DECC]"
                )}
              >
                {documents.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2",
              activeTab === "privacy"
                ? "bg-[#88DECC] text-[#03080B] font-semibold shadow-[0_0_15px_rgba(136,222,204,0.35)]"
                : "text-[#ECF1EF]/60 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy &amp; DPDP</span>
          </button>
        </div>

        {/* ── TAB 1: Profile & Bio ────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Identity & Bio Card */}
            <div className="join-glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 space-y-5 text-xs">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6]">
                  Founder Identity &amp; Bio
                </h3>
                <p className="text-[11px] text-[#ECF1EF]/50 mt-0.5">
                  Your bio and venture headline are shared with fellow founders and verified mentors across the state.
                </p>
              </div>

              {/* Full Name (Verified) */}
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 block mb-1.5 font-semibold">
                  Full Name (Verified Member)
                </label>
                <input
                  type="text"
                  disabled
                  value={name}
                  className="w-full h-11 px-4 bg-white/[0.02] border border-white/10 rounded-2xl text-[#ECF1EF]/50 cursor-not-allowed font-sans text-xs sm:text-sm"
                />
                <p className="text-[10px] text-[#ECF1EF]/40 mt-1.5">
                  Name modifications require Admissions Committee review to preserve network trust.
                </p>
              </div>

              {/* Headline */}
              <div>
                <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 block mb-1.5 font-semibold">
                  Venture Designation / Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Founder & CEO @ AgriTech Odisha | AI for Soil Sensors"
                  className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans text-xs sm:text-sm"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 font-semibold">
                    Comprehensive Bio &amp; Founder Story
                  </label>
                  <span className="text-[10px] font-mono text-[#ECF1EF]/40">
                    {bio.length} characters
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your entrepreneurial journey, current venture milestone, target markets in Odisha, and areas where you are looking to collaborate with mentors or fellow founders..."
                  className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 focus:ring-2 focus:ring-[#88DECC]/20 transition-all font-sans text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 block mb-1.5 font-semibold">
                    City / Regional Hub
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bhubaneswar, Rourkela"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 block mb-1.5 font-semibold">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Odisha"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 block mb-1.5 font-semibold">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Social & Web Footprint Card */}
            <div className="join-glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 space-y-5 text-xs">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-base sm:text-lg font-medium text-[#F5FAF6]">
                  Professional &amp; Founder Coordinates
                </h3>
                <p className="text-[11px] text-[#ECF1EF]/50 mt-0.5">
                  Links to verify your digital footprint and showcase active venture traction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 mb-1.5 font-semibold flex items-center gap-1.5">
                    <LinkedinIcon className="w-3.5 h-3.5 text-[#88DECC]" />
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 mb-1.5 font-semibold flex items-center gap-1.5">
                    <TwitterIcon className="w-3.5 h-3.5 text-[#88DECC]" />
                    Twitter / X Handle or URL
                  </label>
                  <input
                    type="text"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/username"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 mb-1.5 font-semibold flex items-center gap-1.5">
                    <GithubIcon className="w-3.5 h-3.5 text-[#88DECC]" />
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-[#ECF1EF]/60 mb-1.5 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#88DECC]" />
                    Venture Website / Pitch Deck Link
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourstartup.in"
                    className="w-full h-11 px-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[#F5FAF6] placeholder:text-[#ECF1EF]/30 focus:outline-none focus:border-[#88DECC]/60 font-sans text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto h-12 min-h-[44px] gap-2 rounded-2xl px-8 bg-[#88DECC] text-[#03080B] hover:bg-white font-semibold cursor-pointer shadow-[0_0_20px_rgba(136,222,204,0.3)] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Profile..." : "Save Profile Details"}</span>
              </Button>
            </div>
          </form>
        )}

        {/* ── TAB 2: Documents Vault (Accessible by Admin/Superadmin) ────── */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Vault Notice Banner */}
            <div className="p-6 rounded-3xl bg-linear-to-b from-[#88DECC]/10 to-transparent border border-[#88DECC]/25 space-y-2 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#88DECC]" />
                <h3 className="font-display font-medium text-sm text-[#F5FAF6]">
                  Encrypted Member Document Vault
                </h3>
              </div>
              <p className="text-xs text-[#ECF1EF]/70 leading-relaxed font-sans max-w-2xl">
                Documents uploaded here (identity proofs, pitch decks, GST/incorporation certificates, or achievements) are securely stored and directly accessible to <strong>Admissions Admins &amp; Superadmins</strong> for KYC verification, milestone audits, and mentor badging.
              </p>
            </div>

            {/* Document Upload Zone */}
            <div className="join-glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-base font-medium text-[#F5FAF6]">
                    Upload New Document
                  </h3>
                  <p className="text-[11px] text-[#ECF1EF]/50">
                    PDF, JPEG, or PNG up to 10 MB per file.
                  </p>
                </div>

                {/* Category Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#ECF1EF]/60">Category:</span>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="h-10 px-3 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-[#F5FAF6] focus:outline-none focus:border-[#88DECC]/60 cursor-pointer"
                  >
                    <option value="Identity Evidence">Identity Evidence (Aadhaar / ID)</option>
                    <option value="Startup Incorporation">Startup Incorporation / DPIIT</option>
                    <option value="Pitch Deck">Pitch Deck / Presentation</option>
                    <option value="Resume / Bio">Resume / Founder CV</option>
                    <option value="Verification Certificate">Verification Certificate</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => docInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-[#88DECC]/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer bg-white/[0.015] hover:bg-white/[0.03] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#122B2A] text-[#88DECC] border border-[#88DECC]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {uploadingDoc ? (
                    <RotateCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#F5FAF6]">
                    {uploadingDoc ? "Encrypting & uploading document..." : "Click to browse or drop document here"}
                  </p>
                  <p className="text-[11px] text-[#ECF1EF]/40 mt-0.5">
                    Select your PDF, PNG, or JPG file (Max 10 MB)
                  </p>
                </div>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDoc}
                  className="hidden"
                />
              </div>
            </div>

            {/* Uploaded Documents List */}
            <div className="join-glass-panel rounded-3xl border border-white/10 p-6 sm:p-7 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#88DECC]" />
                  <h3 className="font-display text-base font-medium text-[#F5FAF6]">
                    Uploaded Documents ({documents.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#88DECC] bg-[#88DECC]/10 px-2.5 py-1 rounded-full border border-[#88DECC]/25">
                  Admin Synchronized
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-[#ECF1EF]/50">
                  <FileText className="w-8 h-8 text-[#ECF1EF]/30 mx-auto" />
                  <p className="text-xs text-[#ECF1EF]/70">No documents uploaded yet.</p>
                  <p className="text-[11px] text-[#ECF1EF]/40">
                    Upload your pitch deck or identity verification document above.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 space-y-2">
                  {documents.map((doc) => {
                    const isPdf = doc.mimeType?.includes("pdf") || doc.filename.endsWith(".pdf");
                    const isImg = doc.mimeType?.startsWith("image/");

                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#122B2A] text-[#88DECC] border border-[#88DECC]/30 flex items-center justify-center shrink-0">
                            {isPdf ? (
                              <FileText className="w-5 h-5 text-rose-400" />
                            ) : isImg ? (
                              <FileCheck className="w-5 h-5 text-[#88DECC]" />
                            ) : (
                              <File className="w-5 h-5 text-amber-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#F5FAF6] truncate max-w-sm sm:max-w-md">
                              {doc.filename}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#ECF1EF]/50">
                              <span>{formatFileSize(doc.sizeBytes)}</span>
                              <span>•</span>
                              <span>
                                {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span>•</span>
                              <span className="text-[#88DECC]/80">Encrypted</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#88DECC] border border-[#88DECC]/25 text-[11px] font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View / Download</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                            className="p-1.5 rounded-xl text-[#ECF1EF]/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: Privacy & DPDP Act ───────────────────────────────────── */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-linear-to-b from-[#88DECC]/10 to-transparent border border-[#88DECC]/25 space-y-2 backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#88DECC]" />
                <h3 className="font-display font-medium text-sm text-[#F5FAF6]">
                  Privacy-by-Default Architecture (DPDP Act Compliance)
                </h3>
              </div>
              <p className="text-xs text-[#ECF1EF]/70 leading-relaxed font-sans max-w-2xl">
                Your direct communication coordinates (email and direct phone) remain strictly masked by default. Other founders and verified mentors can only view your direct contact info if you explicitly allow directory display or accept mutual connection requests.
              </p>
            </div>

            <div className="space-y-5">
              {/* Email Privacy Card */}
              <div className="join-glass-panel p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-medium text-base text-[#F5FAF6]">
                      Email Address Visibility
                    </h3>
                    <p className="text-xs font-mono text-[#ECF1EF]/50 mt-0.5">
                      {email || "Account email address"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/25 font-semibold">
                    Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-[#88DECC]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={visibilityEmail}
                      onChange={(e) => setVisibilityEmail(e.target.checked)}
                      className="rounded-md border-white/20 text-[#88DECC] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[#F5FAF6] font-sans">
                      Visible in Member Directory
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-[#88DECC]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={shareEmailOnConnect}
                      onChange={(e) => setShareEmailOnConnect(e.target.checked)}
                      className="rounded-md border-white/20 text-[#88DECC] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[#F5FAF6] font-sans">
                      Auto-share upon mutual connection
                    </span>
                  </label>
                </div>
              </div>

              {/* Phone Privacy Card */}
              <div className="join-glass-panel p-6 rounded-3xl border border-white/10 space-y-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-medium text-base text-[#F5FAF6]">
                      Direct Phone Number Visibility
                    </h3>
                    <p className="text-xs font-mono text-[#ECF1EF]/50 mt-0.5">
                      {phone || "No direct phone configured"}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-[#88DECC]/10 text-[#88DECC] border border-[#88DECC]/25 font-semibold">
                    Restricted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-[#88DECC]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={visibilityPhone}
                      onChange={(e) => setVisibilityPhone(e.target.checked)}
                      className="rounded-md border-white/20 text-[#88DECC] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[#F5FAF6] font-sans">
                      Visible in Member Directory
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 cursor-pointer hover:border-[#88DECC]/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={sharePhoneOnConnect}
                      onChange={(e) => setSharePhoneOnConnect(e.target.checked)}
                      className="rounded-md border-white/20 text-[#88DECC] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-[#F5FAF6] font-sans">
                      Auto-share upon mutual connection
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSavePrivacy}
                disabled={saving}
                className="w-full sm:w-auto h-12 min-h-[44px] gap-2 rounded-2xl px-8 bg-[#88DECC] text-[#03080B] hover:bg-white font-semibold cursor-pointer shadow-[0_0_20px_rgba(136,222,204,0.3)] transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Preferences..." : "Save Privacy Preferences"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
