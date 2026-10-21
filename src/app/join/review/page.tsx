"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Edit2,
  AlertCircle,
  Phone,
  Globe,
  FileCheck2,
  UserCheck,
} from "lucide-react";

function Linkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

interface RegData {
  role: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  startupName?: string;
  founderRole?: string;
  stage?: string;
  sectors?: string[];
  description?: string;
  website?: string;
  linkedin?: string;
  isRegistered?: string;
  uploadedEvidence?: {
    fileId: string;
    filename: string;
    docType: string;
  } | null;
  evidenceFileIds?: string[];
  currentCompany?: string;
  jobTitle?: string;
  yearsExperience?: string;
  referenceName?: string;
  referenceContact?: string;
  ideaDomain?: string;
  govIdProvided?: boolean;
}

function JoinReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "founder";

  const [data, setData] = useState<RegData>({
    role: roleParam,
    name: "",
    email: "",
    phone: "",
    city: "",
    startupName: "",
    founderRole: "",
    stage: "",
    sectors: [],
    description: "",
    website: "",
    linkedin: "",
    evidenceFileIds: [],
  });

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = sessionStorage.getItem("oasis_reg_role") || roleParam;
      const savedName = sessionStorage.getItem("oasis_reg_name") || "";
      const savedEmail = sessionStorage.getItem("oasis_reg_email") || "";
      const savedPhone = sessionStorage.getItem("oasis_reg_phone") || "";
      const savedDetailsRaw = sessionStorage.getItem("oasis_reg_details");

      let detailsObj: Partial<RegData> = {};
      if (savedDetailsRaw) {
        try {
          const parsed = JSON.parse(savedDetailsRaw);
          detailsObj = {
            city: parsed.city,
            startupName: parsed.startupName,
            founderRole: parsed.founderRole,
            stage: parsed.stage,
            sectors: parsed.selectedSectors,
            description: parsed.description,
            website: parsed.website,
            linkedin: parsed.linkedin,
            isRegistered: parsed.isRegistered,
            uploadedEvidence: parsed.uploadedEvidence,
            evidenceFileIds: parsed.evidenceFileIds || [],
            currentCompany: parsed.currentCompany,
            jobTitle: parsed.jobTitle,
            yearsExperience: parsed.yearsExperience,
            referenceName: parsed.referenceName,
            referenceContact: parsed.referenceContact,
            ideaDomain: parsed.ideaDomain,
            govIdProvided: parsed.govIdProvided,
          };
        } catch {
          // ignore
        }
      }

      setData((prev) => ({
        ...prev,
        role: savedRole,
        name: savedName,
        email: savedEmail,
        phone: savedPhone,
        ...detailsObj,
      }));
    }
  }, [roleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      setError("Please confirm that you are 18 years of age or older.");
      return;
    }
    if (!guidelinesAgreed) {
      setError("Please agree to the Community Guidelines and Privacy Notice.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const password = typeof window !== "undefined" ? sessionStorage.getItem("oasis_reg_password") || "" : "";
      if (!password) {
        throw new Error("Account password was missing from this session. Please return to step 2 to set your password.");
      }

      const primaryRole =
        data.role === "aspiring"
          ? "aspiring_entrepreneur"
          : data.role === "mentor"
          ? "mentor"
          : "founder";

      const headline =
        data.role === "founder"
          ? `${data.founderRole || "Founder"} @ ${data.startupName || "Startup"}`
          : data.role === "mentor"
          ? `${data.jobTitle || "Mentor"} @ ${data.currentCompany || "Organization"}`
          : "Aspiring Entrepreneur";

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone || null,
          password,
          primaryRole,
          name: data.name,
          city: data.city || "Bhubaneswar",
          headline,
          bio: data.description || "",
          linkedin: data.linkedin,
          website: data.website,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          evidenceFileIds: data.evidenceFileIds || [],
          ageConfirmed: true,
          ageConfirmation: true,
          roleData: {
            startupName: data.startupName,
            stage: data.stage,
            founderRole: data.founderRole,
            sectors: data.sectors,
            website: data.website,
            linkedin: data.linkedin,
            isRegistered: data.isRegistered,
            uploadedEvidence: data.uploadedEvidence,
            currentCompany: data.currentCompany,
            jobTitle: data.jobTitle,
            yearsExperience: data.yearsExperience,
            referenceName: data.referenceName,
            referenceContact: data.referenceContact,
            ideaDomain: data.ideaDomain,
            govIdProvided: data.govIdProvided,
          },
          consents: [
            { type: "privacy_notice", version: "1.0" },
            { type: "community_guidelines", version: "1.0" },
          ],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.message || "Failed to submit membership application.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("oasis_reg_password");
      }

      // Per PRD & Frontend Prompt: user lands on the dashboard where locked state is shown
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to submit application. Please check your information and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[780px] max-h-[calc(100dvh-80px)] flex flex-col mx-auto relative z-10 animate-fade-in-up my-auto join-glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* ── Card Header (shrink-0) ── */}
      <div className="shrink-0 pb-1.5 mb-1.5 border-b border-white/10 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#88DECC] font-mono">
            Step 4 of 4 &middot; Review &amp; Consent
          </span>
          <span className="text-[10px] sm:text-[10.5px] text-[#ECF1EF]/60 font-normal">Final Verification</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1 w-full">
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
          <div className="bg-gradient-to-r from-[#88DECC] to-[#7EC4B5] rounded-full h-full shadow-[0_0_10px_rgba(136,222,204,0.6)]" />
        </div>
        <div>
          <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
            Review your application
          </h1>
          <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70">
            Every submission is reviewed by the OASIS membership committee against role-specific vetting criteria.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-2 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Summary & Consents */}
        <div className="flex-1 min-h-0 overflow-y-auto auth-scrollbar pr-1.5 space-y-2.5">
          {/* Summary Card */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden divide-y divide-white/[0.08]">
            {/* Section: Profile & Identity */}
            <div className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#88DECC] font-semibold">
                  Applicant &amp; Security Credentials
                </span>
                <Link
                  href={`/join/account?role=${data.role}`}
                  className="inline-flex items-center gap-1 text-[11px] text-[#88DECC] hover:underline"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </Link>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Full name</dt>
                  <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 truncate">{data.name}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Email address</dt>
                  <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 truncate">{data.email}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Mobile</dt>
                  <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#88DECC]" />
                    <span>+91 {data.phone || "—"}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Location</dt>
                  <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 truncate">{data.city}</dd>
                </div>
              </dl>
            </div>

            {/* Section: Role Specific Details */}
            <div className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#88DECC] font-semibold">
                  {data.role === "founder"
                    ? "Startup & Verification Details"
                    : data.role === "mentor"
                    ? "Mentorship & Experience Credentials"
                    : "Idea & Background Exploration"}
                </span>
                <Link
                  href={`/join/details?role=${data.role}`}
                  className="inline-flex items-center gap-1 text-[11px] text-[#88DECC] hover:underline"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </Link>
              </div>

              <dl className="space-y-2.5 text-xs">
                {/* FOUNDER */}
                {data.role === "founder" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Startup name</dt>
                        <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5">
                          {data.startupName} ({data.founderRole})
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Development stage</dt>
                        <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5">
                          {data.stage}
                        </dd>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {data.website && (
                        <div>
                          <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Website / MVP</dt>
                          <dd className="font-medium text-[#88DECC] text-xs mt-0.5 flex items-center gap-1 truncate">
                            <Globe className="w-3 h-3 shrink-0" />
                            <span className="truncate">{data.website}</span>
                          </dd>
                        </div>
                      )}
                      {data.linkedin && (
                        <div>
                          <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Founder LinkedIn</dt>
                          <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 flex items-center gap-1 truncate">
                            <Linkedin className="w-3 h-3 text-[#88DECC] shrink-0" />
                            <span className="truncate">{data.linkedin}</span>
                          </dd>
                        </div>
                      )}
                    </div>

                    <div>
                      <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Business Registration</dt>
                      <dd className="mt-0.5">
                        {data.uploadedEvidence ? (
                          <div className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px]">
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Attached: {data.uploadedEvidence.filename}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#ECF1EF]/50 italic">
                            Early Stage / Pre-incorporation (Validated via MVP/Demo)
                          </span>
                        )}
                      </dd>
                    </div>
                  </>
                )}

                {/* MENTOR */}
                {data.role === "mentor" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Organization &amp; Title</dt>
                        <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5">
                          {data.jobTitle} at {data.currentCompany}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Leadership Experience</dt>
                        <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5">
                          {data.yearsExperience || "8+ years"}
                        </dd>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {data.linkedin && (
                        <div>
                          <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">LinkedIn Profile</dt>
                          <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5 flex items-center gap-1 truncate">
                            <Linkedin className="w-3 h-3 text-[#88DECC] shrink-0" />
                            <span className="truncate">{data.linkedin}</span>
                          </dd>
                        </div>
                      )}
                      {data.uploadedEvidence && (
                        <div>
                          <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Experience Certificate</dt>
                          <dd className="font-medium text-emerald-300 text-xs mt-0.5 flex items-center gap-1 truncate">
                            <FileCheck2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{data.uploadedEvidence.filename}</span>
                          </dd>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ASPIRING */}
                {data.role === "aspiring" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Interest Domain</dt>
                        <dd className="font-medium text-[#F5FAF6] text-xs mt-0.5">
                          {data.ideaDomain || "General Entrepreneurship"}
                        </dd>
                      </div>
                      {data.linkedin && (
                        <div>
                          <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">LinkedIn Profile</dt>
                          <dd className="font-medium text-[#88DECC] text-xs mt-0.5 flex items-center gap-1 truncate">
                            <Linkedin className="w-3 h-3 text-[#88DECC] shrink-0" />
                            <span className="truncate">{data.linkedin}</span>
                          </dd>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Bio / Description */}
                <div>
                  <dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Description &amp; Objectives</dt>
                  <dd className="mt-1 text-xs text-[#F5FAF6] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10 whitespace-pre-wrap break-words max-w-full overflow-hidden">
                    {data.description || "No description provided."}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Consents & Agreements */}
          <div className={`space-y-2 bg-white/[0.02] border rounded-xl p-3 transition-all ${
            error && !ageConfirmed ? "border-red-500/50 ring-1 ring-red-500/20" : "border-white/10"
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5FAF6] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC]" />
              <span className="text-[11px] font-mono">Eligibility &amp; Consents</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <input
                type="checkbox"
                id="ageConfirmation"
                required
                checked={ageConfirmed}
                onChange={(e) => {
                  setAgeConfirmed(e.target.checked);
                  if (error) setError("");
                }}
                className="mt-0.5 w-3.5 h-3.5 rounded text-[#88DECC] bg-black/40 border-white/20 focus:ring-[#88DECC]"
              />
              <span className="text-[11px] text-[#ECF1EF] leading-tight">
                I certify that I am at least <strong className="font-semibold text-[#F5FAF6]">18 years of age</strong> and all submitted information is accurate and genuine.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <input
                type="checkbox"
                id="communityGuidelines"
                required
                checked={guidelinesAgreed}
                onChange={(e) => {
                  setGuidelinesAgreed(e.target.checked);
                  if (error) setError("");
                }}
                className="mt-0.5 w-3.5 h-3.5 rounded text-[#88DECC] bg-black/40 border-white/20 focus:ring-[#88DECC]"
              />
              <span className="text-[11px] text-[#ECF1EF] leading-tight">
                I agree to the{" "}
                <Link href="/legal/guidelines" target="_blank" className="text-[#88DECC] underline font-medium">
                  Community Guidelines
                </Link>{" "}
                and have read the{" "}
                <Link href="/legal/privacy" target="_blank" className="text-[#88DECC] underline font-medium">
                  Privacy Notice
                </Link>.
              </span>
            </label>
          </div>
        </div>

        {/* ── Fixed Form Actions at Bottom ── */}
        {/* ── Fixed Card Actions at Bottom ── */}
        <div className="shrink-0 pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <Link href={`/join/details?role=${data.role}`}>
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
            disabled={submitting || !ageConfirmed || !guidelinesAgreed}
            className="join-cta-pill xs:w-auto w-auto px-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="font-medium tracking-tight">
              {submitting ? "Submitting application..." : "Submit application"}
            </span>
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

export default function JoinReviewPage() {
  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header with Glass Logo Pill and Nav ──────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        <Link href="/" className="join-logo-pill" aria-label="OASIS ONE home">
          <div className="w-[30px] h-[30px] rounded-full bg-[#030909] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 46 46" width="30" height="30" fill="none" stroke="#7CC6B5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M24.2 37V24" />
              <path d="M19.8 39.3c1.2-1.9 2.8-2.7 4.4-2.7s3.2.8 4.4 2.7" />
              <path d="M23.8 30.2c-2.8-.6-5.5-2.6-7.2-5-2-1.8-5.2-2-7-4.2-1.4-1.8-1.4-4.2 0-6 2-3 5.8-5.2 8.8-6.2 1.4-.5 2.8-1 4.2-1.3" />
              <path d="M14.8 23V13.2c0-1.4.8-2.6 2.4-3.4" />
              <path d="M24 24.2c-1.8-1.8-3.2-3.8-3.7-6.4-.5-2.6-.6-5.2-.3-7.2" />
              <path d="M24.3 23.2c1.5-3 3.5-6.4 4.3-10.2.4-2.6 1.2-4.1 2.8-4.3H35" />
              <path d="M24.6 25.7c3-.7 5.8-2.1 7.4-4.5 1.2-1.8 1.4-3.8 2.8-5.2 1.4-1.4 3.2-2.1 5.2-2.4" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 pl-2 select-none">
            <span className="font-semibold text-xs sm:text-sm tracking-[0.16em] text-[#F5FAF6] uppercase">
              OASIS
            </span>
            <span className="font-bold text-[8px] sm:text-[9px] tracking-wider bg-[#F3D3A2] text-[#12131F] px-1.5 py-0.5 rounded leading-none uppercase">
              ONE
            </span>
          </div>
        </Link>

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
        <Suspense fallback={<div className="text-center text-sm text-[#ECF1EF]/60">Loading review...</div>}>
          <JoinReviewForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS ONE &middot; Odisha Startup Community &middot; Admin-approved membership
      </footer>
    </div>
  );
}
