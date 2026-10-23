import Link from "next/link";
import { Cookie, Clock, ShieldCheck, Zap, Lock, Database, CheckCircle2, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Platform Operations, Backup & Cookie Policy · OASIS",
  description: "Strictly necessary cookie schedule, zero third-party ad tracking, server rate limits, and file security standards for OASIS.",
};

const COOKIE_SCHEDULE = [
  {
    name: "oasis_sid",
    type: "First-Party Cookie",
    attributes: "HttpOnly, Secure (prod), SameSite=Lax",
    expiry: "24 hours sliding; 7 days absolute maximum",
    purpose: "Stores an opaque 32-byte session token (hashed with SHA-256 in database) to authenticate REST (/api/v1) and WebSocket (/ws) sessions.",
  },
  {
    name: "CSRF Token Cookie",
    type: "First-Party Cookie",
    attributes: "Readable by same-origin JS, Secure (prod), SameSite=Lax",
    expiry: "Session lifetime (refreshed automatically on 403 csrf)",
    purpose: "Double-submit token verified against the X-CSRF-Token HTTP header on all state-changing API operations.",
  },
  {
    name: "OAuth State & PKCE",
    type: "First-Party Cookie",
    attributes: "Signed, HttpOnly, Secure (prod), SameSite=Lax",
    expiry: "10 minutes (cleared immediately on callback)",
    purpose: "Secures state parameter and PKCE code_verifier during Google Sign-In (/api/v1/auth/google).",
  },
  {
    name: "Registration Draft",
    type: "sessionStorage",
    attributes: "Same-origin tab storage (non-sensitive fields only)",
    expiry: "Cleared on registration submit or tab close",
    purpose: "Preserves multi-step onboarding wizard progress so applicants do not lose input on page refresh.",
  },
  {
    name: "Theme Preference",
    type: "localStorage",
    attributes: "Same-origin UI preference (light / dark)",
    expiry: "Persistent until cleared by user",
    purpose: "Remembers your visual theme choice (Light Ivory or Dark Navy).",
  },
];

const RATE_LIMITS = [
  { action: "Login (POST /auth/login)", quota: "5 attempts per 15 min", scope: "Per IP + Email" },
  { action: "Registration (POST /auth/register)", quota: "3 attempts per hour", scope: "Per IP address" },
  { action: "Password Reset / Resend Email", quota: "3 requests per hour", scope: "Per Email + IP" },
  { action: "Phone Verification OTP", quota: "3 per hour / 10 per day", scope: "Per authenticated user (5 wrong attempts lock)" },
  { action: "Mentor Connection Requests", quota: "10 requests per 24 hours", scope: "Per member; 14-day expiry; 7-day cooldown" },
  { action: "Global Directory Search (/search)", quota: "60 requests per minute", scope: "Per authenticated member (anti-scraping alerts)" },
  { action: "Public Endpoints (/legal, /config)", quota: "30 requests per minute", scope: "Per IP address" },
  { action: "Support / Grievance (/support/contact)", quota: "5 requests per hour", scope: "Per authenticated user / IP" },
];

export default function OperationsAndCookiePolicyPage() {
  return (
    <article className="space-y-10">
      {/* ── Document Title Header ─────────────────────────────────── */}
      <div className="space-y-3 pb-8 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--brand-gold)]">
          <span className="bg-[var(--surface-2)] px-2.5 py-0.5 rounded border border-[var(--border)]">
            DOC TYPE: operations_policy
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Version 1.0 · Effective 16 October 2026
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-[var(--text)]">
          OASIS — Platform Operations, Backup &amp; Cookie Policy
        </h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Operational specifications, strictly necessary cookie schedules, server rate limits, and ClamAV antivirus file security standards for the OASIS infrastructure.
        </p>
      </div>

      {/* ── Zero Tracking Commitment ──────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
        <div className="font-semibold text-emerald-500 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>Strict Zero-Tracking Commitment</span>
        </div>
        <p className="text-[var(--text)]/90 leading-relaxed">
          OASIS uses <strong>only strictly necessary first-party cookies</strong> required to securely authenticate your session and prevent CSRF forgery. We do not use third-party advertising cookies, cross-site tracking pixels, or marketing analytics scripts, and we never store session credentials in browser <code className="font-mono text-[11px]">localStorage</code>.
        </p>
      </div>

      {/* ── Document Sections ─────────────────────────────────────── */}
      <div className="space-y-10 text-sm leading-relaxed text-[var(--text)]/90">
        {/* Section 1: Cookie Schedule */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 1</span>
            <span>Complete Schedule of Cookies &amp; Storage</span>
          </h2>
          <div className="space-y-3">
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)] text-xs">
              {COOKIE_SCHEDULE.map((item, i) => (
                <div key={i} className="p-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm font-semibold text-[var(--text)] font-mono">{item.name}</strong>
                    <span className="font-mono text-[10px] text-[var(--brand-gold)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[var(--text)]/80"><strong className="text-[var(--text)]">Attributes:</strong> {item.attributes}</p>
                  <p className="text-[var(--muted)]"><strong className="text-[var(--text)]">Lifespan:</strong> {item.expiry}</p>
                  <p className="text-[var(--muted)]"><strong className="text-[var(--text)]">Purpose:</strong> {item.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Rate Limits */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 2</span>
            <span>Server-Side Rate Limits (HTTP 429 Protection)</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              To protect the community against brute-force attacks, directory scraping, and API abuse, OASIS enforces automated rate limits returning HTTP 429 Too Many Requests:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              {RATE_LIMITS.map((rl, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                  <strong className="text-[var(--text)] font-semibold block">{rl.action}</strong>
                  <div className="text-[var(--brand-gold)] font-mono text-[11px]">{rl.quota}</div>
                  <div className="text-[var(--muted)] text-[10px]">{rl.scope}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: File Upload Security */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-medium text-[var(--text)] flex items-center gap-2 border-b border-[var(--border)]/50 pb-2">
            <span className="font-mono text-base text-[var(--brand-gold)]">§ 3</span>
            <span>File Upload &amp; Antivirus Security Standards</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <p>
              Every file uploaded to OASIS is validated against MIME types and binary magic bytes, scanned by ClamAV antivirus, and stored in private S3 buckets with server-side encryption (AES256):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <strong className="text-[var(--text)] block">Profile Photos</strong>
                <span className="text-[var(--brand-gold)] font-mono text-[11px]">Max 2 MB</span>
                <p className="text-[var(--muted)]">JPEG or PNG only; processed in memory to strip EXIF metadata.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <strong className="text-[var(--text)] block">Achievement Images</strong>
                <span className="text-[var(--brand-gold)] font-mono text-[11px]">Max 5 MB</span>
                <p className="text-[var(--muted)]">JPEG or PNG only; reviewed by moderators before live display.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
                <strong className="text-[var(--text)] block">Evidence Attachments</strong>
                <span className="text-[var(--brand-gold)] font-mono text-[11px]">Max 10 MB</span>
                <p className="text-[var(--muted)]">PDF, JPEG, or PNG; accessible only to reviewing admins via signed URLs.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
