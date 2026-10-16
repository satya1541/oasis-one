"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CheckCircle2, ShieldCheck, Edit2, AlertCircle } from "lucide-react";

interface RegData {
  role: string;
  name: string;
  email: string;
  city: string;
  startupName?: string;
  founderRole?: string;
  stage?: string;
  sectors?: string[];
  description?: string;
  website?: string;
  linkedin?: string;
  currentCompany?: string;
  jobTitle?: string;
}

function JoinReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "founder";

  const [data, setData] = useState<RegData>({
    role: roleParam,
    name: "",
    email: "",
    city: "",
    startupName: "",
    founderRole: "",
    stage: "",
    sectors: [],
    description: "",
    website: "",
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
            currentCompany: parsed.currentCompany,
            jobTitle: parsed.jobTitle,
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
          ? `${data.jobTitle || "Mentor"} @ ${data.currentCompany || "Company"}`
          : "Aspiring Entrepreneur";

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password,
          primaryRole,
          name: data.name,
          city: data.city || "Bhubaneswar",
          headline,
          bio: data.description || "",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          roleData: {
            startupName: data.startupName,
            stage: data.stage,
            founderRole: data.founderRole,
            sectors: data.sectors,
            website: data.website,
            linkedin: data.linkedin,
            currentCompany: data.currentCompany,
            jobTitle: data.jobTitle,
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
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-display uppercase tracking-[0.18em] text-[var(--muted)] font-medium">
            Step 4 of 4
          </span>
          <span className="text-[var(--muted)]">Review and submit</span>
        </div>
        <div className="grid grid-cols-4 gap-2 h-1 w-full">
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-light text-[var(--text)] tracking-tight">
          Review your application
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Every application is reviewed by the OASIS membership committee before admission.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-[var(--danger)] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-1)] divide-y divide-[var(--border)]/70">
          {/* Section: Profile */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-display uppercase tracking-wider text-[var(--muted)] font-medium">
                Applicant & Role
              </span>
              <Link
                href={`/join?role=${data.role}`}
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
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="font-medium text-[var(--text)] text-sm mt-0.5">{data.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Membership track</dt>
                <dd className="mt-0.5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[var(--brand-navy)] text-[var(--brand-cream)] capitalize">
                    {data.role}
                  </span>
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
                  ? "Startup Details"
                  : data.role === "mentor"
                  ? "Mentorship Profile"
                  : "Exploration Focus"}
              </span>
              <Link
                href={`/join/details?role=${data.role}`}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </Link>
            </div>

            <dl className="space-y-4 text-xs">
              {data.role === "founder" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-[var(--muted)]">Startup name</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.startupName || "AgriOasis"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--muted)]">Stage</dt>
                      <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                        {data.stage || "MVP"}
                      </dd>
                    </div>
                  </div>
                  {data.sectors && data.sectors.length > 0 && (
                    <div>
                      <dt className="text-[var(--muted)] mb-1">Sectors</dt>
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
                </>
              )}

              {data.role === "mentor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-[var(--muted)]">Current role</dt>
                    <dd className="font-medium text-[var(--text)] text-sm mt-0.5">
                      {data.jobTitle || "Mentor"} at {data.currentCompany || "Organization"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">LinkedIn</dt>
                    <dd className="font-medium text-[var(--text)] text-sm mt-0.5 truncate">
                      {data.linkedin || "linkedin.com"}
                    </dd>
                  </div>
                </div>
              )}

              <div>
                <dt className="text-[var(--muted)]">Overview</dt>
                <dd className="mt-1 text-sm text-[var(--text)] leading-relaxed bg-[var(--surface-2)] p-3.5 rounded-xl border border-[var(--border)]/60">
                  {data.description || "No description provided."}
                </dd>
              </div>

              {data.website && (
                <div>
                  <dt className="text-[var(--muted)]">Website / Deck</dt>
                  <dd className="mt-0.5 text-xs text-[var(--accent)] underline">{data.website}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => {
                setAgeConfirmed(e.target.checked);
                if (error) setError("");
              }}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--brand-navy)] focus:ring-[var(--brand-gold)]"
            />
            <span className="text-xs text-[var(--text)] leading-normal">
              I confirm I am 18 years of age or older.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={guidelinesAgreed}
              onChange={(e) => {
                setGuidelinesAgreed(e.target.checked);
                if (error) setError("");
              }}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[var(--brand-navy)] focus:ring-[var(--brand-gold)]"
            />
            <span className="text-xs text-[var(--text)] leading-normal">
              I agree to the{" "}
              <Link href="/guidelines" className="text-[var(--accent)] underline font-medium">
                Community Guidelines
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[var(--accent)] underline font-medium">
                Privacy Notice
              </Link>
              . I understand that respect, confidentiality, and active contribution are conditions of
              membership.
            </span>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full h-12 text-base font-medium"
          >
            {submitting ? "Submitting application..." : "Submit application"}
          </Button>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            An admin will review your application. We usually reply within 2 business days.
          </p>
        </div>
      </form>

      {/* Back button */}
      <div className="mt-6 text-center">
        <Link
          href={`/join/details?role=${data.role}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to application details</span>
        </Link>
      </div>
    </div>
  );
}

export default function JoinReviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
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

      {/* ── Main Wizard Canvas ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <Suspense fallback={<div className="text-center text-sm text-[var(--muted)]">Loading review...</div>}>
          <JoinReviewForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-[var(--border)]/40 text-center text-xs text-[var(--muted)]">
        OASIS ONE · Odisha Startup Community · Admin-approved membership
      </footer>
    </div>
  );
}
