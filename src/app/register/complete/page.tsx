"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  AlertCircle,
  Check,
  Building,
  Globe,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  FileText,
  RotateCw,
  X,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";

function Linkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const ODISHA_CITIES = [
  "Bhubaneswar",
  "Cuttack",
  "Rourkela",
  "Sambalpur",
  "Berhampur",
  "Balasore",
  "Puri",
  "Global Odia Diaspora",
  "Other",
];

const FOUNDER_SECTORS = [
  "AgriTech",
  "HealthTech",
  "FinTech",
  "DeepTech",
  "AI/ML",
  "EdTech",
  "CleanTech & Energy",
  "Handloom & Handicrafts",
  "B2B SaaS",
  "Logistics & Supply Chain",
];

const FOUNDER_STAGES = [
  "Ideation (concept validation)",
  "MVP (prototype ready)",
  "Early Revenue (first paying customers)",
  "Growth (scaling operations)",
];

const FOUNDER_DOC_TYPES = [
  "Certificate of Incorporation (Pvt Ltd)",
  "LLP Incorporation Certificate",
  "Partnership Deed",
  "Udyam Registration Certificate (MSME)",
  "DPIIT Recognition Certificate",
  "Other Business Registration Proof",
];

const MENTOR_DOC_TYPES = [
  "Experience / Employment Certificate",
  "Professional Qualification / Certification",
  "Company / Professional Website",
  "Evidence of previous mentoring or startup leadership",
];

function RegisterCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"founder" | "mentor" | "aspiring">("founder");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [phone, setPhone] = useState("");

  // Common fields
  const [city, setCity] = useState("Bhubaneswar");
  const [description, setDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

  // Document upload states
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<{
    fileId: string;
    filename: string;
    docType: string;
  } | null>(null);

  // Founder specific
  const [startupName, setStartupName] = useState("");
  const [userRoleInStartup, setUserRoleInStartup] = useState("Founder / Co-founder");
  const [stage, setStage] = useState(FOUNDER_STAGES[1]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["AgriTech"]);
  const [isRegistered, setIsRegistered] = useState<"registered" | "early_stage">("early_stage");
  const [founderDocType, setFounderDocType] = useState(FOUNDER_DOC_TYPES[0]);

  // Aspiring specific
  const [ideaDomain, setIdeaDomain] = useState("AI & Automation");
  const [govIdProvided, setGovIdProvided] = useState(false);

  // Mentor specific
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("8+ years");
  const [referenceName, setReferenceName] = useState("");
  const [referenceContact, setReferenceContact] = useState("");
  const [mentorDocType, setMentorDocType] = useState(MENTOR_DOC_TYPES[0]);

  // Consents & submission
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = sessionStorage.getItem("oasis_join_role");
      if (storedRole === "mentor" || storedRole === "aspiring" || storedRole === "founder") {
        setRole(storedRole);
      }
      const storedUser = sessionStorage.getItem("oasis_auth_user");
      if (storedUser) setGoogleEmail(storedUser);
      const storedName = sessionStorage.getItem("oasis_user_name");
      if (storedName) setGoogleName(storedName);
    }
  }, []);

  const toggleSector = (sec: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Document size must not exceed 10 MB.");
      return;
    }

    try {
      setUploadingDoc(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "verification_evidence");

      const res = await fetch("/api/v1/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload document. Please ensure it is a PDF, PNG, or JPEG.");
      }

      const json = await res.json();
      setUploadedEvidence({
        fileId: json.id,
        filename: file.name,
        docType: category,
      });
    } catch (err: any) {
      setError(err.message || "File upload failed.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setError("Please provide a valid 10-digit mobile number for identity verification.");
      return;
    }

    const finalLinkedin = linkedin.trim() ? normalizeUrl(linkedin) : "";
    const finalWebsite = website.trim() ? normalizeUrl(website) : "";

    if (role === "founder") {
      if (!startupName.trim()) {
        setError("Please enter your startup or venture name.");
        return;
      }
      if (!description.trim() || description.length < 20) {
        setError("Please provide a short description of your startup (at least 20 characters).");
        return;
      }
      if (!finalWebsite && !finalLinkedin) {
        setError("Please provide at least a website/MVP link or your LinkedIn profile for committee verification.");
        return;
      }
    } else if (role === "mentor") {
      if (!currentCompany.trim() || !jobTitle.trim()) {
        setError("Please provide your current organization and job title.");
        return;
      }
      if (!finalLinkedin || !finalLinkedin.toLowerCase().includes("linkedin.com")) {
        setError("A valid LinkedIn profile URL is required for mentor vetting.");
        return;
      }
    } else {
      // Aspiring
      if (!description.trim() || description.length < 20) {
        setError("Please share a short description of your business idea, interests, or goals (at least 20 characters).");
        return;
      }
    }

    if (!ageConfirmed) {
      setError("You must confirm you are 18 years of age or older to join OASIS.");
      return;
    }
    if (!guidelinesAgreed) {
      setError("Please agree to the Community Guidelines & Privacy Notice.");
      return;
    }

    setSubmitting(true);

    try {
      const primaryRole =
        role === "aspiring"
          ? "aspiring_entrepreneur"
          : role === "mentor"
          ? "mentor"
          : "founder";

      const headline =
        role === "founder"
          ? `${userRoleInStartup} @ ${startupName || "Startup"}`
          : role === "mentor"
          ? `${jobTitle} @ ${currentCompany}`
          : "Aspiring Entrepreneur";

      const roleData: Record<string, any> = {
        role,
        startupName,
        userRoleInStartup,
        sectors: selectedSectors,
        stage,
        isRegistered,
        uploadedEvidence,
        ideaDomain,
        govIdProvided,
        currentCompany,
        jobTitle,
        yearsExperience,
        referenceName,
        referenceContact,
        linkedinUrl: finalLinkedin,
        websiteUrl: finalWebsite,
      };

      const res = await fetch("/api/v1/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryRole,
          city: city || "Bhubaneswar",
          headline,
          bio: description || "",
          phone: `+91 ${phone.replace(/\D/g, "").slice(-10)}`,
          linkedin,
          website,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          ageConfirmed: true,
          roleData,
          evidenceFileIds: uploadedEvidence ? [uploadedEvidence.fileId] : [],
          consents: [
            { type: "privacy_notice", version: "1.0" },
            { type: "community_guidelines", version: "1.0" },
          ],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.message || "Failed to finalize registration.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to finalize registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
          <BrandLockup variant="horizontal" href="/" />
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)] font-semibold">
              Step 3 of 3 · Finalizing Google Account
            </span>
            <div className="text-xs text-[var(--muted)] font-medium">
              Signed in as {googleEmail || "Google Member"}
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            Complete your OASIS credentials
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Your name and email have been verified by Google. Please provide role verification documents and contact details for committee evaluation.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[var(--danger)] leading-relaxed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Selected Community Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["founder", "mentor", "aspiring"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setError(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    role === r
                      ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-[var(--brand-gold)] font-semibold shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  {r === "founder" ? "Founder" : r === "mentor" ? "Mentor / Advisor" : "Aspiring"}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Verification */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Mobile Number (OTP Verified) <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <span className="inline-flex items-center px-3 text-xs font-mono font-medium text-[var(--muted)] border-r border-[var(--border)]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  Required for multi-factor security and urgent committee updates.
                </p>
              </div>

              <div className="pt-1">
                <LocationAutocomplete
                  value={city}
                  onChange={(selectedLoc) => setCity(selectedLoc)}
                  label="Base City / Region in Odisha"
                  placeholder="Search city, district, or address (powered by Google)..."
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ROLE: ASPIRING ENTREPRENEUR */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {role === "aspiring" && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                    Short description of your business idea, interests, or goals <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--muted)]">
                    {description.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what problem you are exploring, your area of interest, or what guidance you are seeking from the Odisha startup community..."
                  className="w-full p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  LinkedIn Profile URL <span className="text-[10px] lowercase text-[var(--muted)]">(if available)</span>
                </label>
                <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    onBlur={() => {
                      if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                    }}
                    placeholder="www.linkedin.com/in/username or full URL"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Policy note */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
                <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
                  <Building className="w-4 h-4 text-[var(--accent)]" />
                  <span>Proof of business registration: Not required</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  You are not expected to have registered a company yet. The committee reviews your application based on a genuine profile and platform eligibility.
                </p>
              </div>

              {/* Optional Government ID */}
              <div className="p-4 rounded-xl border border-dashed border-[var(--border)] bg-black/[0.01] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--text)] font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Government ID Verification (Optional)</span>
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-[var(--muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={govIdProvided}
                      onChange={(e) => setGovIdProvided(e.target.checked)}
                      className="rounded text-[var(--brand-navy)] focus:ring-0"
                    />
                    <span>Attach ID</span>
                  </label>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Government ID is usually not necessary just to join as an aspiring entrepreneur. If stronger identity verification is justified, you may optionally provide it with informed consent.
                </p>
                {govIdProvided && (
                  <div className="pt-2">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, "Government ID")}
                      className="text-xs text-[var(--muted)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-navy)] file:text-[var(--brand-cream)] hover:file:opacity-90 cursor-pointer"
                    />
                    {uploadingDoc && (
                      <div className="text-[11px] text-[var(--accent)] mt-1 flex items-center gap-1">
                        <RotateCw className="w-3 h-3 animate-spin" /> Uploading securely...
                      </div>
                    )}
                    {uploadedEvidence && (
                      <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Attached: {uploadedEvidence.filename}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ROLE: FOUNDER OR CO-FOUNDER */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {role === "founder" && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    Startup or Venture Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. KrishiTech Innovations"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    Your Founder Role
                  </label>
                  <select
                    value={userRoleInStartup}
                    onChange={(e) => setUserRoleInStartup(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="Founder / CEO">Founder / CEO</option>
                    <option value="Co-founder / CTO">Co-founder / CTO</option>
                    <option value="Co-founder / COO">Co-founder / COO</option>
                    <option value="Founding Team Member">Founding Team Member</option>
                  </select>
                </div>
              </div>

              {/* Startup Website, Product Link or MVP Demo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Startup Website, Product Link, or MVP/Demo URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onBlur={() => {
                      if (website.trim()) setWebsite(normalizeUrl(website));
                    }}
                    placeholder="myventure.in or full URL"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Validates your startup existence (live website, Figma, GitHub, or product demo).
                </p>
              </div>

              {/* Founder LinkedIn */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Founder LinkedIn Profile URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    onBlur={() => {
                      if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                    }}
                    placeholder="www.linkedin.com/in/founder or full URL"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Shows the founder role and connection to the startup.
                </p>
              </div>

              {/* Sectors */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Sectors (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {FOUNDER_SECTORS.map((sec) => {
                    const active = selectedSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => toggleSector(sec)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          active
                            ? "bg-[var(--accent-fill)] text-[var(--brand-navy)] border-[var(--brand-gold)] font-semibold"
                            : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--brand-gold)]"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pitch */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                    Venture Pitch &amp; Current Progress <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--muted)]">
                    {description.length} / 1000
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the customer problem, your solution, and current milestone in Odisha..."
                  className="w-full p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
                />
              </div>

              {/* Business Registration Evidence */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-2">
                    Business Registration Status
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsRegistered("registered")}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        isRegistered === "registered"
                          ? "bg-white border-[var(--brand-navy)] ring-1 ring-[var(--brand-navy)] shadow-xs"
                          : "bg-black/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                      )}
                    >
                      <div className="font-semibold text-[var(--text)]">Incorporated / Registered</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Pvt Ltd, LLP, Partnership, MSME, DPIIT</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistered("early_stage");
                        setUploadedEvidence(null);
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        isRegistered === "early_stage"
                          ? "bg-white border-[var(--brand-navy)] ring-1 ring-[var(--brand-navy)] shadow-xs"
                          : "bg-black/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                      )}
                    >
                      <div className="font-semibold text-[var(--text)]">Early Stage / Pre-incorporation</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5">Validated via MVP, website or demo</div>
                    </button>
                  </div>
                </div>

                {isRegistered === "registered" ? (
                  <div className="space-y-3 pt-2 border-t border-[var(--border)]">
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                        Supporting Registration Document Type
                      </label>
                      <select
                        value={founderDocType}
                        onChange={(e) => setFounderDocType(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl bg-white border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none cursor-pointer"
                      >
                        {FOUNDER_DOC_TYPES.map((dt) => (
                          <option key={dt} value={dt}>
                            {dt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                        Upload Certificate / Evidence (PDF, PNG, JPG ≤ 10MB)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, founderDocType)}
                        className="text-xs text-[var(--muted)] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-navy)] file:text-[var(--brand-cream)] hover:file:opacity-90 cursor-pointer"
                      />
                      {uploadingDoc && (
                        <div className="text-xs text-[var(--accent)] mt-2 flex items-center gap-1.5">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading and scanning document...</span>
                        </div>
                      )}
                      {uploadedEvidence && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium">{uploadedEvidence.filename}</span>
                            <span className="text-[10px] font-mono text-emerald-600">({uploadedEvidence.docType})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedEvidence(null)}
                            className="text-emerald-700 hover:text-emerald-900"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed italic">
                    ℹ️ <strong>Committee note:</strong> Not every legitimate early-stage founder will have a registered company. Your application will be evaluated based on your MVP, demo, and founder profile.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ROLE: MENTOR OR ADVISOR */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {role === "mentor" && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    Current or Previous Organization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    Job Title / Role <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. VP of Product / Venture Partner"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    Years of Experience
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="5-8 years">5 – 8 years</option>
                    <option value="8-12 years">8 – 12 years</option>
                    <option value="12-15 years">12 – 15 years</option>
                    <option value="15+ years">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                    LinkedIn Profile URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                    <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                      <Linkedin className="w-4 h-4 text-[#0077b5]" />
                    </span>
                    <input
                      type="text"
                      inputMode="url"
                      required
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      onBlur={() => {
                        if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                      }}
                      placeholder="www.linkedin.com/in/mentor or full URL"
                      className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Portfolio or Company Website (Optional)
                </label>
                <div className="flex rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onBlur={() => {
                      if (website.trim()) setWebsite(normalizeUrl(website));
                    }}
                    placeholder="portfolio.com or advisory site"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                  Mentoring Philosophy &amp; Advisory Focus
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share how you assist early-stage founders and domains of expertise..."
                  className="w-full p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
                />
              </div>

              {/* References */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text)]">
                  <UserCheck className="w-4 h-4 text-[var(--accent)]" />
                  <span>Professional Reference (Recommended)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    value={referenceName}
                    onChange={(e) => setReferenceName(e.target.value)}
                    placeholder="Reference Name & Title (e.g. Ramesh Pattnaik, Director)"
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={referenceContact}
                    onChange={(e) => setReferenceContact(e.target.value)}
                    placeholder="Email or LinkedIn URL"
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Supporting Experience Evidence Upload */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text)]">
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    <span>Supporting Experience Evidence (Optional)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)]">Supports Verified Mentor badge</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Attach an experience certificate, professional qualification, or mentoring track record to assist our committee in granting the Verified Mentor status.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <select
                    value={mentorDocType}
                    onChange={(e) => setMentorDocType(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-white border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none cursor-pointer"
                  >
                    {MENTOR_DOC_TYPES.map((md) => (
                      <option key={md} value={md}>
                        {md}
                      </option>
                    ))}
                  </select>

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, mentorDocType)}
                    className="text-xs text-[var(--muted)] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-navy)] file:text-[var(--brand-cream)] hover:file:opacity-90 cursor-pointer"
                  />
                </div>

                {uploadingDoc && (
                  <div className="text-xs text-[var(--accent)] mt-2 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading document...</span>
                  </div>
                )}
                {uploadedEvidence && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{uploadedEvidence.filename}</span>
                      <span className="text-[10px] font-mono text-emerald-600">({uploadedEvidence.docType})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedEvidence(null)}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Age & Legal Consent */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-strong)]"
              />
              <span className="text-xs text-[var(--text)] leading-relaxed">
                I confirm I am <strong>18 years of age or older</strong>. (OASIS is a professional entrepreneurs community).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={guidelinesAgreed}
                onChange={(e) => setGuidelinesAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)] border-[var(--border-strong)]"
              />
              <span className="text-xs text-[var(--text)] leading-relaxed">
                I agree to the{" "}
                <Link href="/legal/privacy" target="_blank" className="underline text-[var(--accent)]">
                  Privacy Notice
                </Link>{" "}
                and{" "}
                <Link href="/legal/guidelines" target="_blank" className="underline text-[var(--accent)]">
                  Community Guidelines
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Submitting application..." : "Complete & Submit Application"}
          </Button>

          <p className="text-center text-xs text-[var(--muted)]">
            An admin committee reviews all applications. We evaluate genuine intent and community credentials.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <RegisterCompleteInner />
    </Suspense>
  );
}
