"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { JoinShowcase } from "@/components/join/JoinShowcase";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";
import { cn } from "@/lib/utils";
import {
  Compass,
  Rocket,
  Award,
  Check,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCw,
  X,
  Globe,
  Building,
  FileCheck2,
  FileText,
  Phone,
  Edit2,
  UserCheck,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Users,
  ChevronDown,
  Upload,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type RoleOption = "aspiring" | "founder" | "mentor";

// ─── Constants ───────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function Linkedin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.76-1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78Z" />
    </svg>
  );
}

// ─── Transition Variants ─────────────────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 0.8,
};

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const steps = ["Role", "Account", "Details", "Review"];
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/50">
        <span>Step {step} of 4 &middot; <strong className="text-[#F5FAF6] font-medium">{steps[step - 1]}</strong></span>
        <span className="text-[#88DECC] font-semibold">{step * 25}%</span>
      </div>
      <div className="grid grid-cols-4 gap-2 h-1 w-full">
        {[1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            className="rounded-full h-full"
            initial={false}
            animate={{
              background:
                s <= step
                  ? "linear-gradient(90deg, #88DECC, #4DB8A4)"
                  : "rgba(255,255,255,0.08)",
              boxShadow:
                s <= step
                  ? "0 0 10px rgba(136,222,204,0.5)"
                  : "none",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: ROLE SELECTION
// ═══════════════════════════════════════════════════════════════════════════════
function Step1Role({
  selectedRole,
  setSelectedRole,
  onContinue,
  onGoogleSignUp,
}: {
  selectedRole: RoleOption;
  setSelectedRole: (r: RoleOption) => void;
  onContinue: () => void;
  onGoogleSignUp: () => void;
}) {
  const roles: {
    key: RoleOption;
    title: string;
    desc: string;
    tags: string[];
    visualDeck: React.ReactNode;
  }[] = [
    {
      key: "founder",
      title: "Founder or Co-founder",
      desc: "Actively building, testing an MVP, or scaling a registered startup in Odisha.",
      tags: ["MVP · Growth", "Investor Access", "Startup Odisha"],
      visualDeck: (
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex items-center justify-center shrink-0">
          <div className="absolute -left-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-400/40 shadow-lg flex items-center justify-center -rotate-12 transition-transform duration-300 group-hover:-rotate-16">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
          <div className="absolute z-10 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-[#0F2A28] to-[#061413] border border-[#88DECC]/50 shadow-xl flex items-center justify-center text-[#88DECC] transition-transform duration-300 group-hover:scale-105">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="absolute -right-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 border border-cyan-400/40 shadow-lg flex items-center justify-center rotate-12 transition-transform duration-300 group-hover:rotate-16">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
        </div>
      ),
    },
    {
      key: "aspiring",
      title: "Aspiring Entrepreneur",
      desc: "Exploring or validating a problem statement before taking the leap.",
      tags: ["Ideation", "Validation", "Mentorship"],
      visualDeck: (
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex items-center justify-center shrink-0">
          <div className="absolute -left-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 border border-indigo-400/40 shadow-lg flex items-center justify-center -rotate-12 transition-transform duration-300 group-hover:-rotate-16">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
          <div className="absolute z-10 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-[#1C1635] to-[#0B0918] border border-[#A78BFA]/50 shadow-xl flex items-center justify-center text-[#A78BFA] transition-transform duration-300 group-hover:scale-105">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="absolute -right-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 border border-fuchsia-400/40 shadow-lg flex items-center justify-center rotate-12 transition-transform duration-300 group-hover:rotate-16">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
        </div>
      ),
    },
    {
      key: "mentor",
      title: "Mentor or Advisor",
      desc: "Guiding, advising, and investing in high-conviction ventures across Odisha.",
      tags: ["Advisory", "Angel Network", "Dealflow"],
      visualDeck: (
        <div className="relative w-20 h-14 sm:w-24 sm:h-16 flex items-center justify-center shrink-0">
          <div className="absolute -left-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-800 border border-amber-400/40 shadow-lg flex items-center justify-center -rotate-12 transition-transform duration-300 group-hover:-rotate-16">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
          <div className="absolute z-10 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-[#2A200F] to-[#120D05] border border-[#F3D3A2]/50 shadow-xl flex items-center justify-center text-[#F3D3A2] transition-transform duration-300 group-hover:scale-105">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="absolute -right-1 w-9 h-11 sm:w-11 sm:h-13 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 border border-orange-400/40 shadow-lg flex items-center justify-center rotate-12 transition-transform duration-300 group-hover:rotate-16">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-lg mx-auto w-full">
      <div className="text-left space-y-1.5">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-light text-[#F5FAF6] tracking-tight leading-tight">
          How would you describe yourself?
        </h1>
        <p className="text-xs sm:text-sm text-[#ECF1EF]/65 leading-relaxed">
          Select the primary path that reflects where you are today in Odisha&apos;s entrepreneurial ecosystem.
        </p>
      </div>

      <div className="space-y-3">
        {roles.map((r) => {
          const isSelected = selectedRole === r.key;
          return (
            <motion.button
              key={r.key}
              type="button"
              onClick={() => setSelectedRole(r.key)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "group relative w-full text-left rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between gap-4 border backdrop-blur-md overflow-hidden",
                isSelected
                  ? "bg-[#88DECC]/[0.08] border-[#88DECC] shadow-[0_0_35px_rgba(136,222,204,0.15)] ring-1 ring-[#88DECC]/40"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05]"
              )}
            >
              {/* Left Info */}
              <div className="flex-1 min-w-0 pr-1">
                <h2 className="text-sm sm:text-base font-medium text-[#F5FAF6] tracking-tight">{r.title}</h2>
                <p className="text-[11px] sm:text-xs text-[#ECF1EF]/60 leading-relaxed mt-1">
                  {r.desc}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] text-[#88DECC]/90 border border-white/[0.08]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Visual Fanned Badges + Radio circle */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden xs:block">
                  {r.visualDeck}
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    isSelected
                      ? "bg-[#88DECC] border-[#88DECC] shadow-[0_0_10px_rgba(136,222,204,0.6)]"
                      : "border-white/25 bg-black/20 group-hover:border-white/40"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-[#03080B] stroke-[3]" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col space-y-2.5 w-full">
        <button type="button" onClick={onContinue} className="join-cta-pill group">
          <span className="font-medium tracking-tight">Continue to Account Setup</span>
          <div className="join-cta-disc shrink-0">
            <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M.6.6 4 4 .6 7.4" />
            </svg>
          </div>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[9px] uppercase font-mono tracking-wider text-[#ECF1EF]/40">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          type="button"
          onClick={onGoogleSignUp}
          className="w-full h-10 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/50">
          <ShieldCheck className="w-3 h-3 text-[#88DECC] shrink-0" />
          <span>Every applicant is personally reviewed by an admin.</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: ACCOUNT DETAILS
// ═══════════════════════════════════════════════════════════════════════════════
function Step2Account({
  role,
  onContinue,
  onBack,
  onGoogleSignUp,
}: {
  role: RoleOption;
  onContinue: () => void;
  onBack: () => void;
  onGoogleSignUp: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = sessionStorage.getItem("oasis_reg_name");
      const savedEmail = sessionStorage.getItem("oasis_reg_email");
      const savedPhone = sessionStorage.getItem("oasis_reg_phone");
      if (savedName) setFullName(savedName);
      if (savedEmail) setEmail(savedEmail);
      if (savedPhone) setPhone(savedPhone);
    }
  }, []);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) { setError("Please enter a valid 10-digit mobile number."); return; }
    if (!isPasswordValid) { setError("Please ensure your password meets all requirements."); return; }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_name", fullName.trim());
      sessionStorage.setItem("oasis_reg_email", email.trim());
      sessionStorage.setItem("oasis_reg_phone", phone.trim());
      sessionStorage.setItem("oasis_reg_password", password);
    }
    onContinue();
  };

  return (
    <div className="space-y-3 max-w-lg mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-display font-light text-[#F5FAF6] tracking-tight">
          Create your account
        </h1>
        <p className="text-xs sm:text-sm text-[#ECF1EF]/65">
          Join 650+ verified founders and mentors across Odisha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Full name</label>
            <input type="text" required value={fullName} onChange={(e) => { setFullName(e.target.value); if (error) setError(""); }}
              placeholder="Your full name"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Email address</label>
            <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              placeholder="name@startup.in"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Mobile number</label>
            <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] focus-within:ring-1.5 focus-within:ring-[#88DECC]/20 transition-all overflow-hidden h-10">
              <span className="inline-flex items-center px-2.5 text-xs font-mono font-semibold text-[#88DECC] border-r border-white/10 bg-black/30">+91</span>
              <input type="tel" required value={phone} onChange={(e) => { setPhone(e.target.value); if (error) setError(""); }}
                placeholder="98765 43210" className="w-full h-full px-2.5 bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75">Password</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-[#ECF1EF]/60 hover:text-[#88DECC] flex items-center gap-1 cursor-pointer transition-colors">
                {showPassword ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <input type={showPassword ? "text" : "password"} required value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              placeholder="••••••••••••"
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 outline-none transition-all" />
          </div>
        </div>

        {/* Password rules */}
        <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-[10px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { ok: hasMinLength, label: "8+ chars" },
              { ok: hasUppercase, label: "Uppercase" },
              { ok: hasLowercase, label: "Lowercase" },
              { ok: hasNumber, label: "Number (0-9)" },
            ].map((rule) => (
              <div key={rule.label} className={`flex items-center gap-1 ${rule.ok ? "text-[#88DECC]" : "text-[#ECF1EF]/40"}`}>
                <Check className={`w-2.5 h-2.5 ${rule.ok ? "opacity-100" : "opacity-30"}`} />
                <span>{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="button" onClick={onBack}
            className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-[#88DECC] hover:border-[#88DECC]/30 transition-all flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button type="submit" className="join-cta-pill flex-1 group">
            <span className="font-medium tracking-tight">Continue to Details</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M.6.6 4 4 .6 7.4" /></svg>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[9px] uppercase font-mono tracking-wider text-[#ECF1EF]/40">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button type="button" onClick={onGoogleSignUp}
          className="w-full h-10 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: VENTURE / PROFILE DETAILS
// ═══════════════════════════════════════════════════════════════════════════════
function Step3Details({
  role,
  onContinue,
  onBack,
}: {
  role: RoleOption;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [city, setCity] = useState("Bhubaneswar");
  const [description, setDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadedEvidence, setUploadedEvidence] = useState<{ fileId: string; filename: string; docType: string } | null>(null);

  // Founder fields
  const [startupName, setStartupName] = useState("");
  const [founderRole, setFounderRole] = useState("Founder / CEO");
  const [stage, setStage] = useState(FOUNDER_STAGES[1]);
  const [isRegistered, setIsRegistered] = useState<"registered" | "early_stage">("early_stage");
  const [selectedDocType, setSelectedDocType] = useState(FOUNDER_DOC_TYPES[0]);

  // Aspiring fields
  const [ideaDomain, setIdeaDomain] = useState("AI & Automation");
  const [govIdProvided, setGovIdProvided] = useState(false);

  // Mentor fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState("8+ years");
  const [mentorDocType, setMentorDocType] = useState(MENTOR_DOC_TYPES[0]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDetails = sessionStorage.getItem("oasis_reg_details");
      if (savedDetails) {
        try {
          const p = JSON.parse(savedDetails);
          if (p.city) setCity(p.city);
          if (p.description) setDescription(p.description);
          if (p.startupName) setStartupName(p.startupName);
          if (p.website) setWebsite(p.website);
          if (p.linkedin) setLinkedin(p.linkedin);
          if (p.founderRole) setFounderRole(p.founderRole);
          if (p.currentCompany) setCurrentCompany(p.currentCompany);
          if (p.jobTitle) setJobTitle(p.jobTitle);
          if (p.uploadedEvidence) setUploadedEvidence(p.uploadedEvidence);
          if (p.isRegistered) setIsRegistered(p.isRegistered);
        } catch {}
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Document size must not exceed 10 MB."); return; }
    try {
      setUploadingDoc(true); setError("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "verification_evidence");
      const res = await fetch("/api/v1/uploads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to upload document. Please ensure it is a PDF, PNG, or JPEG.");
      const json = await res.json();
      setUploadedEvidence({ fileId: json.data?.id || json.id, filename: file.name, docType: category });
    } catch (err: any) { setError(err?.message || "File upload failed."); }
    finally { setUploadingDoc(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLinkedin = linkedin.trim() ? normalizeUrl(linkedin) : "";
    const finalWebsite = website.trim() ? normalizeUrl(website) : "";

    if (role === "founder") {
      if (!startupName.trim()) { setError("Please enter your startup or venture name."); return; }
      if (!description.trim() || description.length < 20) { setError("Please provide a short description of your startup (at least 20 characters)."); return; }
      if (!finalWebsite && !finalLinkedin) { setError("Please provide at least a startup website / demo link or your LinkedIn profile for committee verification."); return; }
    } else if (role === "mentor") {
      if (!currentCompany.trim() || !jobTitle.trim()) { setError("Please provide your current organization and job title."); return; }
      if (!finalLinkedin || !finalLinkedin.toLowerCase().includes("linkedin.com")) { setError("A valid LinkedIn profile URL is required for mentor vetting."); return; }
    } else {
      if (!description.trim() || description.length < 20) { setError("Please share a short description of your business idea (at least 20 characters)."); return; }
    }

    const detailsData = {
      role, city, description, website: finalWebsite, linkedin: finalLinkedin,
      startupName, stage, founderRole, selectedSectors: ["General"],
      isRegistered, uploadedEvidence,
      evidenceFileIds: uploadedEvidence ? [uploadedEvidence.fileId] : [],
      ideaDomain, govIdProvided, currentCompany, jobTitle, yearsExperience,
      referenceName: "", referenceContact: "",
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_details", JSON.stringify(detailsData));
    }
    onContinue();
  };

  return (
    <div className="max-w-lg mx-auto w-full max-h-[calc(100dvh-160px)] flex flex-col">
      <div className="shrink-0 space-y-1 pb-3">
        <h1 className="text-2xl sm:text-3xl font-display font-light text-[#F5FAF6] tracking-tight">
          {role === "founder" && "Tell us about your startup"}
          {role === "mentor" && "Tell us about your expertise"}
          {role === "aspiring" && "Tell us what you want to build"}
        </h1>
        <p className="text-xs sm:text-sm text-[#ECF1EF]/65">
          {role === "founder" && "Our admissions committee verifies venture existence and founder affiliation."}
          {role === "mentor" && "We verify professional track record and domain leadership across Odisha."}
          {role === "aspiring" && "Share your journey. You do not need an incorporated entity to be admitted."}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-2 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto auth-scrollbar pr-1.5 space-y-3">
          <LocationAutocomplete value={city} onChange={(v) => { setCity(v); if (error) setError(""); }}
            label="Base location in Odisha / Diaspora" placeholder="Search city, locality, or address..." required />

          {/* ── ASPIRING ────────────────────────── */}
          {role === "aspiring" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Primary Area of Interest</label>
                <select value={ideaDomain} onChange={(e) => setIdeaDomain(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer">
                  {["AI & Automation","AgriTech & Food Processing","B2B SaaS & Enterprise Software","CleanTech & Renewable Energy","Consumer Brands & D2C","EdTech & Skill Building","FinTech & Digital Payments","HealthTech & Diagnostics","Handloom, Handicrafts & Culture","Logistics & Mobility","Other High-Potential Idea"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Business idea, problem exploring, or goals <span className="text-[#88DECC]">*</span></label>
                <textarea required rows={3} value={description} onChange={(e) => { setDescription(e.target.value); if (error) setError(""); }}
                  placeholder="Describe the problem you're exploring, the kind of business you wish to build, or what support you seek..."
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] focus:ring-2 focus:ring-[#88DECC]/20 outline-none transition-all" />
                <p className="text-[10px] text-[#ECF1EF]/50 mt-1">Minimum 20 characters.</p>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">LinkedIn profile URL <span className="text-[9px] lowercase text-[#ECF1EF]/40">(optional)</span></label>
                <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] transition-all overflow-hidden h-10">
                  <span className="inline-flex items-center px-3 text-xs text-[#88DECC] border-r border-white/10 bg-black/30"><Linkedin className="w-3.5 h-3.5" /></span>
                  <input type="text" inputMode="url" value={linkedin} onChange={(e) => { setLinkedin(e.target.value); if (error) setError(""); }}
                    onBlur={() => { if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin)); }}
                    placeholder="linkedin.com/in/username" className="w-full h-full px-3 bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* ── FOUNDER ─────────────────────────── */}
          {role === "founder" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Startup name <span className="text-[#88DECC]">*</span></label>
                  <input type="text" required value={startupName} onChange={(e) => { setStartupName(e.target.value); if (error) setError(""); }}
                    placeholder="e.g. AgriSpire Labs"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Your role</label>
                  <select value={founderRole} onChange={(e) => setFounderRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer">
                    {["Founder / CEO","Co-founder / CTO","Co-founder / COO","Founding Team Member"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Website / Demo link <span className="text-[#88DECC]">*</span></label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] transition-all overflow-hidden h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30"><Globe className="w-3.5 h-3.5" /></span>
                    <input type="text" inputMode="url" value={website} onChange={(e) => { setWebsite(e.target.value); if (error) setError(""); }}
                      onBlur={() => { if (website.trim()) setWebsite(normalizeUrl(website)); }}
                      placeholder="yourstartup.in" className="w-full h-full px-3 bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">LinkedIn <span className="text-[#88DECC]">*</span></label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] transition-all overflow-hidden h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30"><Linkedin className="w-3.5 h-3.5" /></span>
                    <input type="text" inputMode="url" value={linkedin} onChange={(e) => { setLinkedin(e.target.value); if (error) setError(""); }}
                      onBlur={() => { if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin)); }}
                      placeholder="linkedin.com/in/founder" className="w-full h-full px-3 bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Venture description &amp; progress <span className="text-[#88DECC]">*</span></label>
                <textarea required rows={2} value={description} onChange={(e) => { setDescription(e.target.value); if (error) setError(""); }}
                  placeholder="What customer problem are you solving? Current milestone?"
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] outline-none transition-all" />
              </div>
              {/* Registration Status */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75">Registration Status</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button type="button" onClick={() => setIsRegistered("registered")}
                    className={cn("p-2.5 rounded-xl border text-left transition-all", isRegistered === "registered" ? "bg-[#88DECC]/15 border-[#88DECC] text-[#F5FAF6]" : "bg-white/[0.02] border-white/10 text-[#ECF1EF]/60")}>
                    <div className="font-semibold text-xs text-[#F5FAF6]">Registered</div>
                    <div className="text-[10px] text-[#ECF1EF]/50">Pvt Ltd, LLP, MSME, DPIIT</div>
                  </button>
                  <button type="button" onClick={() => { setIsRegistered("early_stage"); setUploadedEvidence(null); }}
                    className={cn("p-2.5 rounded-xl border text-left transition-all", isRegistered === "early_stage" ? "bg-[#88DECC]/15 border-[#88DECC] text-[#F5FAF6]" : "bg-white/[0.02] border-white/10 text-[#ECF1EF]/60")}>
                    <div className="font-semibold text-xs text-[#F5FAF6]">Early Stage</div>
                    <div className="text-[10px] text-[#ECF1EF]/50">MVP / Website proof</div>
                  </button>
                </div>
                {isRegistered === "registered" && (
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                      <div className="relative">
                        <select
                          value={selectedDocType}
                          onChange={(e) => setSelectedDocType(e.target.value)}
                          className="w-full h-10 px-3 pr-8 rounded-xl bg-[#081318] border border-white/12 text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer appearance-none truncate"
                        >
                          {FOUNDER_DOC_TYPES.map((dt) => (
                            <option key={dt} value={dt} className="bg-[#081318] text-[#F5FAF6]">
                              {dt}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#ECF1EF]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <label className="flex items-center justify-between h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/12 hover:border-[#88DECC]/50 cursor-pointer transition-colors group">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                          onChange={(e) => handleFileUpload(e, selectedDocType)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#88DECC]/20 text-[#88DECC] shrink-0 group-hover:bg-[#88DECC]/30 transition-colors">
                            Choose file
                          </span>
                          <span className="text-[11px] text-[#ECF1EF]/60 truncate">
                            {uploadedEvidence ? uploadedEvidence.filename : "No file chosen"}
                          </span>
                        </div>
                        <Upload className="w-3.5 h-3.5 text-[#ECF1EF]/40 group-hover:text-[#88DECC] shrink-0 ml-1.5 transition-colors" />
                      </label>
                    </div>
                    {uploadingDoc && <div className="text-[10px] text-[#88DECC] flex items-center gap-1"><RotateCw className="w-3 h-3 animate-spin" /> Scanning file...</div>}
                    {uploadedEvidence && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate"><FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="truncate">{uploadedEvidence.filename}</span></div>
                        <button type="button" onClick={() => setUploadedEvidence(null)} className="text-emerald-400 hover:text-emerald-200 ml-2"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MENTOR ──────────────────────────── */}
          {role === "mentor" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Current Organization <span className="text-[#88DECC]">*</span></label>
                  <input type="text" required value={currentCompany} onChange={(e) => { setCurrentCompany(e.target.value); if (error) setError(""); }}
                    placeholder="e.g. Tata Consultancy Services"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Professional Title <span className="text-[#88DECC]">*</span></label>
                  <input type="text" required value={jobTitle} onChange={(e) => { setJobTitle(e.target.value); if (error) setError(""); }}
                    placeholder="e.g. VP Engineering / Angel Investor"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Years of Experience</label>
                  <select value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#081318] border border-white/12 text-sm text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer">
                    {["5-8 years","8-12 years","12-15 years","15+ years"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">LinkedIn profile <span className="text-[#88DECC]">*</span></label>
                  <div className="flex rounded-xl bg-white/[0.04] border border-white/12 focus-within:bg-white/[0.08] focus-within:border-[#88DECC] transition-all overflow-hidden h-10">
                    <span className="inline-flex items-center px-2.5 text-xs text-[#88DECC] border-r border-white/10 bg-black/30"><Linkedin className="w-3.5 h-3.5" /></span>
                    <input type="text" inputMode="url" required value={linkedin} onChange={(e) => { setLinkedin(e.target.value); if (error) setError(""); }}
                      onBlur={() => { if (linkedin.trim()) setLinkedin(normalizeUrl(linkedin)); }}
                      placeholder="linkedin.com/in/mentor" className="w-full h-full px-3 bg-transparent text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ECF1EF]/75 mb-1">Advisory Focus &amp; Mentoring Philosophy</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the types of founders you mentor and topics you can offer actionable guidance on..."
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/12 text-sm text-[#F5FAF6] placeholder-[#ECF1EF]/30 focus:bg-white/[0.08] focus:border-[#88DECC] outline-none transition-all" />
              </div>
              {/* Mentor doc upload */}
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#F5FAF6] font-medium"><FileText className="w-3.5 h-3.5 text-[#88DECC]" /><span>Supporting Evidence (Optional)</span></div>
                  <span className="text-[10px] font-mono text-[#88DECC]">Verified Badge</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div className="relative">
                    <select
                      value={mentorDocType}
                      onChange={(e) => setMentorDocType(e.target.value)}
                      className="w-full h-10 px-3 pr-8 rounded-xl bg-[#081318] border border-white/12 text-xs text-[#F5FAF6] focus:border-[#88DECC] outline-none cursor-pointer appearance-none truncate"
                    >
                      {MENTOR_DOC_TYPES.map((md) => (
                        <option key={md} value={md} className="bg-[#081318] text-[#F5FAF6]">
                          {md}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#ECF1EF]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <label className="flex items-center justify-between h-10 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/12 hover:border-[#88DECC]/50 cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                      onChange={(e) => handleFileUpload(e, mentorDocType)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-[#88DECC]/20 text-[#88DECC] shrink-0 group-hover:bg-[#88DECC]/30 transition-colors">
                        Choose file
                      </span>
                      <span className="text-[11px] text-[#ECF1EF]/60 truncate">
                        {uploadedEvidence ? uploadedEvidence.filename : "No file chosen"}
                      </span>
                    </div>
                    <Upload className="w-3.5 h-3.5 text-[#ECF1EF]/40 group-hover:text-[#88DECC] shrink-0 ml-1.5 transition-colors" />
                  </label>
                </div>
                {uploadingDoc && <div className="text-[10px] text-[#88DECC] flex items-center gap-1"><RotateCw className="w-3 h-3 animate-spin" /> Uploading...</div>}
                {uploadedEvidence && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate"><FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="truncate">{uploadedEvidence.filename}</span></div>
                    <button type="button" onClick={() => setUploadedEvidence(null)} className="text-emerald-400 hover:text-emerald-200 ml-2"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-3 flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-[#88DECC] hover:border-[#88DECC]/30 transition-all flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button type="submit" disabled={uploadingDoc} className="join-cta-pill flex-1 group disabled:opacity-50">
            <span className="font-medium tracking-tight">Continue to review</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M.6.6 4 4 .6 7.4" /></svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW & CONSENT
// ═══════════════════════════════════════════════════════════════════════════════
function Step4Review({
  role,
  onBack,
}: {
  role: RoleOption;
  onBack: () => void;
}) {
  const router = useRouter();

  interface RegData {
    role: string; name: string; email: string; phone?: string; city: string;
    startupName?: string; founderRole?: string; stage?: string; sectors?: string[];
    description?: string; website?: string; linkedin?: string; isRegistered?: string;
    uploadedEvidence?: { fileId: string; filename: string; docType: string } | null;
    evidenceFileIds?: string[]; currentCompany?: string; jobTitle?: string;
    yearsExperience?: string; referenceName?: string; referenceContact?: string;
    ideaDomain?: string; govIdProvided?: boolean;
  }

  const [data, setData] = useState<RegData>({ role, name: "", email: "", phone: "", city: "", startupName: "", founderRole: "", stage: "", sectors: [], description: "", website: "", linkedin: "", evidenceFileIds: [] });
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [guidelinesAgreed, setGuidelinesAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = sessionStorage.getItem("oasis_reg_role") || role;
      const savedName = sessionStorage.getItem("oasis_reg_name") || "";
      const savedEmail = sessionStorage.getItem("oasis_reg_email") || "";
      const savedPhone = sessionStorage.getItem("oasis_reg_phone") || "";
      const savedDetailsRaw = sessionStorage.getItem("oasis_reg_details");
      let detailsObj: Partial<RegData> = {};
      if (savedDetailsRaw) {
        try {
          const p = JSON.parse(savedDetailsRaw);
          detailsObj = {
            city: p.city, startupName: p.startupName, founderRole: p.founderRole,
            stage: p.stage, sectors: p.selectedSectors, description: p.description,
            website: p.website, linkedin: p.linkedin, isRegistered: p.isRegistered,
            uploadedEvidence: p.uploadedEvidence, evidenceFileIds: p.evidenceFileIds || [],
            currentCompany: p.currentCompany, jobTitle: p.jobTitle,
            yearsExperience: p.yearsExperience, referenceName: p.referenceName,
            referenceContact: p.referenceContact, ideaDomain: p.ideaDomain,
            govIdProvided: p.govIdProvided,
          };
        } catch {}
      }
      setData(prev => ({ ...prev, role: savedRole, name: savedName, email: savedEmail, phone: savedPhone, ...detailsObj }));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageConfirmed) { setError("Please confirm that you are 18 years of age or older."); return; }
    if (!guidelinesAgreed) { setError("Please agree to the Community Guidelines and Privacy Notice."); return; }

    setSubmitting(true); setError("");
    try {
      const password = typeof window !== "undefined" ? sessionStorage.getItem("oasis_reg_password") || "" : "";
      if (!password) throw new Error("Account password was missing. Please return to step 2.");

      const primaryRole = data.role === "aspiring" ? "aspiring_entrepreneur" : data.role === "mentor" ? "mentor" : "founder";
      const headline = data.role === "founder"
        ? `${data.founderRole || "Founder"} @ ${data.startupName || "Startup"}`
        : data.role === "mentor"
        ? `${data.jobTitle || "Mentor"} @ ${data.currentCompany || "Organization"}`
        : "Aspiring Entrepreneur";

      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email, phone: data.phone || null, password, primaryRole,
          name: data.name, city: data.city || "Bhubaneswar", headline,
          bio: data.description || "", linkedin: data.linkedin, website: data.website,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          evidenceFileIds: data.evidenceFileIds || [],
          ageConfirmed: true, ageConfirmation: true,
          roleData: {
            startupName: data.startupName, stage: data.stage, founderRole: data.founderRole,
            sectors: data.sectors, website: data.website, linkedin: data.linkedin,
            isRegistered: data.isRegistered, uploadedEvidence: data.uploadedEvidence,
            currentCompany: data.currentCompany, jobTitle: data.jobTitle,
            yearsExperience: data.yearsExperience, referenceName: data.referenceName,
            referenceContact: data.referenceContact, ideaDomain: data.ideaDomain,
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

      if (typeof window !== "undefined") sessionStorage.removeItem("oasis_reg_password");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to submit application.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-lg mx-auto w-full max-h-[calc(100dvh-160px)] flex flex-col">
      <div className="shrink-0 space-y-1 pb-3">
        <h1 className="text-2xl sm:text-3xl font-display font-light text-[#F5FAF6] tracking-tight">
          Review your application
        </h1>
        <p className="text-xs sm:text-sm text-[#ECF1EF]/65">
          Every submission is reviewed by the OASIS membership committee.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        {error && (
          <div className="p-2 mb-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-start gap-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto auth-scrollbar pr-1.5 space-y-3">
          {/* Profile Summary */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden divide-y divide-white/[0.08]">
            <div className="p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#88DECC] font-semibold">Applicant Credentials</span>
              <dl className="grid grid-cols-2 gap-3 text-xs mt-3">
                <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Full name</dt><dd className="font-medium text-[#F5FAF6] mt-0.5 truncate">{data.name}</dd></div>
                <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Email</dt><dd className="font-medium text-[#F5FAF6] mt-0.5 truncate">{data.email}</dd></div>
                <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Mobile</dt><dd className="font-medium text-[#F5FAF6] mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3 text-[#88DECC]" />+91 {data.phone || "—"}</dd></div>
                <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Location</dt><dd className="font-medium text-[#F5FAF6] mt-0.5 truncate">{data.city}</dd></div>
              </dl>
            </div>
            <div className="p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#88DECC] font-semibold">
                {data.role === "founder" ? "Startup Details" : data.role === "mentor" ? "Mentor Credentials" : "Idea & Background"}
              </span>
              <dl className="space-y-2 text-xs mt-3">
                {data.role === "founder" && (<>
                  <div className="grid grid-cols-2 gap-3">
                    <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Startup</dt><dd className="font-medium text-[#F5FAF6] mt-0.5">{data.startupName} ({data.founderRole})</dd></div>
                    {data.website && <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Website</dt><dd className="font-medium text-[#88DECC] mt-0.5 flex items-center gap-1 truncate"><Globe className="w-3 h-3 shrink-0" /><span className="truncate">{data.website}</span></dd></div>}
                  </div>
                  {data.uploadedEvidence && (
                    <div className="inline-flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px]">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>Attached: {data.uploadedEvidence.filename}</span>
                    </div>
                  )}
                </>)}
                {data.role === "mentor" && (<>
                  <div className="grid grid-cols-2 gap-3">
                    <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Organization &amp; Title</dt><dd className="font-medium text-[#F5FAF6] mt-0.5">{data.jobTitle} at {data.currentCompany}</dd></div>
                    <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Experience</dt><dd className="font-medium text-[#F5FAF6] mt-0.5">{data.yearsExperience || "8+ years"}</dd></div>
                  </div>
                </>)}
                {data.role === "aspiring" && (
                  <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Interest Domain</dt><dd className="font-medium text-[#F5FAF6] mt-0.5">{data.ideaDomain || "General"}</dd></div>
                )}
                <div><dt className="text-[10px] text-[#ECF1EF]/50 uppercase font-mono">Description</dt>
                  <dd className="mt-1 text-xs text-[#F5FAF6] leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/10 whitespace-pre-wrap break-words">{data.description || "No description provided."}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Consents */}
          <div className={cn("space-y-2 bg-white/[0.02] border rounded-xl p-3 transition-all", error && !ageConfirmed ? "border-red-500/50" : "border-white/10")}>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5FAF6] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC]" />
              <span className="text-[11px] font-mono">Eligibility &amp; Consents</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <input type="checkbox" required checked={ageConfirmed} onChange={(e) => { setAgeConfirmed(e.target.checked); if (error) setError(""); }}
                className="mt-0.5 w-3.5 h-3.5 rounded text-[#88DECC] bg-black/40 border-white/20 focus:ring-[#88DECC]" />
              <span className="text-[11px] text-[#ECF1EF] leading-tight">I certify that I am at least <strong className="font-semibold text-[#F5FAF6]">18 years of age</strong> and all submitted information is accurate.</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <input type="checkbox" required checked={guidelinesAgreed} onChange={(e) => { setGuidelinesAgreed(e.target.checked); if (error) setError(""); }}
                className="mt-0.5 w-3.5 h-3.5 rounded text-[#88DECC] bg-black/40 border-white/20 focus:ring-[#88DECC]" />
              <span className="text-[11px] text-[#ECF1EF] leading-tight">
                I agree to the <Link href="/legal/guidelines" target="_blank" className="text-[#88DECC] underline font-medium">Community Guidelines</Link> and have read the <Link href="/legal/privacy" target="_blank" className="text-[#88DECC] underline font-medium">Privacy Notice</Link>.
              </span>
            </label>
          </div>
        </div>

        <div className="shrink-0 pt-3 flex items-center gap-3">
          <button type="button" onClick={onBack}
            className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 text-xs text-[#ECF1EF]/70 hover:text-[#88DECC] hover:border-[#88DECC]/30 transition-all flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button type="submit" disabled={submitting || !ageConfirmed || !guidelinesAgreed}
            className="join-cta-pill flex-1 group disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="font-medium tracking-tight">{submitting ? "Submitting application..." : "Submit application"}</span>
            <div className="join-cta-disc shrink-0">
              <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M.6.6 4 4 .6 7.4" /></svg>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN JOIN WIZARD
// ═══════════════════════════════════════════════════════════════════════════════
function JoinWizard() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";
  const stepParam = parseInt(searchParams.get("step") || "1", 10);

  const isNotRegistered = notice === "not_registered";
  const [modalOpen, setModalOpen] = useState(isNotRegistered);
  const [step, setStep] = useState(Math.max(1, Math.min(4, stepParam)));
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState<RoleOption>("founder");

  useEffect(() => {
    if (isNotRegistered) setModalOpen(true);
  }, [isNotRegistered]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (emailParam) sessionStorage.setItem("oasis_reg_email", emailParam);
      if (nameParam) sessionStorage.setItem("oasis_reg_name", nameParam);
    }
  }, [emailParam, nameParam]);

  const goTo = useCallback((target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step]);

  const handleGoogleSignUp = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_role", selectedRole);
      window.location.href = `/api/v1/auth/google?mode=signup&role=${selectedRole}`;
    }
  };

  const handleStep1Continue = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_role", selectedRole);
    }
    goTo(2);
  };

  const STEP_LABELS = ["Role", "Account", "Details", "Review"];

  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2.5 sm:py-3.5 flex items-center justify-between pointer-events-auto">
        <GlassLogoPill href="/" />
        <div className="flex items-center gap-3.5 sm:gap-6">
          <Link href="/faq" className="text-xs text-[#ECF1EF]/60 hover:text-[#88DECC] transition-colors font-medium">
            Need help?
          </Link>
          <Link href="/login" className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span>Log in</span>
            <svg viewBox="0 0 4 7" width="4" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M.5.5 3.5 3.5.5 6.5" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ── Main Content: Split Layout ──────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Interactive Wizard */}
        <div className="flex-1 min-h-0 flex flex-col lg:w-1/2 px-4 sm:px-8 lg:px-12 xl:px-16 pb-4">
          {/* Step indicator pills */}
          <div className="shrink-0 flex items-center gap-2 mb-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all",
                  i + 1 === step
                    ? "bg-[#88DECC]/15 text-[#88DECC] border border-[#88DECC]/30"
                    : i + 1 < step
                    ? "text-[#88DECC]/60"
                    : "text-[#ECF1EF]/30"
                )}>
                  {i + 1 < step ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <span className="text-[9px]">{i + 1}</span>
                  )}
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < 3 && <div className={cn("w-4 h-px", i + 1 < step ? "bg-[#88DECC]/40" : "bg-white/10")} />}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="shrink-0 mb-4">
            <ProgressBar step={step} />
          </div>

          {/* Unregistered user modal */}
          <UnregisteredAccountModal isOpen={modalOpen} onClose={() => setModalOpen(false)} email={emailParam} onContinue={() => setModalOpen(false)} />

          {isNotRegistered && !modalOpen && (
            <div className="shrink-0 mb-3 p-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Applying for Google account: <strong className="font-mono text-[#F3D3A2]">{emailParam || "your email"}</strong></span>
              </div>
              <button type="button" onClick={() => setModalOpen(true)} className="text-[11px] underline text-[#F3D3A2] hover:opacity-80 cursor-pointer">View Notice</button>
            </div>
          )}

          {/* Animated Step Content */}
          <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto auth-scrollbar">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="w-full"
              >
                {step === 1 && (
                  <Step1Role
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    onContinue={handleStep1Continue}
                    onGoogleSignUp={handleGoogleSignUp}
                  />
                )}
                {step === 2 && (
                  <Step2Account
                    role={selectedRole}
                    onContinue={() => goTo(3)}
                    onBack={() => goTo(1)}
                    onGoogleSignUp={handleGoogleSignUp}
                  />
                )}
                {step === 3 && (
                  <Step3Details
                    role={selectedRole}
                    onContinue={() => goTo(4)}
                    onBack={() => goTo(2)}
                  />
                )}
                {step === 4 && (
                  <Step4Review
                    role={selectedRole}
                    onBack={() => goTo(3)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Cinematic Showcase (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative border-l border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070D12] via-[#0a1218] to-[#03080B]" />
          <JoinShowcase role={selectedRole} step={step} />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1.5 text-center text-[10px] text-[#ECF1EF]/35 font-mono">
        OASIS &middot; Curated &amp; Admin Vetted Startup Community &middot; Odisha
      </footer>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="login-bg min-h-screen bg-[#03080B]" />}>
      <JoinWizard />
    </Suspense>
  );
}
