"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Check,
  RotateCw,
  X,
  Globe,
  Building,
  ShieldCheck,
  FileCheck2,
  FileText,
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
      const fileId = json.data?.id || json.id;
      setUploadedEvidence({
        fileId,
        filename: file.name,
        docType: category,
      });
    } catch (err: any) {
      setError(err?.message || "File upload failed.");
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
      referenceName,
      referenceContact,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_details", JSON.stringify(detailsData));
    }

    router.push(`/join/review?role=${roleParam}`);
  };

  return (
    <div className="w-full max-w-[780px] max-h-[calc(100dvh-80px)] flex flex-col mx-auto relative z-10 animate-fade-in-up my-auto join-glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* ── Card Header (shrink-0) ── */}
      <div className="shrink-0 pb-1.5 mb-1.5 border-b border-white/10 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#88DECC] font-mono">
            Step 3 of 4 &middot; Details
          </span>
          <span className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/60 font-normal">
            {roleParam === "founder"
              ? "Startup credentials & proof"
              : roleParam === "mentor"
              ? "Mentor credentials & experience"
              : "Idea & background"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 h-1.5 w-full">
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-white/10 rounded-full h-full" />
        </div>
        <div>
          <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
            {roleParam === "founder" && "Tell us about your startup"}
            {roleParam === "mentor" && "Tell us about your expertise"}
            {roleParam === "aspiring" && "Tell us what you want to build"}
          </h1>
          <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70">
            {roleParam === "founder" && "Our admissions committee verifies venture existence and founder affiliation."}
            {roleParam === "mentor" && "We verify professional track record and domain leadership across Odisha."}
            {roleParam === "aspiring" && "Share your journey. You do not need an incorporated entity to be admitted."}
          </p>
        </div>
      </div>

      {/* ── Form Body & Actions ── */}
      <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-2 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Fields with sleek scrollbar */}
        <div className="flex-1 min-h-0 overflow-y-auto auth-scrollbar pr-1.5 space-y-3">
          {/* Base Location */}
          <LocationAutocomplete
            value={city}
            onChange={(selectedLocation) => {
              setCity(selectedLocation);
              if (error) setError("");
            }}
            label="Base location in Odisha / Diaspora"
            placeholder="Search city, locality, or address..."
            required
          />

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ROLE 1: ASPIRING ENTREPRENEUR */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {roleParam === "aspiring" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                  Primary Area of Interest
                </label>
                <select
                  value={ideaDomain}
                  onChange={(e) => setIdeaDomain(e.target.value)}
                  className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer"
                >
                  <option value="AI & Automation">AI & Automation</option>
                  <option value="AgriTech & Food Processing">AgriTech & Food Processing</option>
                  <option value="B2B SaaS & Enterprise Software">B2B SaaS & Enterprise Software</option>
                  <option value="CleanTech & Renewable Energy">CleanTech & Renewable Energy</option>
                  <option value="Consumer Brands & D2C">Consumer Brands & D2C</option>
                  <option value="EdTech & Skill Building">EdTech & Skill Building</option>
                  <option value="FinTech & Digital Payments">FinTech & Digital Payments</option>
                  <option value="HealthTech & Diagnostics">HealthTech & Diagnostics</option>
                  <option value="Handloom, Handicrafts & Culture">Handloom, Handicrafts & Culture</option>
                  <option value="Logistics & Mobility">Logistics & Mobility</option>
                  <option value="Other High-Potential Idea">Other High-Potential Idea</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                  Business idea, problem exploring, or goals <span className="text-[#88DECC]">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Describe the problem you're exploring, the kind of business you wish to build, or what support you seek..."
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
                <p className="text-[10px] text-[#ECF1EF]/50 mt-1">
                  Minimum 20 characters. Helps us match you with peer founders and early mentors.
                </p>
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                  LinkedIn profile URL <span className="text-[9px] lowercase text-[#ECF1EF]/40">(optional)</span>
                </label>
                <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-2 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-9.5 sm:h-10">
                  <span className="inline-flex items-center px-3 text-xs text-[#88DECC] border-r border-white/10 bg-black/30">
                    <Linkedin className="w-3.5 h-3.5" />
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
                    placeholder="linkedin.com/in/username"
                    className="w-full h-full px-3 bg-transparent text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none"
                  />
                </div>
              </div>

              {/* Registration notice */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#F5FAF6] font-medium">
                  <Building className="w-3.5 h-3.5 text-[#88DECC]" />
                  <span>Proof of business registration: Not required</span>
                </div>
                <p className="text-[10px] text-[#ECF1EF]/60">
                  As an aspiring entrepreneur, you are not expected to have incorporated an entity. Admissions are approved based on genuine profile intent.
                </p>
              </div>

              {/* Optional Government ID note */}
              <div className="p-3 rounded-xl border border-white/10 bg-black/20 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#F5FAF6] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC]" />
                    <span>Government ID Verification (Optional)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] text-[#ECF1EF]/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={govIdProvided}
                      onChange={(e) => setGovIdProvided(e.target.checked)}
                      className="rounded text-[#88DECC] focus:ring-0"
                    />
                    <span>Attach ID</span>
                  </label>
                </div>
                {govIdProvided && (
                  <div className="pt-1.5">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(e, "Government ID")}
                      className="text-xs text-[#ECF1EF]/70 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#88DECC]/20 file:text-[#88DECC] hover:file:opacity-90 cursor-pointer"
                    />
                    {uploadingDoc && (
                      <div className="text-[10px] text-[#88DECC] mt-1 flex items-center gap-1">
                        <RotateCw className="w-3 h-3 animate-spin" /> Uploading securely...
                      </div>
                    )}
                    {uploadedEvidence && (
                      <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
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
            <div className="space-y-3">
              {/* Row 1: Startup Name + Founder Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Startup or company name <span className="text-[#88DECC]">*</span>
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
                    className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Your role in the company
                  </label>
                  <select
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer"
                  >
                    <option value="Founder / CEO">Founder / CEO</option>
                    <option value="Co-founder / CTO">Co-founder / CTO</option>
                    <option value="Co-founder / COO">Co-founder / COO</option>
                    <option value="Founding Team Member">Founding Team Member</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Website + LinkedIn URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Website or Demo link <span className="text-[#88DECC]">*</span>
                  </label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-2 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-9.5 sm:h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30">
                      <Globe className="w-3.5 h-3.5" />
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
                      placeholder="yourstartup.in or demo URL"
                      className="w-full h-full px-3 bg-transparent text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Founder LinkedIn profile <span className="text-[#88DECC]">*</span>
                  </label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-2 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-9.5 sm:h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30">
                      <Linkedin className="w-3.5 h-3.5" />
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
                      placeholder="linkedin.com/in/founder"
                      className="w-full h-full px-3 bg-transparent text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Startup Pitch / Description */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                  Short venture description &amp; progress <span className="text-[#88DECC]">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="What customer problem are you solving? What is your current milestone?"
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              {/* Business Registration Evidence Section */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75">
                    Registration Status
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsRegistered("registered")}
                    className={cn(
                      "p-2 rounded-xl border text-left transition-all",
                      isRegistered === "registered"
                        ? "bg-[#88DECC]/15 border-[#88DECC] text-[#F5FAF6]"
                        : "bg-white/[0.02] border-white/10 text-[#ECF1EF]/60 hover:text-[#F5FAF6]"
                    )}
                  >
                    <div className="font-semibold text-xs text-[#F5FAF6]">Registered</div>
                    <div className="text-[10px] text-[#ECF1EF]/50">Pvt Ltd, LLP, MSME, DPIIT</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistered("early_stage");
                      setUploadedEvidence(null);
                    }}
                    className={cn(
                      "p-2 rounded-xl border text-left transition-all",
                      isRegistered === "early_stage"
                        ? "bg-[#88DECC]/15 border-[#88DECC] text-[#F5FAF6]"
                        : "bg-white/[0.02] border-white/10 text-[#ECF1EF]/60 hover:text-[#F5FAF6]"
                    )}
                  >
                    <div className="font-semibold text-xs text-[#F5FAF6]">Early Stage</div>
                    <div className="text-[10px] text-[#ECF1EF]/50">MVP / Website proof</div>
                  </button>
                </div>

                {isRegistered === "registered" ? (
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg bg-[#081318] border border-white/12 text-[11px] text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer"
                      >
                        {FOUNDER_DOC_TYPES.map((dt) => (
                          <option key={dt} value={dt}>
                            {dt}
                          </option>
                        ))}
                      </select>

                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, selectedDocType)}
                        className="text-[11px] text-[#ECF1EF]/60 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-[#88DECC]/20 file:text-[#88DECC] hover:file:opacity-90 cursor-pointer"
                      />
                    </div>

                    {uploadingDoc && (
                      <div className="text-[10px] text-[#88DECC] flex items-center gap-1">
                        <RotateCw className="w-3 h-3 animate-spin" /> Scanning file...
                      </div>
                    )}
                    {uploadedEvidence && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{uploadedEvidence.filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedEvidence(null)}
                          className="text-emerald-400 hover:text-emerald-200 ml-2"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-[#ECF1EF]/50 leading-relaxed italic">
                    Admissions will verify your profile via the product link, demo, or pitch shared above.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* ROLE 3: MENTOR OR ADVISOR */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          {roleParam === "mentor" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Current Organization <span className="text-[#88DECC]">*</span>
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
                    className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Executive / Professional Title <span className="text-[#88DECC]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. VP Engineering / Angel Investor"
                    className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Experience & LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    Years of Leadership Experience
                  </label>
                  <select
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-9.5 sm:h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer"
                  >
                    <option value="5-8 years">5 – 8 years</option>
                    <option value="8-12 years">8 – 12 years</option>
                    <option value="12-15 years">12 – 15 years</option>
                    <option value="15+ years">15+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                    LinkedIn profile URL <span className="text-[#88DECC]">*</span>
                  </label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-2 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-9.5 sm:h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30">
                      <Linkedin className="w-3.5 h-3.5" />
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
                      placeholder="linkedin.com/in/mentor"
                      className="w-full h-full px-3 bg-transparent text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mentoring Bio */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">
                  Advisory Focus &amp; Mentoring Philosophy
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the types of founders you mentor and topics you can offer actionable guidance on..."
                  className="w-full p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-white/12 text-xs sm:text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all"
                />
              </div>

              {/* Supporting Evidence Upload (Optional) */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#F5FAF6] font-medium">
                    <FileText className="w-3.5 h-3.5 text-[#88DECC]" />
                    <span>Supporting Experience Evidence (Optional)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#88DECC]">Verified Mentor Badge</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={mentorDocType}
                    onChange={(e) => setMentorDocType(e.target.value)}
                    className="h-9 px-2.5 rounded-lg bg-[#081318] border border-white/12 text-[11px] text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer"
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
                    className="text-[11px] text-[#ECF1EF]/60 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-[#88DECC]/20 file:text-[#88DECC] hover:file:opacity-90 cursor-pointer"
                  />
                </div>

                {uploadingDoc && (
                  <div className="text-[10px] text-[#88DECC] flex items-center gap-1">
                    <RotateCw className="w-3 h-3 animate-spin" /> Uploading document...
                  </div>
                )}
                {uploadedEvidence && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{uploadedEvidence.filename}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedEvidence(null)}
                      className="text-emerald-400 hover:text-emerald-200 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Fixed Card Actions at Bottom ── */}
        <div className="shrink-0 pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <Link href={`/join/account?role=${roleParam}`}>
            <button
              type="button"
              className="h-8.5 sm:h-9 px-3.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs text-[#ECF1EF]/70 hover:text-[#88DECC] hover:border-[#88DECC]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          </Link>
          <button
            type="submit"
            disabled={uploadingDoc}
            className="join-cta-pill xs:w-auto w-auto px-4 group"
          >
            <span className="font-medium tracking-tight">Continue to review</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M.6.6 4 4 .6 7.4" />
              </svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function JoinDetailsPage() {
  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header with Glass Logo Pill and Nav ──────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        <GlassLogoPill href="/" />

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center text-xs font-normal text-[#ECF1EF]/70 hover:text-[#88DECC] transition-colors py-1.5 px-3"
          >
            &larr; Back to Home
          </Link>
          <Link href="/login" className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span>Already a member? Log in</span>
            <svg viewBox="0 0 4 7" width="4" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <Suspense fallback={<div className="text-center text-sm text-[#ECF1EF]/60">Loading step...</div>}>
          <JoinDetailsForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
