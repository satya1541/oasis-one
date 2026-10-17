"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Edit2,
  AlertCircle,
  Phone,
  Globe,
  FileCheck2,
  Building,
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
      setError(err.message || "Failed to submit application. Please check your information and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[680px] mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-display uppercase tracking-[0.22em] text-[var(--accent)] font-semibold text-[11px]">
            Step 4 of 4
          </span>
          <span className="text-xs text-[var(--muted)] font-medium">Review &amp; Consent</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5 h-1.5 w-full">
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
          <div className="bg-gradient-to-r from-[var(--brand-gold)] to-[#E9C68C] rounded-full h-full shadow-[0_0_8px_rgba(243,211,162,0.6)]" />
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8 space-y-1.5">
        <h1 className="text-3xl font-display font-light text-[var(--text)] tracking-tight">
          Review your application
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Every submission is reviewed by the OASIS membership committee against role-specific vetting criteria.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-[var(--danger)] flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Card */}
        <div className="card-luxury overflow-hidden divide-y divide-[var(--border)]/70">
          {/* Section: Profile & Identity */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display uppercase tracking-wider text-[var(--muted)] font-medium">
                Applicant &amp; Security Credentials
              </span>
              <Link
                href={`/join/account?role=${data.role}`}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </Link>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-[var(--muted)]">Full name</dt>
                <dd className="font-medium text-[var(--text)] text-sm mt-0.5">{data.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Email address</dt>
                <dd className="font-medium text-[var(--text)] text-sm mt-0.5">{data.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Mobile number</dt>
                <dd className="font-medium text-[var(--text)] text-sm mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>+91 {data.phone || "Not provided"}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Location</dt>
                <dd className="font-medium text-[var(--text)] text-sm mt-0.5">{data.city}</dd>
              </div>
            </dl>
          </div>

          {/* Section: Role Specific Details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display uppercase tracking-wider text-[var(--muted)] font-medium">
                {data.role === "founder"
                  ? "Startup & Verification Details"
                  : data.role === "mentor"
                  ? "Mentorship & Experience Credentials"
                  : "Idea & Background Exploration"}
              </span>
              <Link
                href={`/join/details?role=${data.role}`}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </Link>
            </div>

            <dl className="space-y-4 text-xs">
              {/* FOUNDER */}
              {data.role === "founder" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-[var(--muted)]">Startup name</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.startupName} ({data.founderRole})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Development stage</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.stage}
                      </dd>
                    </div>
                  </div>

                  {data.sectors && data.sectors.length > 0 && (
                    <div>
                      <dt className="text-[var(--muted)] mb-1">Focus sectors</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {data.sectors.map((sec) => (
                          <span
                            key={sec}
                            className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[11px] text-[var(--text)]"
                          >
                            {sec}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.website && (
                      <div>
                        <dt className="text-[var(--muted)]">Website / MVP Link</dt>
                        <dd className="font-medium text-[var(--accent)] text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <a href={data.website.startsWith("http") ? data.website : `https://${data.website}`} target="_blank" rel="noreferrer" className="underline truncate">
                            {data.website}
                          </a>
                        </dd>
                      </div>
                    )}
                    {data.linkedin && (
                      <div>
                        <dt className="text-[var(--muted)]">Founder LinkedIn</dt>
                        <dd className="font-medium text-[var(--text)] text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                          <span className="truncate">{data.linkedin}</span>
                        </dd>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Evidence */}
                  <div>
                    <dt className="text-[var(--muted)]">Business Registration</dt>
                    <dd className="mt-1">
                      {data.uploadedEvidence ? (
                        <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Attached: {data.uploadedEvidence.filename} ({data.uploadedEvidence.docType})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--muted)] italic">
                          Early Stage / Pre-incorporation (Validated via MVP / Demo)
                        </span>
                      )}
                    </dd>
                  </div>
                </>
              )}

              {/* MENTOR */}
              {data.role === "mentor" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-[var(--muted)]">Organization &amp; Title</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.jobTitle} at {data.currentCompany}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Leadership Experience</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.yearsExperience || "8+ years"}
                      </dd>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.linkedin && (
                      <div>
                        <dt className="text-[var(--muted)]">LinkedIn Profile</dt>
                        <dd className="font-medium text-[var(--text)] text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                          <span className="truncate">{data.linkedin}</span>
                        </dd>
                      </div>
                    )}
                    {data.website && (
                      <div>
                        <dt className="text-[var(--muted)]">Portfolio / Website</dt>
                        <dd className="font-medium text-[var(--accent)] text-xs mt-0.5 flex items-center gap-1.5 truncate">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{data.website}</span>
                        </dd>
                      </div>
                    )}
                  </div>

                  {data.referenceName && (
                    <div>
                      <dt className="text-[var(--muted)]">Professional Reference</dt>
                      <dd className="font-medium text-[var(--text)] text-xs mt-0.5 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{data.referenceName} ({data.referenceContact})</span>
                      </dd>
                    </div>
                  )}

                  {data.uploadedEvidence && (
                    <div>
                      <dt className="text-[var(--muted)]">Supporting Experience Certificate</dt>
                      <dd className="mt-1">
                        <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Attached: {data.uploadedEvidence.filename} ({data.uploadedEvidence.docType})</span>
                        </div>
                      </dd>
                    </div>
                  )}
                </>
              )}

              {/* ASPIRING */}
              {data.role === "aspiring" && (
                <>
                  {data.linkedin && (
                    <div>
                      <dt className="text-[var(--muted)]">LinkedIn Profile</dt>
                      <dd className="font-medium text-[var(--accent)] text-xs mt-0.5 flex items-center gap-1.5 truncate max-w-full">
                        <Linkedin className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                        <a
                          href={data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline truncate block max-w-full"
                        >
                          {data.linkedin}
                        </a>
                      </dd>
                    </div>
                  )}
                  {data.uploadedEvidence && (
                    <div>
                      <dt className="text-[var(--muted)]">Government ID (Optional)</dt>
                      <dd className="mt-1">
                        <div className="inline-flex items-center gap-2 p-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Attached: {data.uploadedEvidence.filename}</span>
                        </div>
                      </dd>
                    </div>
                  )}
                </>
              )}

              {/* Bio / Description */}
              <div>
                <dt className="text-[var(--muted)]">Description &amp; Goals</dt>
                <dd className="mt-1 text-xs text-[var(--text)] leading-relaxed bg-[var(--surface-2)] p-3.5 rounded-xl border border-[var(--border)]/60 whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full overflow-hidden">
                  {data.description || "No description provided."}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Consents & Agreements */}
        <div className={`space-y-4 bg-[var(--surface)] border rounded-2xl p-6 shadow-[var(--shadow-1)] transition-all ${
          error && !ageConfirmed ? "border-red-400 ring-2 ring-red-100 dark:ring-red-950/40" : "border-[var(--border)]"
        }`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
            <span>Eligibility &amp; Community Consents</span>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors">
            <input
              type="checkbox"
              id="ageConfirmation"
              required
              checked={ageConfirmed}
              onChange={(e) => {
                setAgeConfirmed(e.target.checked);
                if (error) setError("");
              }}
              className="mt-0.5 w-4 h-4 rounded text-[var(--brand-navy)] border-[var(--border-strong)] focus:ring-[var(--brand-gold)]"
            />
            <span className="text-xs text-[var(--text)] leading-relaxed">
              I certify that I am at least <strong className="font-semibold text-[var(--text)]">18 years of age</strong> and the information submitted above is accurate and genuine.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors">
            <input
              type="checkbox"
              id="communityGuidelines"
              required
              checked={guidelinesAgreed}
              onChange={(e) => {
                setGuidelinesAgreed(e.target.checked);
                if (error) setError("");
              }}
              className="mt-0.5 w-4 h-4 rounded text-[var(--brand-navy)] border-[var(--border-strong)] focus:ring-[var(--brand-gold)]"
            />
            <span className="text-xs text-[var(--text)] leading-relaxed">
              I agree to abide by the{" "}
              <Link href="/legal/guidelines" target="_blank" className="text-[var(--accent)] underline font-medium">
                OASIS Community Guidelines
              </Link>{" "}
              and have read the{" "}
              <Link href="/legal/privacy" target="_blank" className="text-[var(--accent)] underline font-medium">
                Privacy Notice
              </Link>.
            </span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-between">
          <Link href={`/join/details?role=${data.role}`}>
            <Button type="button" variant="ghost" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting || !ageConfirmed || !guidelinesAgreed}
            className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90 text-[var(--brand-cream)] font-medium text-xs px-8 h-12 rounded-xl shadow-xs gap-2"
          >
            {submitting ? "Submitting application..." : "Submit application"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function JoinReviewPage() {
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
        <Suspense fallback={<div className="p-12 text-center text-xs text-[var(--muted)]">Loading review...</div>}>
          <JoinReviewForm />
        </Suspense>
      </main>
    </div>
  );
}
