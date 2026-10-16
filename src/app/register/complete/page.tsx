"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, Sparkles, ShieldCheck } from "lucide-react";

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

const SUPPORT_NEEDS = [
  "Angel / Seed Funding",
  "Technical Architecture",
  "Enterprise Sales & Pilots",
  "Co-founder / Early Hiring",
  "Legal & IP Protection",
  "Government Grants (Startup Odisha)",
];

function RegisterCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<"founder" | "mentor" | "aspiring">("founder");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  // Founder fields
  const [startupName, setStartupName] = useState("");
  const [userRoleInStartup, setUserRoleInStartup] = useState("Founder / Co-founder");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["AgriTech"]);
  const [stage, setStage] = useState(FOUNDER_STAGES[0]);
  const [pitch, setPitch] = useState("");
  const [city, setCity] = useState("Bhubaneswar");
  const [website, setWebsite] = useState("");
  const [selectedSupport, setSelectedSupport] = useState<string[]>(["Angel / Seed Funding"]);

  // Consents
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

  const toggleSupport = (sup: string) => {
    setSelectedSupport((prev) =>
      prev.includes(sup) ? prev.filter((s) => s !== sup) : [...prev, sup]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) {
      setError("You must confirm you are 18 years of age or older to join OASIS.");
      return;
    }
    if (!guidelinesAgreed) {
      setError("Please agree to the Community Guidelines & Privacy Notice.");
      return;
    }

    setSubmitting(true);
    setError(null);

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
          ? "Ecosystem Mentor & Advisor"
          : "Aspiring Entrepreneur";

      const res = await fetch("/api/v1/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryRole,
          city: city || "Bhubaneswar",
          headline,
          bio: pitch || "",
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          ageConfirmed: true,
          roleData: {
            startupName,
            userRoleInStartup,
            sectors: selectedSectors,
            stage,
            website,
            supportNeeds: selectedSupport,
          },
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

      // Per PRD & Prompt: user goes straight to locked dashboard
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
              Signed in as {googleEmail}
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--text)] tracking-tight">
            Complete your OASIS profile
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Your name and email have been linked from Google. Please provide your role context so our committee can evaluate your membership.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[var(--danger)] leading-relaxed flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role confirmation */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <label className="block text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Selected Community Role
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(["founder", "mentor", "aspiring"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    role === r
                      ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-[var(--brand-gold)] font-semibold"
                      : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  {r === "founder" ? "Founder" : r === "mentor" ? "Mentor" : "Aspiring"}
                </button>
              ))}
            </div>
          </div>

          {/* Role specific form fields */}
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                Startup or Venture Name
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
                City / Region
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {ODISHA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                  What your startup does (elevator pitch)
                </label>
                <span className="text-[10px] font-mono text-[var(--muted)]">
                  {pitch.length} / 1000
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={1000}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Briefly describe the customer problem, your solution, and current progress in Odisha..."
                className="w-full p-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text)] mb-1.5">
                Website or Deck Link (Optional)
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://myventure.in"
                className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border-strong)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

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
            An admin will review your application. We usually reply within 2 business days.
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
