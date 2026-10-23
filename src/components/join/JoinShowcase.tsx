"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Rocket,
  Compass,
  Award,
  Users,
  TrendingUp,
  Lightbulb,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Activity,
  FolderGit2,
  MessageSquare,
} from "lucide-react";

type RoleOption = "aspiring" | "founder" | "mentor";

interface ShowcaseData {
  badge: string;
  headline: string;
  sub: string;
  primaryMetric: { value: string; label: string };
  metrics: { value: string; label: string }[];
  featuredProject: {
    name: string;
    category: string;
    stage: string;
    progress: number;
    color: string;
  };
  highlightDiscussion: {
    author: string;
    role: string;
    message: string;
  };
}

const ROLE_SHOWCASE: Record<RoleOption, ShowcaseData> = {
  founder: {
    badge: "Odisha Founder Society",
    headline: "Scale with Odisha's\nBest Founders",
    sub: "Direct access to vetted peer masterminds, investor syndicates, and Startup Odisha fast-track validation.",
    primaryMetric: { value: "₹42 Cr+", label: "Capital Raised" },
    metrics: [
      { value: "180+", label: "Active Ventures" },
      { value: "60+", label: "Vetted Mentors" },
      { value: "94%", label: "Admissions Bar" },
    ],
    featuredProject: {
      name: "AgriSpire Technologies",
      category: "AgriTech & Automation",
      stage: "Seed Round · Bhubaneswar",
      progress: 78,
      color: "#88DECC",
    },
    highlightDiscussion: {
      author: "Priyanka Mishra",
      role: "Founder, GreenEco Odisha",
      message: "Startup Odisha approved our grant! Looking for manufacturing partner intros in Cuttack.",
    },
  },
  aspiring: {
    badge: "Builder Launchpad",
    headline: "From Idea to\nFirst Customer",
    sub: "Idea validation sandbox, co-founder discovery, and hands-on office hours before taking the leap.",
    primaryMetric: { value: "85+", label: "Ideas Validated" },
    metrics: [
      { value: "320+", label: "Aspiring Builders" },
      { value: "40+", label: "Incubator Partners" },
      { value: "100%", label: "Zero Vanity Noise" },
    ],
    featuredProject: {
      name: "Chilika Solar Robotics",
      category: "CleanTech & Hardware",
      stage: "Prototype Validation · Rourkela",
      progress: 62,
      color: "#A78BFA",
    },
    highlightDiscussion: {
      author: "Arjun Patnaik",
      role: "Aspiring Founder",
      message: "Looking for a technical co-founder with computer vision experience for an aquaculture monitoring MVP.",
    },
  },
  mentor: {
    badge: "Leadership Circle",
    headline: "Guide High-Conviction\nVentures",
    sub: "Curated dealflow, advisory opportunities, and invite-only roundtables shaping Odisha's future tech economy.",
    primaryMetric: { value: "2,400+", label: "Advisory Hours" },
    metrics: [
      { value: "60+", label: "Active Mentors" },
      { value: "140+", label: "Ventures Guided" },
      { value: "12+ yrs", label: "Avg. Experience" },
    ],
    featuredProject: {
      name: "HealthPulse Diagnostics",
      category: "HealthTech & AI",
      stage: "Early Revenue · Bhubaneswar",
      progress: 89,
      color: "#F3D3A2",
    },
    highlightDiscussion: {
      author: "Dr. Soumya Ray",
      role: "Advisor & Angel Investor",
      message: "Hosted pitch reviews for 6 healthtech founders today. Super impressed by the clinical validation.",
    },
  },
};

const LOGIN_SHOWCASE: ShowcaseData = {
  badge: "Member Sanctuary · Odisha",
  headline: "Odisha's Most Exclusive\nFounder & Mentor Network",
  sub: "Connecting 650+ verified founders, high-conviction mentors, and active investor syndicates in a trusted, noise-free sanctuary.",
  primaryMetric: { value: "₹42 Cr+", label: "Capital Raised" },
  metrics: [
    { value: "180+", label: "Active Ventures" },
    { value: "60+", label: "Vetted Mentors" },
    { value: "100%", label: "Curated Network" },
  ],
  featuredProject: {
    name: "AgriSpire Technologies",
    category: "AgriTech & Automation",
    stage: "Seed Round · Bhubaneswar",
    progress: 78,
    color: "#88DECC",
  },
  highlightDiscussion: {
    author: "Priyanka Mishra",
    role: "Founder, GreenEco Odisha",
    message: "Startup Odisha approved our grant! Looking for manufacturing partner intros in Cuttack.",
  },
};

