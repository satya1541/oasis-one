"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

// ─── Role Definitions & Tokens ───────────────────────────────────────────────
type RoleKey = "founder" | "aspiring" | "mentor";

interface RoleDef {
  key: RoleKey;
  apiRole: "founder" | "aspiring_entrepreneur" | "mentor";
  title: string;
  shortTitle: string;
  subtitle: string;
  tags: string[];
  bullets: string[];
  photo: string;
  photoPos: string;
  accent: string;
  step2Headline: string;
  step3Headline: string;
  step3Title: string;
  step3Lead: string;
}

const ROLES: RoleDef[] = [
  {
    key: "founder",
    apiRole: "founder",
    title: "Founder or Co-founder",
    shortTitle: "Founder",
    subtitle: "I’m building a startup",
    tags: ["MVP · Growth", "Investor Access", "Startup Odisha"],
    bullets: [
      "Startup name and stage",
      "Website and LinkedIn",
      "Incorporation proof, if you have it",
    ],
    photo: "/join-assets/role-founder.webp",
    photoPos: "47% 22%",
    accent: "#88DECC",
    step2Headline: "Your venture, in front of the right people.",
    step3Headline: "Show us what you’re building.",
    step3Title: "Tell us about your startup",
    step3Lead: "The committee checks that your venture exists and what traction it has.",
  },
  {
    key: "aspiring",
    apiRole: "aspiring_entrepreneur",
    title: "Aspiring Entrepreneur",
    shortTitle: "Aspiring Entrepreneur",
    subtitle: "I have an idea to explore",
    tags: ["Ideation", "Validation", "Mentorship"],
    bullets: [
      "The sector your idea sits in",
      "The problem you want to solve",
      "Your city",
    ],
    photo: "/join-assets/role-aspiring.webp",
    photoPos: "85% 30%",
    accent: "#A78BFA",
    step2Headline: "Every company starts with an idea like yours.",
    step3Headline: "Tell us where your idea starts.",
    step3Title: "Tell us about your idea",
    step3Lead: "No company or paperwork needed. Share the problem and where you are.",
  },
  {
    key: "mentor",
    apiRole: "mentor",
    title: "Mentor or Advisor",
    shortTitle: "Mentor",
    subtitle: "I guide and back founders",
    tags: ["Advisory", "Angel Network", "Dealflow"],
    bullets: [
      "Company and job title",
      "Years of experience",
      "LinkedIn profile",
    ],
    photo: "/join-assets/role-mentor.webp",
    photoPos: "80% 30%",
    accent: "#F3D3A2",
    step2Headline: "Your experience, where it matters most.",
    step3Headline: "Show us the experience founders will lean on.",
    step3Title: "Tell us about your experience",
    step3Lead: "We vet every mentor so founders can trust who they meet.",
  },
];

const FOUNDER_STAGES = [
  "Ideation",
  "MVP / prototype ready",
  "Early Revenue",
  "Growth / Scaled",
];

const FOUNDER_ROLES = [
  "Founder / CEO",
  "Co-founder / CTO",
  "COO",
  "Founding Team",
];

const ASPIRING_DOMAINS = [
  "AI & Automation",
  "AgriTech",
  "CleanTech",
  "HealthTech",
  "D2C",
  "Handloom & Culture",
  "Other",
];

const MENTOR_EXPERIENCE_OPTIONS = [
  "5–8 years",
  "8–12 years",
  "12–15 years",
  "15+ years",
];

