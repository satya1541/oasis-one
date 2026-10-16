"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, AlertCircle, Check } from "lucide-react";

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
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [error, setError] = useState("");

  // Founder fields
  const [startupName, setStartupName] = useState("");
  const [stage, setStage] = useState(FOUNDER_STAGES[1]);
  const [founderRole, setFounderRole] = useState("Founder / CEO");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["AgriTech"]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["Enterprise Sales & Pilots"]);

  // Aspiring fields
  const [ideaDomain, setIdeaDomain] = useState("AI & Automation");
  const [primaryGoal, setPrimaryGoal] = useState("Testing an idea with early users");

  // Mentor fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("8+ years");
  const [selectedMentorDomains, setSelectedMentorDomains] = useState<string[]>([
    "Product-Market Fit",
    "Go-to-Market & Sales",
  ]);

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
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const toggleSector = (sector: string) => {
    if (selectedSectors.includes(sector)) {
      if (selectedSectors.length > 1) {
        setSelectedSectors(selectedSectors.filter((s) => s !== sector));
      }
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const toggleNeed = (need: string) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const toggleMentorDomain = (dom: string) => {
    if (selectedMentorDomains.includes(dom)) {
      if (selectedMentorDomains.length > 1) {
        setSelectedMentorDomains(selectedMentorDomains.filter((d) => d !== dom));
      }
    } else {
      setSelectedMentorDomains([...selectedMentorDomains, dom]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (roleParam === "founder") {
      if (!startupName.trim()) {
        setError("Please enter your startup name.");
        return;
      }
      if (!description.trim() || description.length < 20) {
        setError("Add a short description (at least 20 characters) so mentors know how to help.");
        return;
      }
    } else if (roleParam === "mentor") {
      if (!currentCompany.trim() || !jobTitle.trim()) {
        setError("Please provide your current company and job title.");
        return;
      }
      if (!linkedin.trim() || !linkedin.includes("linkedin.com")) {
        setError("A valid LinkedIn profile URL is required for mentor verification.");
        return;
      }
    } else {
      if (!description.trim() || description.length < 20) {
        setError("Please tell us what you're hoping to build or explore.");
        return;
      }
    }

    const detailsData = {
      role: roleParam,
      city,
      description,
      website,
      linkedin,
      startupName,
      stage,
      founderRole,
      selectedSectors,
      selectedNeeds,
      ideaDomain,
      primaryGoal,
      currentCompany,
      jobTitle,
      yearsExperience,
      selectedMentorDomains,
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
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-display uppercase tracking-[0.18em] text-[var(--muted)] font-medium">
            Step 3 of 4
          </span>
          <span className="text-[var(--muted)]">
            {roleParam === "founder"
              ? "Startup profile"
              : roleParam === "mentor"
              ? "Mentorship background"
              : "Focus & interests"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 h-1 w-full">
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--brand-navy)] rounded-full h-full" />
          <div className="bg-[var(--border)] rounded-full h-full" />
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-light text-[var(--text)] tracking-tight">
          {roleParam === "founder" && "Tell us about your startup."}
          {roleParam === "mentor" && "Tell us about your expertise."}
          {roleParam === "aspiring" && "Tell us what you want to build."}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {roleParam === "founder" &&
            "This information helps matching mentors and collaborators understand your focus."}
          {roleParam === "mentor" &&
            "Our committee reviews mentor applications to maintain high trust and relevant advice."}
          {roleParam === "aspiring" &&
            "Share your journey so far. You do not need a registered company to join."}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 lg:p-9 shadow-[var(--shadow-1)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-[var(--danger)] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── FOUNDER SPECIFIC FIELDS ── */}
          {roleParam === "founder" && (
            <>
              {/* Startup Name & Founder Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Startup Name
                  </label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => {
                      setStartupName(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. KrishiKalyan, MediTrack"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Your Role
                  </label>
                  <select
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all cursor-pointer"
                  >
                    <option value="Founder / CEO">Founder / CEO</option>
                    <option value="Co-founder & CTO">Co-founder & CTO</option>
                    <option value="Co-founder & COO">Co-founder & COO</option>
                    <option value="Founding Team">Founding Team</option>
                  </select>
                </div>
              </div>

              {/* Sector Multi-select Chips */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Sector (pick all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOUNDER_SECTORS.map((sec) => {
                    const isSelected = selectedSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => toggleSector(sec)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-[var(--brand-navy)] shadow-xs"
                            : "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)] hover:border-[var(--brand-navy)]/30"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage Selection */}
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Current Stage
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FOUNDER_STAGES.map((stg) => {
                    const isSelected = stage === stg;
                    return (
                      <button
                        type="button"
                        key={stg}
                        onClick={() => setStage(stg)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent)]/5 font-medium text-[var(--brand-navy)]"
                            : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        <span>{stg}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── MENTOR SPECIFIC FIELDS ── */}
          {roleParam === "mentor" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Current Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Infosys, TCS, AIIMS BBSR, Startup"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                    Title / Position
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. VP Engineering, Angel Investor"
                    className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Mentorship Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {MENTOR_DOMAINS.map((dom) => {
                    const isSelected = selectedMentorDomains.includes(dom);
                    return (
                      <button
                        type="button"
                        key={dom}
                        onClick={() => toggleMentorDomain(dom)}
                        className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-[var(--brand-navy)]"
                            : "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)] hover:border-[var(--brand-navy)]/30"
                        }`}
                      >
                        {dom}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  LinkedIn Profile (required for verification)
                </label>
                <input
                  type="url"
                  required
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                />
              </div>
            </>
          )}

          {/* ── ASPIRING SPECIFIC FIELDS ── */}
          {roleParam === "aspiring" && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  What domain interests you?
                </label>
                <input
                  type="text"
                  value={ideaDomain}
                  onChange={(e) => setIdeaDomain(e.target.value)}
                  placeholder="e.g. AgriTech logistics, Healthcare AI, Handloom D2C"
                  className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                  Your primary goal right now
                </label>
                <select
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all cursor-pointer"
                >
                  <option value="Testing an idea with early users">Testing an idea with early users</option>
                  <option value="Finding a technical or business co-founder">Finding a technical or business co-founder</option>
                  <option value="Learning startup mechanics and building an MVP">Learning startup mechanics and building an MVP</option>
                  <option value="Connecting with mentors in Odisha">Connecting with mentors in Odisha</option>
                </select>
              </div>
            </>
          )}

          {/* Description Textarea with JetBrains Mono 0/1000 Counter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                {roleParam === "founder" && "What does your startup do?"}
                {roleParam === "mentor" && "Brief bio / how you help founders"}
                {roleParam === "aspiring" && "What are you exploring or hoping to build?"}
              </label>
              <span className="font-mono text-[11px] text-[var(--muted)]">
                {description.length} / 1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError("");
              }}
              placeholder={
                roleParam === "founder"
                  ? "We are building an IoT soil sensor and mobile advisory platform for paddy farmers in coastal Odisha..."
                  : roleParam === "mentor"
                  ? "12+ years in SaaS product management. Passionate about helping Odisha founders with pricing models and enterprise pilot agreements..."
                  : "I am a software engineer looking to build a logistics aggregation tool for small textile weavers in Sambalpur..."
              }
              className="w-full p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] placeholder-[var(--muted)]/60 focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all resize-y"
            />
          </div>

          {/* City Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                City / Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all cursor-pointer"
              >
                {ODISHA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Website or Deck URL <span className="text-[var(--muted)]/60 font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourstartup.in"
                className="w-full h-12 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-[var(--text)] focus:bg-white focus:outline-none focus:border-[var(--brand-navy)] transition-all"
              />
            </div>
          </div>

          {/* Founder: Support Needed */}
          {roleParam === "founder" && (
            <div>
              <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                Support you need currently
              </label>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_NEEDS.map((need) => {
                  const isSelected = selectedNeeds.includes(need);
                  return (
                    <button
                      type="button"
                      key={need}
                      onClick={() => toggleNeed(need)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--brand-navy)] text-[var(--brand-cream)] border-[var(--brand-navy)]"
                          : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]"
                      }`}
                    >
                      {need}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/join/account?role=${roleParam}`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button type="submit" size="lg" className="min-w-[160px]">
              Continue
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
        <Suspense fallback={<div className="text-center text-sm text-[var(--muted)]">Loading details...</div>}>
          <JoinDetailsForm />
        </Suspense>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="py-6 border-t border-[var(--border)]/40 text-center text-xs text-[var(--muted)]">
        OASIS ONE · Odisha Startup Community · Admin-approved membership
      </footer>
    </div>
  );
}
