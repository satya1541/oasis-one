import { ShieldCheck } from "lucide-react";
import { DocsPageHeader } from "@/components/layout/DocsPageHeader";

export const metadata = {
  title: "Platform Operations, Backup & Cookie Policy · OASIS",
  description:
    "Strictly necessary cookie schedule, zero third-party ad tracking, server rate limits, and file security standards for OASIS.",
};

const COOKIE_SCHEDULE = [
  {
    name: "oasis_sid",
    type: "First-Party Cookie",
    attributes: "HttpOnly, Secure (prod), SameSite=Lax",
    expiry: "24 hours sliding; 7 days absolute maximum",
    purpose:
      "Stores an opaque 32-byte session token (hashed with SHA-256 in database) to authenticate REST (/api/v1) and WebSocket (/ws) sessions.",
  },
  {
    name: "CSRF Token Cookie",
    type: "First-Party Cookie",
    attributes: "Readable by same-origin JS, Secure (prod), SameSite=Lax",
    expiry: "Session lifetime (refreshed automatically on 403 csrf)",
    purpose:
      "Double-submit token verified against the X-CSRF-Token HTTP header on all state-changing API operations.",
  },
  {
    name: "OAuth State & PKCE",
    type: "First-Party Cookie",
    attributes: "Signed, HttpOnly, Secure (prod), SameSite=Lax",
    expiry: "10 minutes (cleared immediately on callback)",
    purpose:
      "Secures state parameter and PKCE code_verifier during Google Sign-In (/api/v1/auth/google).",
  },
  {
    name: "Registration Draft",
    type: "sessionStorage",
    attributes: "Same-origin tab storage (non-sensitive fields only)",
    expiry: "Cleared on registration submit or tab close",
    purpose:
      "Preserves multi-step onboarding wizard progress so applicants do not lose input on page refresh.",
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
  {
    action: "Phone Verification OTP",
    quota: "3 per hour / 10 per day",
    scope: "Per authenticated user (5 wrong attempts lock)",
  },
  {
    action: "Mentor Connection Requests",
    quota: "10 requests per 24 hours",
    scope: "Per member; 14-day expiry; 7-day cooldown",
  },
  {
    action: "Global Directory Search (/search)",
    quota: "60 requests per minute",
    scope: "Per authenticated member (anti-scraping alerts)",
  },
  { action: "Public Endpoints (/legal, /config)", quota: "30 requests per minute", scope: "Per IP address" },
  {
    action: "Support / Grievance (/support/contact)",
    quota: "5 requests per hour",
    scope: "Per authenticated user / IP",
  },
];

export default function OperationsAndCookiePolicyPage() {
  return (
    <article className="space-y-9 text-[15px] leading-7 text-gray-700">
      <DocsPageHeader
        title="Platform Operations, Backup & Cookie Policy"
        meta="Last updated: 16 October 2026 · Version 1.0"
        subtitle="Operational specifications, strictly necessary cookie schedules, server rate limits, and ClamAV antivirus file security standards for the OASIS infrastructure."
      />

      <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm space-y-1.5">
        <div className="font-semibold text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Strict Zero-Tracking Commitment</span>
        </div>
        <p className="text-emerald-950/80 text-xs sm:text-sm leading-relaxed">
          OASIS uses <strong>only strictly necessary first-party cookies</strong> required to securely authenticate your session and prevent CSRF forgery. We do not use third-party advertising cookies, cross-site tracking pixels, or marketing ad networks, and we never store session credentials in browser <code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-emerald-200">localStorage</code>.
        </p>
      </div>

      <section id="cookies-storage" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          1. Complete Schedule of Cookies &amp; Storage
        </h2>
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white text-sm">
          {COOKIE_SCHEDULE.map((item, i) => (
            <div key={i} className="p-4 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="font-semibold text-gray-900 font-mono">{item.name}</strong>
                <span className="font-mono text-xs text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {item.type}
                </span>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm">
                <strong className="text-gray-900">Attributes:</strong> {item.attributes}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                <strong className="text-gray-900">Lifespan:</strong> {item.expiry}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm">
                <strong className="text-gray-900">Purpose:</strong> {item.purpose}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="rate-limits" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          2. Server-Side Rate Limits (HTTP 429 Protection)
        </h2>
        <p>
          To protect the community against brute-force attacks, directory scraping, and API abuse, OASIS enforces automated rate limits returning HTTP 429 Too Many Requests:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {RATE_LIMITS.map((rl, i) => (
            <div key={i} className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
              <strong className="text-gray-900 font-semibold block">{rl.action}</strong>
              <div className="text-[#4F46E5] font-mono text-xs">{rl.quota}</div>
              <div className="text-gray-500 text-xs">{rl.scope}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="file-upload-security" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-900 pb-2 border-b border-gray-200">
          3. File Upload &amp; Antivirus Security Standards
        </h2>
        <p>
          Every file uploaded to OASIS is validated against MIME types and binary magic bytes, scanned by ClamAV antivirus, and stored in private S3 buckets with server-side encryption (AES256):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Profile Photos</strong>
            <span className="text-[#4F46E5] font-mono text-xs">Max 2 MB</span>
            <p className="text-gray-600 text-xs">JPEG or PNG only; processed in memory to strip EXIF metadata.</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Achievement Images</strong>
            <span className="text-[#4F46E5] font-mono text-xs">Max 5 MB</span>
            <p className="text-gray-600 text-xs">JPEG or PNG only; reviewed by moderators before live display.</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/70 space-y-1">
            <strong className="text-gray-900 block">Evidence Attachments</strong>
            <span className="text-[#4F46E5] font-mono text-xs">Max 10 MB</span>
            <p className="text-gray-600 text-xs">
              PDF, JPEG, or PNG; accessible only to reviewing admins via signed URLs.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