interface UploadedFileItem {
  fileId: string;
  name: string;
  status: "scanning" | "verified" | "error";
  message?: string;
  docType?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidLinkedIn(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/in\/[\w%-]+\/?$/i.test(trimmed);
}

function isValidWebUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  return /^https?:\/\/[^\s.]+\.\S+/i.test(trimmed);
}

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function getPasswordStrength(p: string): number {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^\w\s]/.test(p)) score++;
  return score;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN JOIN WIZARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function JoinWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const notice = searchParams.get("notice");
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";
  const isNotRegistered = notice === "not_registered";

  // Navigation & Step State
  const [step, setStep] = useState<number>(1);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(-1);
  const [hasUserSelectedRole, setHasUserSelectedRole] = useState<boolean>(false);
  const [coords, setCoords] = useState<Record<number, { cx: string; cy: string }>>({
    0: { cx: "50%", cy: "45%" },
    1: { cx: "50%", cy: "45%" },
    2: { cx: "50%", cy: "45%" },
  });
  const [isGuardReady, setIsGuardReady] = useState<boolean>(false);
  const guardTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal State for Google Unregistered Notice
  const [modalOpen, setModalOpen] = useState(isNotRegistered);

  // Step 2 Account State
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState<boolean>(false);
  const [hasExistingAccount, setHasExistingAccount] = useState<boolean>(false);

  // Step 3 Role Details State
  // Founder
  const [startupName, setStartupName] = useState<string>("");
  const [founderRole, setFounderRole] = useState<string>(FOUNDER_ROLES[0]);
  const [stage, setStage] = useState<string>(FOUNDER_STAGES[1]);
  const [isRegistered, setIsRegistered] = useState<"registered" | "early_stage">("early_stage");
  const [founderWebsite, setFounderWebsite] = useState<string>("");
  const [founderLinkedin, setFounderLinkedin] = useState<string>("");
  const [founderDescription, setFounderDescription] = useState<string>("");

  // Aspiring
  const [ideaDomain, setIdeaDomain] = useState<string>(ASPIRING_DOMAINS[0]);
  const [aspiringDescription, setAspiringDescription] = useState<string>("");
  const [city, setCity] = useState<string>("Bhubaneswar");
  const [aspiringLinkedin, setAspiringLinkedin] = useState<string>("");

  // Mentor
  const [currentCompany, setCurrentCompany] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [yearsExperience, setYearsExperience] = useState<string>(MENTOR_EXPERIENCE_OPTIONS[1]);
  const [mentorLinkedin, setMentorLinkedin] = useState<string>("");
  const [mentorDescription, setMentorDescription] = useState<string>("");

  // Shared Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Step 4 Review & Consent State
  const [complianceChecks, setComplianceChecks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [submittedRef, setSubmittedRef] = useState<string>("");

  // Inline Validation Errors per Field
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Active Role Helper
  const activeRole = selectedRoleIndex >= 0 ? ROLES[selectedRoleIndex] : ROLES[0];

  // ── Lock canvas background to #03080B ───────────────────────────────────────
  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevBodyColor = document.body.style.color;
    const prevHtmlBg = document.documentElement.style.backgroundColor;

    document.body.style.backgroundColor = "#03080B";
    document.body.style.color = "#F5FAF6";
    document.documentElement.style.backgroundColor = "#03080B";

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.color = prevBodyColor;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  // ── Restore from sessionStorage on load ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const roleParam = searchParams.get("role");
      if (roleParam) {
        const foundIdx = ROLES.findIndex((r) => r.key === roleParam);
        if (foundIdx >= 0) {
          setSelectedRoleIndex(foundIdx);
          setHasUserSelectedRole(true);
          setIsGuardReady(true);
        }
      } else {
        // Landing on join page fresh: user must choose role themselves
        sessionStorage.removeItem("oasis_reg_role");
        setSelectedRoleIndex(-1);
        setHasUserSelectedRole(false);
        setIsGuardReady(false);
      }

      const savedName = sessionStorage.getItem("oasis_reg_name") || nameParam;
      if (savedName) setName(savedName);

      const savedEmail = sessionStorage.getItem("oasis_reg_email") || emailParam;
      if (savedEmail) {
        setEmail(savedEmail);
        if (isNotRegistered) setIsGoogleAuth(true);
      }

      const savedPhone = sessionStorage.getItem("oasis_reg_phone");
      if (savedPhone) setPhone(savedPhone);

      const savedPassword = sessionStorage.getItem("oasis_reg_password");
      if (savedPassword) setPassword(savedPassword);

      const savedDetailsRaw = sessionStorage.getItem("oasis_reg_details");
      if (savedDetailsRaw) {
        const d = JSON.parse(savedDetailsRaw);
        if (d.startupName) setStartupName(d.startupName);
        if (d.founderRole) setFounderRole(d.founderRole);
        if (d.stage) setStage(d.stage);
        if (d.isRegistered) setIsRegistered(d.isRegistered);
        if (d.website) setFounderWebsite(d.website);
        if (d.linkedin) {
          setFounderLinkedin(d.linkedin);
          setAspiringLinkedin(d.linkedin);
          setMentorLinkedin(d.linkedin);
        }
        if (d.description) {
          setFounderDescription(d.description);
          setAspiringDescription(d.description);
          setMentorDescription(d.description);
        }
        if (d.ideaDomain) setIdeaDomain(d.ideaDomain);
        if (d.city) setCity(d.city);
        if (d.currentCompany) setCurrentCompany(d.currentCompany);
        if (d.jobTitle) setJobTitle(d.jobTitle);
        if (d.yearsExperience) setYearsExperience(d.yearsExperience);
        if (d.uploadedEvidence && d.uploadedEvidence.fileId) {
          setUploadedFiles([
            {
              fileId: d.uploadedEvidence.fileId,
              name: d.uploadedEvidence.filename || "Evidence Document",
              status: "verified",
              docType: d.uploadedEvidence.docType,
            },
          ]);
        }
      }
    } catch (e) {
      console.warn("Could not parse previous registration session storage", e);
    }
  }, [emailParam, nameParam, isNotRegistered]);

  // ── Hydrate in-progress Google signup session (pending_verification + not_started) ─
  useEffect(() => {
    let active = true;
    async function checkExistingGoogleSession() {
      try {
        const res = await fetch("/api/v1/auth/me", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok || !active) return;

        const meJson = await res.json().catch(() => null);
        const u = meJson?.data?.user || meJson?.data;
        if (!u || !active) return;

        if (u.adminLevel) {
          router.replace("/admin");
          return;
        }
        if (
          u.accountStatus === "active" ||
          (u.applicationStatus && u.applicationStatus !== "not_started")
        ) {
          router.replace("/dashboard");
          return;
        }

        if (u.accountStatus === "pending_verification") {
          setHasExistingAccount(true);
          setIsGoogleAuth(true);
          if (u.email) setEmail(u.email);
          if (u.name && u.name !== "Member") {
            setName((prev) => prev || u.name);
          }

          const roleIdx =
            u.primaryRole === "founder"
              ? 0
              : u.primaryRole === "aspiring_entrepreneur"
              ? 1
              : u.primaryRole === "mentor"
              ? 2
              : -1;

          if (roleIdx >= 0) {
            setSelectedRoleIndex(roleIdx);
            setHasUserSelectedRole(true);
            setIsGuardReady(true);
            if (u.name && u.name !== "Member") {
              setStep(3);
            } else {
              setStep(2);
            }
          }
        }
      } catch {
        // Ignore unauthenticated session checks
      }
    }

    checkExistingGoogleSession();
    return () => {
      active = false;
    };
  }, [router]);

  // Save changes to sessionStorage whenever relevant fields change
  const persistState = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (selectedRoleIndex >= 0 && hasUserSelectedRole) {
        sessionStorage.setItem("oasis_reg_role", activeRole.key);
      } else {
        sessionStorage.removeItem("oasis_reg_role");
      }
      if (name) sessionStorage.setItem("oasis_reg_name", name);
      if (email) sessionStorage.setItem("oasis_reg_email", email);
      if (phone) sessionStorage.setItem("oasis_reg_phone", phone);
      if (password) sessionStorage.setItem("oasis_reg_password", password);

      const currentDetails = {
        role: activeRole.key,
        city: activeRole.key === "aspiring" ? city : "Bhubaneswar",
        description:
          activeRole.key === "founder"
            ? founderDescription
            : activeRole.key === "aspiring"
            ? aspiringDescription
            : mentorDescription,
        website: activeRole.key === "founder" ? normalizeUrl(founderWebsite) : "",
        linkedin:
          activeRole.key === "founder"
            ? normalizeUrl(founderLinkedin)
            : activeRole.key === "mentor"
            ? normalizeUrl(mentorLinkedin)
            : normalizeUrl(aspiringLinkedin),
        startupName,
        founderRole,
        stage,
        isRegistered,
        ideaDomain,
        currentCompany,
        jobTitle,
        yearsExperience,
        uploadedEvidence:
          uploadedFiles.length > 0 && uploadedFiles[0].status === "verified"
            ? {
                fileId: uploadedFiles[0].fileId,
                filename: uploadedFiles[0].name,
                docType: uploadedFiles[0].docType || "Proof",
              }
            : null,
      };
      sessionStorage.setItem("oasis_reg_details", JSON.stringify(currentDetails));
    } catch (e) {
      console.warn("Failed persisting to sessionStorage", e);
    }
  }, [
    activeRole.key,
    selectedRoleIndex,
    name,
    email,
    phone,
    password,
    city,
    founderDescription,
    aspiringDescription,
    mentorDescription,
    founderWebsite,
    founderLinkedin,
    mentorLinkedin,
    aspiringLinkedin,
    startupName,
    founderRole,
    stage,
    isRegistered,
    ideaDomain,
    currentCompany,
    jobTitle,
    yearsExperience,
    uploadedFiles,
  ]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // ── Role Selection Handlers (Step 1) ─────────────────────────────────────────
  const handleSelectRole = (index: number, e?: React.MouseEvent) => {
    if (guardTimerRef.current) {
      clearTimeout(guardTimerRef.current);
    }

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%";
      const cy = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%";
      setCoords((prev) => ({ ...prev, [index]: { cx, cy } }));
    }

    setSelectedRoleIndex(index);
    setHasUserSelectedRole(true);
    setIsGuardReady(false);

    // Mis-click guard: 800ms timer before continue button becomes active
    guardTimerRef.current = setTimeout(() => {
      setIsGuardReady(true);
    }, 800);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  const handleStep1KeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelectRole(index);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (index + 1) % ROLES.length;
      handleSelectRole(nextIdx);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (index - 1 + ROLES.length) % ROLES.length;
      handleSelectRole(prevIdx);
    }
  };

  const handleContinueFromStep1 = () => {
    if (!isGuardReady && hasUserSelectedRole) return;
    setHasUserSelectedRole(true);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoogleSignUp = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("oasis_reg_role", activeRole.key);
      window.location.href = `/api/v1/auth/google?mode=signup&role=${activeRole.key}`;
    }
  };

  // ── Real File Upload Handler ────────────────────────────────────────────────
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    for (const file of fileList) {
      const isValidType = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ].includes(file.type);

      if (!isValidType) {
        setUploadedFiles((prev) => [
          ...prev,
          {
            fileId: "err-" + Math.random(),
            name: file.name,
            status: "error",
            message: "Only PDF, PNG or JPG",
          },
        ]);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadedFiles((prev) => [
          ...prev,
          {
            fileId: "err-" + Math.random(),
            name: file.name,
            status: "error",
            message: "Over 10 MB",
          },
        ]);
        continue;
      }

      const tempId = "uploading-" + Math.random().toString(36).slice(2, 8);
      setUploadedFiles((prev) => [
        ...prev,
        { fileId: tempId, name: file.name, status: "scanning" },
      ]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", "verification_evidence");

        const res = await fetch("/api/v1/uploads", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || errData?.message || "Upload rejected");
        }

        const data = await res.json();
        const serverFileId = data.data?.id || data.id || data.fileId || tempId;

        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.fileId === tempId
              ? {
                  ...item,
                  fileId: serverFileId,
                  status: "verified",
                  docType:
                    activeRole.key === "founder"
                      ? isRegistered === "registered"
                        ? "Certificate of Incorporation / DPIIT"
                        : "MVP Demo / Website Proof"
                      : "Mentor Credentials",
                }
              : item
          )
        );
      } catch (err: any) {
        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.fileId === tempId
              ? {
                  ...item,
                  status: "error",
                  message: err.message || "Failed to upload",
                }
              : item
          )
        );
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  };

  // ── Step 2 Validation & Continue ───────────────────────────────────────────
  const handleContinueFromStep2 = () => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 letters)";
    }
    if (!email.trim() || !isValidEmail(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!isGoogleAuth) {
      if (!password || password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    persistState();
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Step 3 Validation & Continue ───────────────────────────────────────────
  const handleContinueFromStep3 = () => {
    const errors: Record<string, string> = {};

    if (activeRole.key === "founder") {
      if (!startupName.trim()) {
        errors.startupName = "Startup name is required";
      }
      if (!founderWebsite.trim()) {
        errors.founderWebsite = "Website or product demo link is required";
      } else if (!isValidWebUrl(founderWebsite)) {
        errors.founderWebsite = "Enter a full link starting with https://";
      }
      if (!founderLinkedin.trim()) {
        errors.founderLinkedin = "LinkedIn profile is required for founder verification";
      } else if (!isValidLinkedIn(founderLinkedin)) {
        errors.founderLinkedin = "Use profile link, like linkedin.com/in/yourname";
      }
      if (!founderDescription.trim() || founderDescription.trim().length < 20) {
        errors.founderDescription = `Add at least 20 characters (${founderDescription.trim().length} so far)`;
      }
    } else if (activeRole.key === "aspiring") {
      if (!aspiringDescription.trim() || aspiringDescription.trim().length < 20) {
        errors.aspiringDescription = `Add at least 20 characters (${aspiringDescription.trim().length} so far)`;
      }
      if (!city.trim()) {
        errors.city = "City is required";
      }
      if (aspiringLinkedin.trim() && !isValidLinkedIn(aspiringLinkedin)) {
        errors.aspiringLinkedin = "Use profile link, like linkedin.com/in/yourname";
      }
    } else if (activeRole.key === "mentor") {
      if (!currentCompany.trim()) {
        errors.currentCompany = "Company or fund is required";
      }
      if (!jobTitle.trim()) {
        errors.jobTitle = "Job title is required";
      }
      if (!mentorLinkedin.trim()) {
        errors.mentorLinkedin = "LinkedIn profile is required for mentor vetting";
      } else if (!isValidLinkedIn(mentorLinkedin)) {
        errors.mentorLinkedin = "Use profile link, like linkedin.com/in/yourname";
      }
      if (!mentorDescription.trim() || mentorDescription.trim().length < 20) {
        errors.mentorDescription = `Add at least 20 characters (${mentorDescription.trim().length} so far)`;
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    persistState();
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Step 4 Final Submit ────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!complianceChecks.every(Boolean)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const effectivePassword = isGoogleAuth
        ? `OAuth_${Math.random().toString(36).slice(2, 10)}!Aa1`
        : password;

      const dynamicHeadline =
        activeRole.key === "founder"
          ? `${founderRole || "Founder"} @ ${startupName || "Your startup"}`
          : activeRole.key === "mentor"
          ? `${jobTitle || "Mentor"} @ ${currentCompany || "Your organisation"}`
          : `Aspiring entrepreneur${ideaDomain ? " · " + ideaDomain : ""}`;

      const activeDesc =
        activeRole.key === "founder"
          ? founderDescription
          : activeRole.key === "aspiring"
          ? aspiringDescription
          : mentorDescription;

      const activeLinkedin =
        activeRole.key === "founder"
          ? normalizeUrl(founderLinkedin)
          : activeRole.key === "mentor"
          ? normalizeUrl(mentorLinkedin)
          : normalizeUrl(aspiringLinkedin);

      const verifiedFiles = uploadedFiles.filter((f) => f.status === "verified");
      const evidenceFileIds = verifiedFiles.map((f) => f.fileId);

      const payload = {
        email: email.trim().toLowerCase(),
        phone: phone.trim() ? `+91 ${phone.replace(/\D/g, "")}` : null,
        password: effectivePassword,
        primaryRole: activeRole.apiRole,
        name: name.trim(),
        city: activeRole.key === "aspiring" ? city : "Bhubaneswar",
        headline: dynamicHeadline,
        bio: activeDesc,
        linkedin: activeLinkedin || undefined,
        website: activeRole.key === "founder" ? normalizeUrl(founderWebsite) : undefined,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        evidenceFileIds,
        ageConfirmed: true,
        ageConfirmation: true,
        roleData: {
          startupName: activeRole.key === "founder" ? startupName : undefined,
          founderRole: activeRole.key === "founder" ? founderRole : undefined,
          stage: activeRole.key === "founder" ? stage : undefined,
          isRegistered: activeRole.key === "founder" ? isRegistered : undefined,
          website: activeRole.key === "founder" ? normalizeUrl(founderWebsite) : undefined,
          linkedin: activeLinkedin,
          description: activeDesc,
          uploadedEvidence:
            verifiedFiles.length > 0
              ? {
                  fileId: verifiedFiles[0].fileId,
                  filename: verifiedFiles[0].name,
                  docType: verifiedFiles[0].docType || "Proof",
                }
              : null,
          ideaDomain: activeRole.key === "aspiring" ? ideaDomain : undefined,
          city: activeRole.key === "aspiring" ? city : undefined,
          currentCompany: activeRole.key === "mentor" ? currentCompany : undefined,
          jobTitle: activeRole.key === "mentor" ? jobTitle : undefined,
          yearsExperience: activeRole.key === "mentor" ? yearsExperience : undefined,
          supportingEvidence:
            activeRole.key === "mentor" && verifiedFiles.length > 0
              ? {
                  fileId: verifiedFiles[0].fileId,
                  filename: verifiedFiles[0].name,
                }
              : null,
        },
        consents: [
          { type: "privacy_notice", version: "1.0" },
          { type: "community_guidelines", version: "1.0" },
        ],
      };

      const endpoint = hasExistingAccount
        ? "/api/v1/auth/register/complete"
        : "/api/v1/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || errJson.message || "Failed to submit membership application.");
      }

      const resJson = await res.json().catch(() => ({}));
      const generatedRef =
        resJson?.data?.user?.id?.slice(0, 8).toUpperCase() ||
        resJson?.user?.id?.slice(0, 8).toUpperCase() ||
        "OAS-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      setSubmittedRef(generatedRef);

      // Clear registration storage keys on success
      sessionStorage.removeItem("oasis_reg_role");
      sessionStorage.removeItem("oasis_reg_details");
      sessionStorage.removeItem("oasis_reg_name");
      sessionStorage.removeItem("oasis_reg_email");
      sessionStorage.removeItem("oasis_reg_phone");
      sessionStorage.removeItem("oasis_reg_password");

      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to submit application. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Live Profile Calculations for Steps 3 & 4 ──────────────────────────────
  const dynamicHeadline =
    activeRole.key === "founder"
      ? `${founderRole || "Founder"} @ ${startupName || "Your startup"}`
      : activeRole.key === "mentor"
      ? `${jobTitle || "Mentor"} @ ${currentCompany || "Your organisation"}`
      : `Aspiring entrepreneur${ideaDomain ? " · " + ideaDomain : ""}`;

  let requiredFieldCount = 0;
  let filledRequiredCount = 0;

  if (activeRole.key === "founder") {
    requiredFieldCount = 6;
    if (startupName.trim()) filledRequiredCount++;
    if (founderRole) filledRequiredCount++;
    if (stage) filledRequiredCount++;
    if (isValidWebUrl(founderWebsite)) filledRequiredCount++;
    if (isValidLinkedIn(founderLinkedin)) filledRequiredCount++;
    if (founderDescription.trim().length >= 20) filledRequiredCount++;
  } else if (activeRole.key === "aspiring") {
    requiredFieldCount = 3;
    if (ideaDomain) filledRequiredCount++;
    if (city.trim()) filledRequiredCount++;
    if (aspiringDescription.trim().length >= 20) filledRequiredCount++;
  } else if (activeRole.key === "mentor") {
    requiredFieldCount = 5;
    if (currentCompany.trim()) filledRequiredCount++;
    if (jobTitle.trim()) filledRequiredCount++;
    if (yearsExperience) filledRequiredCount++;
    if (isValidLinkedIn(mentorLinkedin)) filledRequiredCount++;
    if (mentorDescription.trim().length >= 20) filledRequiredCount++;
  }

  const progressPercent = Math.min(
    100,
    Math.round((filledRequiredCount / Math.max(1, requiredFieldCount)) * 100)
  );

  const passStrength = getPasswordStrength(password);

  const hintText =
    activeRole.key === "founder"
      ? (isRegistered === "registered"
          ? "Certificate of Incorporation or DPIIT letter"
          : "Pitch deck, MVP screenshots or website proof") + " · PDF, PNG or JPG, 10 MB max"
      : "Advisory agreement, angel portfolio or credentials · PDF, PNG or JPG, 10 MB max";

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER: HERO COMPONENT (LEFT COLUMN IN SPLIT LAYOUT)
  // ═════════════════════════════════════════════════════════════════════════════
  const renderHero = () => (
    <aside
      className="hero"
      style={
        {
          "--pos": activeRole.photoPos,
          "--img": `url(${activeRole.photo})`,
        } as React.CSSProperties
      }
    >
      <div className="hp" />
      <div className="hc">
        <div className="chip">
          <i />
          {activeRole.title}
          <button type="button" className="ghost" onClick={() => setStep(1)}>
            Change
          </button>
        </div>
        <h2>
          {step === 4
            ? "Almost there."
            : step === 2
            ? activeRole.step2Headline
            : activeRole.step3Headline}
        </h2>
        {step === 2 ? (
          <div className="tags">
            {activeRole.tags.map((t) => (
              <b key={t}>{t}</b>
            ))}
          </div>
        ) : (
          <>
            <div className="pc">
              <div className="av">
                {(name.trim() || activeRole.shortTitle)[0].toUpperCase()}
              </div>
              <div>
                <b>{name.trim() || "Your name"}</b>
                <span>{dynamicHeadline}</span>
              </div>
            </div>
            <div className="bar">
              <i style={{ width: `${progressPercent}%` }} />
            </div>
            <small>
              {filledRequiredCount} of {requiredFieldCount} required answers
            </small>
          </>
        )}
      </div>
    </aside>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 2 (ACCOUNT CREATION)
  // ═════════════════════════════════════════════════════════════════════════════
  const renderStep2 = () => (
    <section className="sheet">
      <h2 className="st">Create your account</h2>
      <p className="lead">Use Google for the fastest start, or sign up with email.</p>

      <button type="button" className="g" onClick={handleGoogleSignUp}>
        <svg
          className="w-[18px] h-[18px] shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="or">or with email</div>

      <div className="fg">
        <div
          className={cn("f", fieldErrors.name && "bad")}
          style={{ "--n": 1 } as React.CSSProperties}
        >
          <label htmlFor="a_name">Full name</label>
          <input
            id="a_name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Priya Sharma"
            autoComplete="name"
          />
          {fieldErrors.name && <div className="err">{fieldErrors.name}</div>}
        </div>

        <div
          className={cn("f", fieldErrors.email && "bad")}
          style={{ "--n": 2 } as React.CSSProperties}
        >
          <label htmlFor="a_email">Email</label>
          <input
            id="a_email"
            type="email"
            value={email}
            readOnly={hasExistingAccount}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="priya@example.com"
            autoComplete="email"
          />
          {fieldErrors.email && <div className="err">{fieldErrors.email}</div>}
        </div>

        {isGoogleAuth ? (
          <p className="lead w">
            Signed in with Google ({email}). No password needed.{" "}
            {!hasExistingAccount && (
              <button
                type="button"
                className="ghost"
                onClick={() => setIsGoogleAuth(false)}
              >
                Use a password instead
              </button>
            )}
          </p>
        ) : (
          <div
            className={cn("f w", fieldErrors.password && "bad")}
            style={{ "--n": 3 } as React.CSSProperties}
          >
            <label htmlFor="a_pw">
              Password
              <button
                type="button"
                className="ghost"
                style={{ float: "right", padding: 0 }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>
            <input
              id="a_pw"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              autoComplete="new-password"
            />
            <div className="meter">
              <i style={{ background: passStrength >= 1 ? "var(--accent)" : "" }} />
              <i style={{ background: passStrength >= 2 ? "var(--accent)" : "" }} />
              <i style={{ background: passStrength >= 3 ? "var(--accent)" : "" }} />
              <i style={{ background: passStrength >= 4 ? "var(--accent)" : "" }} />
            </div>
            {fieldErrors.password && <div className="err">{fieldErrors.password}</div>}
          </div>
        )}
      </div>

      <div className="btns">
        <button type="button" className="ghost" onClick={() => setStep(1)}>
          Back
        </button>
        <button type="button" className="btn" onClick={handleContinueFromStep2}>
          Continue
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 3 (ROLE SPECIFIC DETAILS)
  // ═════════════════════════════════════════════════════════════════════════════
  const renderStep3 = () => (
    <section className="sheet">
      <h2 className="st">{activeRole.step3Title}</h2>
      <p className="lead">{activeRole.step3Lead}</p>

      <div className="fg">
        {activeRole.key === "founder" && (
          <>
            <div
              className={cn("f", fieldErrors.startupName && "bad")}
              style={{ "--n": 1 } as React.CSSProperties}
            >
              <label htmlFor="i_startupName">Startup name</label>
              <input
                id="i_startupName"
                type="text"
                value={startupName}
                onChange={(e) => {
                  setStartupName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, startupName: "" }));
                }}
                placeholder="Registered trade name or venture title"
                autoComplete="off"
              />
              {fieldErrors.startupName && (
                <div className="err">{fieldErrors.startupName}</div>
              )}
            </div>

            <div className="f" style={{ "--n": 2 } as React.CSSProperties}>
              <label htmlFor="i_founderRole">Your role</label>
              <select
                id="i_founderRole"
                value={founderRole}
                onChange={(e) => setFounderRole(e.target.value)}
              >
                {FOUNDER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="f w" style={{ "--n": 3 } as React.CSSProperties}>
              <label>Current stage</label>
              <div className="opts">
                {FOUNDER_STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cn("opt", stage === s && "on")}
                    onClick={() => setStage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="f w" style={{ "--n": 4 } as React.CSSProperties}>
              <label>
                Company status
                <span className="lh">
                  {isRegistered === "registered"
                    ? "Pvt Ltd, LLP, MSME or DPIIT"
                    : "MVP or website proof"}
                </span>
              </label>
              <div className="opts">
                <button
                  type="button"
                  className={cn("opt", isRegistered === "registered" && "on")}
                  onClick={() => setIsRegistered("registered")}
                >
                  Registered
                </button>
                <button
                  type="button"
                  className={cn("opt", isRegistered === "early_stage" && "on")}
                  onClick={() => setIsRegistered("early_stage")}
                >
                  Early stage
                </button>
              </div>
            </div>

            <div
              className={cn("f", fieldErrors.founderWebsite && "bad")}
              style={{ "--n": 5 } as React.CSSProperties}
            >
              <label htmlFor="i_website">Website or product demo</label>
              <input
                id="i_website"
                type="url"
                value={founderWebsite}
                onChange={(e) => {
                  setFounderWebsite(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, founderWebsite: "" }));
                }}
                placeholder="https://"
                autoComplete="off"
              />
              {fieldErrors.founderWebsite && (
                <div className="err">{fieldErrors.founderWebsite}</div>
              )}
            </div>

            <div
              className={cn("f", fieldErrors.founderLinkedin && "bad")}
              style={{ "--n": 6 } as React.CSSProperties}
            >
              <label htmlFor="i_linkedin">LinkedIn profile</label>
              <input
                id="i_linkedin"
                type="text"
                value={founderLinkedin}
                onChange={(e) => {
                  setFounderLinkedin(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, founderLinkedin: "" }));
                }}
                placeholder="linkedin.com/in/yourname"
                autoComplete="off"
              />
              {fieldErrors.founderLinkedin && (
                <div className="err">{fieldErrors.founderLinkedin}</div>
              )}
            </div>

            <div
              className={cn("f w", fieldErrors.founderDescription && "bad")}
              style={{ "--n": 7 } as React.CSSProperties}
            >
              <label htmlFor="i_description">
                Elevator pitch and current progress
                <span className="lh">
                  {founderDescription.length} / 20 min
                </span>
              </label>
              <textarea
                id="i_description"
                value={founderDescription}
                onChange={(e) => {
                  setFounderDescription(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, founderDescription: "" }));
                }}
                placeholder="What problem does your venture solve, what traction do you have so far?"
              />
              {fieldErrors.founderDescription && (
                <div className="err">{fieldErrors.founderDescription}</div>
              )}
            </div>

            <div className="f w" style={{ "--n": 8 } as React.CSSProperties}>
              <label>Supporting proof · optional</label>
              <label
                className={cn("drop", isDraggingOver && "over")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files) handleFileUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
                <b>Drop files here or browse</b>
                <span className="fh">{hintText}</span>
              </label>

              {uploadedFiles.length > 0 && (
                <div className="files">
                  {uploadedFiles.map((file) => (
                    <div key={file.fileId} className="file">
                      <span>{file.name}</span>
                      <em>
                        {file.status === "scanning"
                          ? "Scanning…"
                          : file.status === "verified"
                          ? "✓ Verified"
                          : `✕ ${file.message || "Error"}`}
                      </em>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => removeFile(file.fileId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeRole.key === "aspiring" && (
          <>
            <div className="f" style={{ "--n": 1 } as React.CSSProperties}>
              <label htmlFor="i_ideaDomain">Primary sector</label>
              <select
                id="i_ideaDomain"
                value={ideaDomain}
                onChange={(e) => setIdeaDomain(e.target.value)}
              >
                {ASPIRING_DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={cn("f", fieldErrors.city && "bad")}
              style={{ "--n": 2 } as React.CSSProperties}
            >
              <label htmlFor="i_city">City</label>
              <LocationAutocomplete
                label=""
                value={city}
                onChange={(val) => {
                  setCity(val);
                  setFieldErrors((prev) => ({ ...prev, city: "" }));
                }}
                placeholder="Bhubaneswar, Cuttack, or where you are abroad"
              />
              {fieldErrors.city && <div className="err">{fieldErrors.city}</div>}
            </div>

            <div
              className={cn("f w", fieldErrors.aspiringLinkedin && "bad")}
              style={{ "--n": 3 } as React.CSSProperties}
            >
              <label htmlFor="i_aspiringLinkedin">LinkedIn profile · optional</label>
              <input
                id="i_aspiringLinkedin"
                type="text"
                value={aspiringLinkedin}
                onChange={(e) => {
                  setAspiringLinkedin(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, aspiringLinkedin: "" }));
                }}
                placeholder="linkedin.com/in/yourname"
                autoComplete="off"
              />
              {fieldErrors.aspiringLinkedin && (
                <div className="err">{fieldErrors.aspiringLinkedin}</div>
              )}
            </div>

            <div
              className={cn("f w", fieldErrors.aspiringDescription && "bad")}
              style={{ "--n": 4 } as React.CSSProperties}
            >
              <label htmlFor="i_aspiringDescription">
                The problem you want to solve and the support you need
                <span className="lh">
                  {aspiringDescription.length} / 20 min
                </span>
              </label>
              <textarea
                id="i_aspiringDescription"
                value={aspiringDescription}
                onChange={(e) => {
                  setAspiringDescription(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, aspiringDescription: "" }));
                }}
                placeholder="Describe your early idea, what problem you observed, and what co-founder or advisor help you seek."
              />
              {fieldErrors.aspiringDescription && (
                <div className="err">{fieldErrors.aspiringDescription}</div>
              )}
            </div>
          </>
        )}

        {activeRole.key === "mentor" && (
          <>
            <div
              className={cn("f", fieldErrors.currentCompany && "bad")}
              style={{ "--n": 1 } as React.CSSProperties}
            >
              <label htmlFor="i_currentCompany">Company or fund</label>
              <input
                id="i_currentCompany"
                type="text"
                value={currentCompany}
                onChange={(e) => {
                  setCurrentCompany(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, currentCompany: "" }));
                }}
                placeholder="e.g. Tata Consultancy Services or Venture Fund"
                autoComplete="off"
              />
              {fieldErrors.currentCompany && (
                <div className="err">{fieldErrors.currentCompany}</div>
              )}
            </div>

            <div
              className={cn("f", fieldErrors.jobTitle && "bad")}
              style={{ "--n": 2 } as React.CSSProperties}
            >
              <label htmlFor="i_jobTitle">Job title</label>
              <input
                id="i_jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, jobTitle: "" }));
                }}
                placeholder="e.g. VP Engineering, Managing Partner"
                autoComplete="off"
              />
              {fieldErrors.jobTitle && (
                <div className="err">{fieldErrors.jobTitle}</div>
              )}
            </div>

            <div className="f w" style={{ "--n": 3 } as React.CSSProperties}>
              <label>Years of experience</label>
              <div className="opts">
                {MENTOR_EXPERIENCE_OPTIONS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    className={cn("opt", yearsExperience === exp && "on")}
                    onClick={() => setYearsExperience(exp)}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={cn("f w", fieldErrors.mentorLinkedin && "bad")}
              style={{ "--n": 4 } as React.CSSProperties}
            >
              <label htmlFor="i_mentorLinkedin">LinkedIn profile</label>
              <input
                id="i_mentorLinkedin"
                type="text"
                value={mentorLinkedin}
                onChange={(e) => {
                  setMentorLinkedin(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, mentorLinkedin: "" }));
                }}
                placeholder="linkedin.com/in/yourname"
                autoComplete="off"
              />
              {fieldErrors.mentorLinkedin && (
                <div className="err">{fieldErrors.mentorLinkedin}</div>
              )}
            </div>

            <div
              className={cn("f w", fieldErrors.mentorDescription && "bad")}
              style={{ "--n": 5 } as React.CSSProperties}
            >
              <label htmlFor="i_mentorDescription">
                How you mentor and where you can help founders
                <span className="lh">
                  {mentorDescription.length} / 20 min
                </span>
              </label>
              <textarea
                id="i_mentorDescription"
                value={mentorDescription}
                onChange={(e) => {
                  setMentorDescription(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, mentorDescription: "" }));
                }}
                placeholder="Share your domains of expertise, past advisory experience, and how you want to contribute."
              />
              {fieldErrors.mentorDescription && (
                <div className="err">{fieldErrors.mentorDescription}</div>
              )}
            </div>

            <div className="f w" style={{ "--n": 6 } as React.CSSProperties}>
              <label>Credentials for the Mentor Verified badge · optional</label>
              <label
                className={cn("drop", isDraggingOver && "over")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files) handleFileUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
                <b>Drop files here or browse</b>
                <span className="fh">{hintText}</span>
              </label>

              {uploadedFiles.length > 0 && (
                <div className="files">
                  {uploadedFiles.map((file) => (
                    <div key={file.fileId} className="file">
                      <span>{file.name}</span>
                      <em>
                        {file.status === "scanning"
                          ? "Scanning…"
                          : file.status === "verified"
                          ? "✓ Verified"
                          : `✕ ${file.message || "Error"}`}
                      </em>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => removeFile(file.fileId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="btns">
        <button type="button" className="ghost" onClick={() => setStep(2)}>
          Back
        </button>
        <button type="button" className="btn" onClick={handleContinueFromStep3}>
          Review application
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 4 (REVIEW & SUBMIT)
  // ═════════════════════════════════════════════════════════════════════════════
  const renderStep4 = () => (
    <section className="sheet">
      <h2 className="st">Review your application</h2>
      <p className="lead">The admissions committee reads exactly what you see here.</p>

      {/* Account Section */}
      <div className="rv">
        <div className="rh">
          <b>Account</b>
          <button type="button" className="ghost" onClick={() => setStep(2)}>
            Edit
          </button>
        </div>
        <dl>
          <dt>Name</dt>
          <dd>{name || "—"}</dd>
          <dt>Email</dt>
          <dd>{email || "—"}</dd>
          <dt>Sign-in</dt>
          <dd>{isGoogleAuth ? "Google" : "Email and password"}</dd>
        </dl>
      </div>

      {/* Role Details Section */}
      <div className="rv">
        <div className="rh">
          <b>{activeRole.shortTitle} details</b>
          <button type="button" className="ghost" onClick={() => setStep(3)}>
            Edit
          </button>
        </div>
        <dl>
          {activeRole.key === "founder" && (
            <>
              <dt>Startup name</dt>
              <dd>{startupName || "—"}</dd>
              <dt>Your role</dt>
              <dd>{founderRole || "—"}</dd>
              <dt>Current stage</dt>
              <dd>{stage || "—"}</dd>
              <dt>Company status</dt>
              <dd>{isRegistered === "registered" ? "Registered" : "Early stage"}</dd>
              <dt>Website</dt>
              <dd>{founderWebsite || "—"}</dd>
              <dt>LinkedIn</dt>
              <dd>{founderLinkedin || "—"}</dd>
              <dt>Elevator pitch</dt>
              <dd>{founderDescription || "—"}</dd>
              <dt>Supporting proof</dt>
              <dd>
                {uploadedFiles.length > 0
                  ? uploadedFiles
                      .filter((f) => f.status === "verified")
                      .map((f) => f.name)
                      .join(", ") || "—"
                  : "—"}
              </dd>
            </>
          )}

          {activeRole.key === "aspiring" && (
            <>
              <dt>Primary sector</dt>
              <dd>{ideaDomain || "—"}</dd>
              <dt>City</dt>
              <dd>{city || "—"}</dd>
              <dt>LinkedIn</dt>
              <dd>{aspiringLinkedin || "—"}</dd>
              <dt>Problem & support</dt>
              <dd>{aspiringDescription || "—"}</dd>
            </>
          )}

          {activeRole.key === "mentor" && (
            <>
              <dt>Company or fund</dt>
              <dd>{currentCompany || "—"}</dd>
              <dt>Job title</dt>
              <dd>{jobTitle || "—"}</dd>
              <dt>Experience</dt>
              <dd>{yearsExperience || "—"}</dd>
              <dt>LinkedIn</dt>
              <dd>{mentorLinkedin || "—"}</dd>
              <dt>Mentorship focus</dt>
              <dd>{mentorDescription || "—"}</dd>
              <dt>Credentials</dt>
              <dd>
                {uploadedFiles.length > 0
                  ? uploadedFiles
                      .filter((f) => f.status === "verified")
                      .map((f) => f.name)
                      .join(", ") || "—"
                  : "—"}
              </dd>
            </>
          )}
        </dl>
      </div>

      {/* Compliance Checkboxes */}
      <label className="ck">
        <input
          type="checkbox"
          checked={complianceChecks[0]}
          onChange={(e) =>
            setComplianceChecks([e.target.checked, complianceChecks[1], complianceChecks[2]])
          }
        />
        <span>I confirm everything above is accurate and I am authorised to submit it.</span>
      </label>

      <label className="ck">
        <input
          type="checkbox"
          checked={complianceChecks[1]}
          onChange={(e) =>
            setComplianceChecks([complianceChecks[0], e.target.checked, complianceChecks[2]])
          }
        />
        <span>I agree to the Terms of Service and Privacy Policy.</span>
      </label>

      <label className="ck">
        <input
          type="checkbox"
          checked={complianceChecks[2]}
          onChange={(e) =>
            setComplianceChecks([complianceChecks[0], complianceChecks[1], e.target.checked])
          }
        />
        <span>I understand the committee reviews every application before I get access.</span>
      </label>

      {submitError && (
        <div className="err" style={{ marginBottom: 12 }}>
          {submitError}
        </div>
      )}

      <div className="btns">
        <button type="button" className="ghost" onClick={() => setStep(3)}>
          Back
        </button>
        <button
          type="button"
          className="btn"
          disabled={!complianceChecks.every(Boolean) || submitting}
          onClick={handleFinalSubmit}
        >
          {submitting ? "Submitting…" : "Submit to committee"}
        </button>
      </div>
    </section>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER: STEP 5 (APPLICATION SUBMITTED)
  // ═════════════════════════════════════════════════════════════════════════════
  const renderStep5 = () => (
    <section className="sheet ok">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" />
        <path d="M24 41l11 11 21-23" />
      </svg>
      <h2 className="st">Application submitted</h2>
      <p className="lead">We’ll email {email} once the committee has decided.</p>
      <span className="pill">
        <i />
        Pending review · {submittedRef}
      </span>
      <ul className="tl">
        <li className="d">Application received</li>
        <li className="n">Committee review</li>
        <li>Access to the community</li>
      </ul>
      <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
        <Link href="/" className="btn">
          Return to Home
        </Link>
      </div>
    </section>
  );

  // ═════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className={cn("join-flow stage", step > 1 && "fit")}
      data-has={hasUserSelectedRole || step > 1 ? "1" : undefined}
      style={
        {
          "--accent": selectedRoleIndex >= 0 ? activeRole.accent : "#88DECC",
        } as React.CSSProperties
      }
    >
      <div className="glow" />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between pb-3 pointer-events-auto">
        <GlassLogoPill href="/" />
        <div className="flex items-center gap-4">
          <Link
            href="/faq"
            className="text-xs text-[rgba(236,241,239,0.75)] hover:text-[#F5FAF6] transition-colors font-medium"
          >
            Need help?
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/10 hover:border-white/25 transition-all text-[#F5FAF6]"
          >
            <span>Log in</span>
            <ChevronRight className="w-3 h-3 text-[var(--accent)]" />
          </Link>
        </div>
      </header>

      {/* Stepper Progress Segments */}
      <div className="steps" id="steps">
        {[1, 2, 3, 4].map((segNum) => {
          let width = "0%";
          let bg = "var(--accent)";
          if (step > segNum) {
            width = "100%";
          } else if (step === segNum) {
            if (step === 1 && selectedRoleIndex === -1) {
              width = "35%";
              bg = "rgba(255, 255, 255, 0.4)";
            } else {
              width = "100%";
            }
          }
          return (
            <div key={segNum} className="seg">
              <i
                style={{
                  width,
                  background: bg,
                  boxShadow:
                    width === "100%" ? "0 0 12px var(--accent)" : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      <p className="meta" id="meta">
        {step === 5
          ? "Submitted · 100%"
          : `Step ${step} of 4 · ${step * 25}%`}
      </p>

      {/* Unregistered Account Notice Modal */}
      <UnregisteredAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        email={emailParam}
        onContinue={() => setModalOpen(false)}
      />

      {/* Step 1: Expanding Photo Panels */}
      <div
        id="v1"
        style={{ display: step === 1 ? "flex" : "none" }}
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        <h1>How would you describe yourself?</h1>
        <div
          className="panels"
          id="panels"
          role="radiogroup"
          aria-label="Choose your role"
          data-sel={selectedRoleIndex >= 0 ? selectedRoleIndex.toString() : undefined}
        >
          {ROLES.map((roleDef, idx) => {
            const isSelected = selectedRoleIndex === idx;
            return (
              <article
                key={roleDef.key}
                className={cn(
                  "panel",
                  isSelected && "on",
                  isSelected && isGuardReady && "ready"
                )}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                style={
                  {
                    "--a": roleDef.accent,
                    "--pos": roleDef.photoPos,
                    "--img": `url(${roleDef.photo})`,
                    "--cx": coords[idx]?.cx || "50%",
                    "--cy": coords[idx]?.cy || "45%",
                  } as React.CSSProperties
                }
                onClick={(e) => handleSelectRole(idx, e)}
                onKeyDown={(e) => handleStep1KeyDown(e, idx)}
              >
                <i className="ring" />
                <div className="ph base" />
                <div className="ph col" />
                <div className="shade" />
                <div className="idle" aria-hidden="true">
                  <h2>{roleDef.title}</h2>
                  <p>{roleDef.subtitle}</p>
                  <div className="tags">
                    {roleDef.tags.map((t) => (
                      <b key={t}>{t}</b>
                    ))}
                  </div>
                </div>
                <div className="strip" aria-hidden="true">
                  <span />
                  <h2>{roleDef.shortTitle}</h2>
                </div>
                <div className="open">
                  <h2>{roleDef.title}</h2>
                  <p>{roleDef.subtitle}</p>
                  <small>Next we’ll ask for</small>
                  <ul>
                    {roleDef.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <button
                    className="go"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinueFromStep1();
                    }}
                  >
                    Continue as {roleDef.shortTitle}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Steps 2–4 & Step 5 in Container */}
      {step > 1 && (
        <div id="vx">
          {step < 5 ? (
            <div className="split">
              {renderHero()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>
          ) : (
            renderStep5()
          )}
        </div>
      )}

      {/* Screen Reader Announcement */}
      <p className="sr" aria-live="polite">
        {selectedRoleIndex >= 0 ? `Selected: ${activeRole.title}` : ""}
      </p>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03080B]" />}>
      <JoinWizard />
    </Suspense>
  );
}
