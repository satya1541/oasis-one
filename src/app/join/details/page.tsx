"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  AlertCircle,
  Check,
  Upload,
  FileCheck2,
  FileText,
  ShieldCheck,
  Globe,
  Building,
  UserCheck,
  Info,
  X,
  RotateCw,
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

const MENTOR_DOMAINS = [
  "Fundraising & Term Sheets",
  "Product-Market Fit",
  "Go-to-Market & Sales",
  "Engineering & AI Systems",
  "Operations & Scale",
  "Healthcare & Clinical Trials",
  "Supply Chain Logistics",
];

function JoinDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = (searchParams.get("role") || "founder") as "aspiring" | "founder" | "mentor";

  // Common fields
  const [city, setCity] = useState("Bhubaneswar");
  const [description, setDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");

  // Document upload states
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<{
    fileId: string;
    filename: string;
    docType: string;
  } | null>(null);

  // Founder specific fields
  const [startupName, setStartupName] = useState("");
  const [founderRole, setFounderRole] = useState("Founder / CEO");
  const [stage, setStage] = useState(FOUNDER_STAGES[1]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["AgriTech"]);
  const [isRegistered, setIsRegistered] = useState<"registered" | "early_stage">("early_stage");
  const [selectedDocType, setSelectedDocType] = useState(FOUNDER_DOC_TYPES[0]);

  // Aspiring specific fields
  const [ideaDomain, setIdeaDomain] = useState("AI & Automation");
  const [govIdProvided, setGovIdProvided] = useState(false);

  // Mentor specific fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("8+ years");
  const [selectedMentorDomains, setSelectedMentorDomains] = useState<string[]>([
    "Product-Market Fit",
    "Go-to-Market & Sales",
  ]);
  const [referenceName, setReferenceName] = useState("");
  const [referenceContact, setReferenceContact] = useState("");
  const [mentorDocType, setMentorDocType] = useState(MENTOR_DOC_TYPES[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDetails = sessionStorage.getItem("oasis_reg_details");
      if (savedDetails) {
        try {
          const parsed = JSON.parse(savedDetails);
          if (parsed.city) setCity(parsed.city);
          if (parsed.description) setDescription(parsed.description);
          if (parsed.startupName) setStartupName(parsed.startupName);
          if (parsed.website) setWebsite(parsed.website);
          if (parsed.linkedin) setLinkedin(parsed.linkedin);
          if (parsed.founderRole) setFounderRole(parsed.founderRole);
          if (parsed.currentCompany) setCurrentCompany(parsed.currentCompany);
          if (parsed.jobTitle) setJobTitle(parsed.jobTitle);
          if (parsed.uploadedEvidence) setUploadedEvidence(parsed.uploadedEvidence);
          if (parsed.isRegistered) setIsRegistered(parsed.isRegistered);
        } catch {}
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("Document size must not exceed 10 MB.");
      return;
    }

    try {
      setUploadingDoc(true);
      setError("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalLinkedin = linkedin.trim() ? normalizeUrl(linkedin) : "";
    const finalWebsite = website.trim() ? normalizeUrl(website) : "";

    if (roleParam === "founder") {
      if (!startupName.trim()) {
        setError("Please enter your startup or venture name.");
        return;
      }
      if (!description.trim() || description.length < 20) {
        setError("Please provide a short description of your startup (at least 20 characters).");
        return;
      }
      if (!finalWebsite && !finalLinkedin) {
        setError("Please provide at least a startup website / demo link or your LinkedIn profile for committee verification.");
        return;
      }
    } else if (roleParam === "mentor") {
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
        setError("Please share a short description of your business idea, interests, or entrepreneurial goals (at least 20 characters).");
        return;
      }
    }

    const detailsData = {
      role: roleParam,
      city,
      description,
      website: finalWebsite,
      linkedin: finalLinkedin,
      startupName,
      stage,
      founderRole,
      selectedSectors,
      isRegistered,
      uploadedEvidence,
      evidenceFileIds: uploadedEvidence ? [uploadedEvidence.fileId] : [],
      ideaDomain,
      govIdProvided,
      currentCompany,
      jobTitle,
      yearsExperience,
      selectedMentorDomains,
      referenceName,
      referenceContact,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_details", JSON.stringify(detailsData));
    }

    router.push(`/join/review?role=${roleParam}`);
  };

  return (
    <div className="w-full max-w-[680px] mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-display uppercase tracking-[0.22em] text-[var(--accent)] font-semibold text-[11px]">
            Step 3 of 4
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">
            {roleParam === "founder"
              ? "Startup credentials & proof"
              : roleParam === "mentor"
              ? "Mentor credentials & experience"
              : "Idea & background"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2.5 h-1.5 w-full">
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-[var(--border)]/70 rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8 space-y-1.5">
        <h1 className="text-3xl font-display font-light text-[var(--text)] tracking-tight">
          {roleParam === "founder" && "Tell us about your startup."}
          {roleParam === "mentor" && "Tell us about your expertise."}
          {roleParam === "aspiring" && "Tell us what you want to build."}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {roleParam === "founder" &&
            "Our committee verifies startup existence and founder affiliation. Registered documents or MVP demo links welcome."}
          {roleParam === "mentor" &&
            "To maintain high advisory trust across OASIS, we verify your professional track record and domain leadership."}
          {roleParam === "aspiring" &&
            "Share your journey and interests. You do not need an incorporated company to be admitted as an aspiring entrepreneur."}
        </p>
      </div>

      {/* Form Card */}
      <div className="card-luxury p-7 lg:p-9">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-[var(--danger)] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Location Selection with Google Places Autocomplete */}
          <LocationAutocomplete
            value={city}
            onChange={(selectedLocation) => {
              setCity(selectedLocation);
              if (error) setError("");
            }}
            label="Base location in Odisha / Diaspora"
            placeholder="Search full address, locality, or city (powered by Google)..."
            required
          />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ROLE 1: ASPIRING ENTREPRENEUR */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {roleParam === "aspiring" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Business idea, interests, or goals <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Describe the problem you're exploring, the kind of business you wish to build, or what support you are seeking from the community..."
                  className="w-full p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                />
                <p className="text-[11px] text-[var(--muted)] mt-1.5">
                  Minimum 20 characters. Helps us match you with peer founders and early guidance.
                </p>
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  LinkedIn profile URL <span className="text-[10px] lowercase text-[var(--muted)]">(if available)</span>
                </label>
                <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={linkedin}
                    onChange={(e) => {
                      setLinkedin(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={() => {
                      if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                    }}
                    placeholder="www.linkedin.com/in/username or full URL"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Registration notice */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1">
                <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
                  <Building className="w-4 h-4 text-[var(--accent)]" />
                  <span>Proof of business registration: Not required</span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  As an aspiring entrepreneur, you are not expected to have incorporated an entity. Admissions are approved based on genuine profile intent and community eligibility.
                </p>
              </div>

              {/* Optional Government ID note */}
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
                    <span>I wish to provide ID</span>
                  </label>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Government ID is usually not necessary just to join as an aspiring entrepreneur. If stronger identity verification is justified for your profile, you may optionally attach an ID document with informed consent.
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

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ROLE 2: FOUNDER OR CO-FOUNDER */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {roleParam === "founder" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Startup or company name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => {
                      setStartupName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. AgriSpire Labs"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Your role in the company
                  </label>
                  <select
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all cursor-pointer"
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
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Startup website, product link, or MVP/demo URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={() => {
                      if (website.trim()) setWebsite(normalizeUrl(website));
                    }}
                    placeholder="yourstartup.in or https://..."
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1.5">
                  Useful for validating your startup existence. Can be a live website, demo video, Figma, or GitHub.
                </p>
              </div>

              {/* LinkedIn showing founder's role */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Founder LinkedIn profile URL <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={linkedin}
                    onChange={(e) => {
                      setLinkedin(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={() => {
                      if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                    }}
                    placeholder="www.linkedin.com/in/founder or full URL"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-1.5">
                  Verifies applicant connection to the venture.
                </p>
              </div>

              {/* Startup Pitch / Description */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Short venture description &amp; progress <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="What customer problem are you solving? What is your current traction or milestone?"
                  className="w-full p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                />
              </div>

              {/* Business Registration Evidence Section */}
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
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
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
                        onChange={(e) => handleFileUpload(e, selectedDocType)}
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
                    ℹ️ <strong>Committee note:</strong> Not every legitimate early-stage founder will have a registered company yet. Your application will be evaluated based on your MVP, demo, and founder profile.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ROLE 3: MENTOR OR ADVISOR */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {roleParam === "mentor" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Current or previous organization <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCompany}
                    onChange={(e) => {
                      setCurrentCompany(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Executive / Professional title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. VP of Engineering / Angel Investor"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                  />
                </div>
              </div>

              {/* Experience & LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Years of leadership / industry experience
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all cursor-pointer"
                  >
                    <option value="5-8 years">5 – 8 years</option>
                    <option value="8-12 years">8 – 12 years</option>
                    <option value="12-15 years">12 – 15 years</option>
                    <option value="15+ years">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    LinkedIn profile URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all">
                    <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                      <Linkedin className="w-4 h-4 text-[#0077b5]" />
                    </span>
                    <input
                      type="text"
                      inputMode="url"
                      required
                      value={linkedin}
                      onChange={(e) => {
                        setLinkedin(e.target.value);
                        if (error) setError("");
                      }}
                      onBlur={() => {
                        if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin));
                      }}
                      placeholder="www.linkedin.com/in/mentor or full URL"
                      className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Professional portfolio or company website */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Company website or professional portfolio URL
                </label>
                <div className="flex rounded-xl bg-[var(--surface-2)] border border-[var(--border)] focus-within:bg-white focus-within:border-[var(--brand-navy)] focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 transition-all">
                  <span className="inline-flex items-center px-3.5 text-xs text-[var(--muted)] border-r border-[var(--border)]">
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  </span>
                  <input
                    type="text"
                    inputMode="url"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      if (error) setError("");
                    }}
                    onBlur={() => {
                      if (website.trim()) setWebsite(normalizeUrl(website));
                    }}
                    placeholder="company.com or personal site"
                    className="w-full h-12 px-4 bg-transparent text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mentoring Bio */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Advisory focus &amp; mentoring philosophy
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the types of founders you mentor and what topics you can offer actionable guidance on..."
                  className="w-full p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-gold)]/20 transition-all"
                />
              </div>

              {/* Professional References */}
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
                    placeholder="Reference Name & Title (e.g. Rajesh Jena, Director)"
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

              {/* Supporting Evidence Upload (Optional) */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[var(--text)]">
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    <span>Supporting Experience Evidence (Optional)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted)]">Supports Verified Mentor badge</span>
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Attach an experience certificate, professional certification, or advisory appointment letter to assist our committee in granting the Verified Mentor status.
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
                  <div className="text-xs text-[var(--accent)] flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" /> Uploading document...
                  </div>
                )}

                {uploadedEvidence && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
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

          {/* Form Actions */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <Link href={`/join/account?role=${roleParam}`}>
              <Button type="button" variant="ghost" className="gap-2 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={uploadingDoc}
              className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90 text-[var(--brand-cream)] font-medium text-xs px-6 h-11 rounded-xl shadow-xs"
            >
              <span>Continue to review</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JoinDetailsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <header className="w-full bg-[var(--brand-navy)] border-b border-[var(--brand-gold)]/20 px-6 lg:px-12 h-16 flex items-center">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <Suspense fallback={<div className="p-12 text-center text-xs text-[var(--muted)]">Loading step...</div>}>
          <JoinDetailsForm />
        </Suspense>
      </main>
    </div>
  );
}