export function JoinShowcase({
  role = "founder",
  step = 1,
  variant = "join",
}: {
  role?: RoleOption;
  step?: number;
  variant?: "join" | "login";
}) {
  const data = variant === "login" ? LOGIN_SHOWCASE : ROLE_SHOWCASE[role];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 lg:p-10 select-none overflow-hidden">
      {/* ── Ambient Floating Glows ───────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-[10%] w-[380px] h-[380px] rounded-full bg-[#88DECC]/[0.06] blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] rounded-full bg-[#A78BFA]/[0.05] blur-[100px]" />
        <div className="absolute top-[45%] left-[25%] w-[260px] h-[260px] rounded-full bg-[#F3D3A2]/[0.04] blur-[90px]" />
      </div>

      {/* ── Floating Micro Orbs (Cinematic atmosphere) ──────────────────── */}
      <motion.div
        className="absolute top-[12%] right-[18%] w-3 h-3 rounded-full bg-[#88DECC] shadow-[0_0_16px_#88DECC]"
        animate={{ y: [0, -14, 0], x: [0, 6, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[28%] left-[12%] w-2.5 h-2.5 rounded-full bg-[#F3D3A2] shadow-[0_0_14px_#F3D3A2]"
        animate={{ y: [0, 10, 0], x: [0, -4, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-[38%] left-[16%] w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_12px_#A78BFA]"
        animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[16%] right-[22%] w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_12px_#38BDF8]"
        animate={{ y: [0, 12, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* ── Center Content Stack ─────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[560px] flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={variant === "login" ? "login" : role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center w-full"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md mb-4 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#88DECC] animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider uppercase text-[#ECF1EF]/90 font-medium">
                {data.badge}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-display font-light text-[#F5FAF6] leading-[1.12] tracking-tight whitespace-pre-line mb-3">
              {data.headline}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#ECF1EF]/65 leading-relaxed max-w-md mb-6">
              {data.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── 3D FLOATING TABLET MOCKUP (Perspective Device) ────────────── */}
        <div
          className="relative w-full mt-2"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            className="relative w-full rounded-[24px] sm:rounded-[30px] p-2.5 sm:p-3 bg-gradient-to-b from-[#1C2C35] to-[#0A1218] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_60px_rgba(136,222,204,0.12)]"
            style={{
              transformStyle: "preserve-3d",
              rotateX: 8,
              rotateY: -12,
              rotateZ: -1.5,
            }}
            animate={{
              rotateY: [-12, -9, -12],
              rotateX: [8, 6, 8],
              y: [0, -6, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Tablet Camera Bezel */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-black/60 border border-white/20 z-20" />

            {/* Tablet Screen Container */}
            <div className="relative rounded-[18px] sm:rounded-[22px] bg-[#03080B] border border-white/10 overflow-hidden text-left flex flex-col h-[280px] sm:h-[310px]">
              {/* Subtle Screen Reflection Glare */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] z-30" />

              {/* Tablet Top App Bar */}
              <div className="h-10 px-3.5 border-b border-white/[0.08] bg-[#070D12] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Image
                    src="/brand/oasis-mark.png"
                    alt="OASIS"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="text-[11px] font-display font-medium text-[#F5FAF6] tracking-wider">
                    OASIS ONE
                  </span>
                </div>

                {/* Simulated Tabs */}
                <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
                  {["Dashboard", "Ventures", "Mentors", "Capital"].map((tab, idx) => (
                    <span
                      key={tab}
                      className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                        idx === 0
                          ? "bg-[#88DECC]/20 text-[#88DECC] font-semibold"
                          : "text-[#ECF1EF]/40"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>

                {/* Live Member Status */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-[8px] font-mono font-bold text-emerald-300">
                      PM
                    </div>
                    <div className="w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-[8px] font-mono font-bold text-amber-300">
                      SR
                    </div>
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">
                      AP
                    </div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>

              {/* Tablet Screen Body Grid */}
              <div className="flex-1 p-3.5 grid grid-cols-12 gap-3 overflow-hidden bg-gradient-to-b from-[#050B0F] to-[#03080B]">
                {/* Left Card: Active Venture Progress */}
                <div className="col-span-7 flex flex-col justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-[#88DECC]">
                        Featured Venture
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-[#F5FAF6] truncate">
                      {data.featuredProject.name}
                    </h3>
                    <p className="text-[10px] text-[#ECF1EF]/55 truncate mt-0.5">
                      {data.featuredProject.category}
                    </p>
                    <p className="text-[9px] font-mono text-[#ECF1EF]/40 mt-1">
                      {data.featuredProject.stage}
                    </p>
                  </div>

                  {/* Progress Ring / Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[#ECF1EF]/50">Admissions &amp; Milestone</span>
                      <span className="text-[#88DECC] font-semibold">{data.featuredProject.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#88DECC] to-[#4DB8A4]"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.featuredProject.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Card: Live Discussion / Alert */}
                <div className="col-span-5 flex flex-col justify-between p-3 rounded-xl bg-white/[0.025] border border-white/[0.07]">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="w-3 h-3 text-[#F3D3A2]" />
                      <span className="text-[9px] uppercase font-mono tracking-wider text-[#F3D3A2]">
                        Community
                      </span>
                    </div>
                    <p className="text-[9px] font-medium text-[#F5FAF6] truncate">
                      {data.highlightDiscussion.author}
                    </p>
                    <p className="text-[8px] text-[#ECF1EF]/40 truncate">
                      {data.highlightDiscussion.role}
                    </p>
                    <p className="text-[9px] text-[#ECF1EF]/70 line-clamp-3 mt-1.5 leading-snug">
                      &ldquo;{data.highlightDiscussion.message}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-1 pt-1 text-[8px] font-mono text-[#88DECC]">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Startup Odisha Vetted</span>
                  </div>
                </div>

                {/* Bottom Full-Width Stats Ribbon Inside Tablet */}
                <div className="col-span-12 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-around text-center">
                  <div>
                    <div className="text-xs font-semibold text-[#88DECC] font-mono">
                      {data.primaryMetric.value}
                    </div>
                    <div className="text-[8px] text-[#ECF1EF]/40 font-mono uppercase">
                      {data.primaryMetric.label}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  {data.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-xs font-semibold text-[#F5FAF6] font-mono">
                        {m.value}
                      </div>
                      <div className="text-[8px] text-[#ECF1EF]/40 font-mono uppercase">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Floating Badge 1 (Top Left Overhang) ────────────────────────── */}
          <motion.div
            className="absolute -top-3 -left-3 sm:-left-6 px-3 py-1.5 rounded-xl bg-black/80 border border-[#88DECC]/40 backdrop-blur-xl shadow-2xl flex items-center gap-2 z-40 pointer-events-none"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-5 h-5 rounded-lg bg-[#88DECC]/20 border border-[#88DECC]/50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#88DECC]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-semibold text-[#F5FAF6]">
                Vetted Ecosystem
              </div>
              <div className="text-[8px] font-mono text-[#88DECC]">
                100% Peer Verified
              </div>
            </div>
          </motion.div>

          {/* ── Floating Badge 2 (Bottom Right Overhang) ─────────────────────── */}
          <motion.div
            className="absolute -bottom-3 -right-3 sm:-right-4 px-3 py-1.5 rounded-xl bg-black/80 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-2 z-40 pointer-events-none"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-5 h-5 rounded-lg bg-[#F3D3A2]/20 border border-[#F3D3A2]/50 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#F3D3A2]" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-semibold text-[#F5FAF6]">
                Capital &amp; Mentorship
              </div>
              <div className="text-[8px] font-mono text-[#F3D3A2]">
                Odisha &middot; Global
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
