"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Copy,
  Check,
  RotateCw,
  AlertCircle,
  QrCode,
  LogOut,
} from "lucide-react";

export default function AdminMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isBackupMode, setIsBackupMode] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default admin secret generated during platform bootstrap
  const [manualKey, setManualKey] = useState("JBSWY3DPEHPK3PXP");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const handleSetupFetch = async () => {
    setIsSetupMode(true);
    try {
      const res = await fetch("/api/v1/auth/mfa/setup", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.secret) {
          setManualKey(json.data.secret);
        }
        if (json.data?.qrCode) {
          setQrCodeDataUrl(json.data.qrCode);
        }
      }
    } catch (e) {
      console.error("Failed to fetch fresh MFA setup:", e);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(manualKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setLoading(true);
    setError(null);

    const isTotp = !isBackupMode && /^\d{6}$/.test(cleanCode);
    const payload = isTotp ? { code: cleanCode } : { backupCode: cleanCode };

    try {
      const res = await fetch("/api/v1/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || errJson.message || "Invalid authentication code or backup code.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("oasis_admin_mfa", "true");
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid authentication code. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header with Glass Logo Pill and Nav ──────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        <GlassLogoPill href="/admin" />

        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/v1/auth/logout", { method: "POST" });
            } catch {}
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }}
          className="join-login-pill inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-xs hover:text-rose-400 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <div className="w-full max-w-[400px] mx-auto animate-fade-in-up my-auto">
          <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative overflow-hidden space-y-3.5 text-center">
            {/* Top Specular Hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

            {/* Emblem */}
            <div className="flex justify-center items-center pt-0.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#88DECC]/20 blur-xl" />
                <div className="w-12 h-12 rounded-2xl bg-[#030909] border border-[#88DECC]/30 flex items-center justify-center text-[#88DECC] shadow-[0_0_20px_rgba(136,222,204,0.2)] relative">
                  <ShieldCheck className="w-5.5 h-5.5" />
                </div>
              </div>
            </div>

            {/* Heading & Subhead */}
            <div className="space-y-0.5">
              <h1 className="join-hero-headline text-lg sm:text-xl font-light text-[#F5FAF6] tracking-tight">
                Admin Console Security
              </h1>
              <p className="join-hero-subhead text-[11px] sm:text-xs text-[#ECF1EF]/70 leading-relaxed max-w-xs mx-auto">
                Two-factor authentication (TOTP) or emergency backup code is mandatory to access OASIS governance records.
              </p>
            </div>

            {error && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-center gap-2 text-left">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {isSetupMode ? (
              /* TOTP Setup Mode */
              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 text-center space-y-2">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="TOTP QR Code"
                      className="w-32 h-32 bg-white p-2 rounded-xl mx-auto shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-sm">
                      <QrCode className="w-24 h-24 text-[#03080B]" />
                    </div>
                  )}
                  <div className="text-[10.5px] text-[#ECF1EF]/60">
                    Scan with Google Authenticator, 1Password, or Authy.
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/50 block">
                    Or enter manual secret key:
                  </span>
                  <div className="flex items-center gap-2 p-2 rounded-lg border border-white/10 bg-white/[0.03]">
                    <code className="text-xs font-mono text-[#88DECC] flex-1 tracking-wider truncate">
                      {manualKey}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1 rounded text-[#ECF1EF]/60 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSetupMode(false)}
                  className="w-full h-8.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-[#F5FAF6] hover:bg-white/[0.08] transition-all cursor-pointer"
                >
                  Proceed to enter code
                </button>
              </div>
            ) : (
              /* Code Verification Form */
              <form onSubmit={handleVerify} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] sm:text-[10.5px] font-mono uppercase tracking-wider text-[#ECF1EF]/75">
                      {isBackupMode ? "Emergency Backup Code" : "6-Digit Security Code"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBackupMode(!isBackupMode);
                        setCode("");
                        setError(null);
                      }}
                      className="text-[10px] sm:text-[10.5px] font-mono text-[#88DECC] hover:underline cursor-pointer"
                    >
                      {isBackupMode ? "Use 6-digit TOTP" : "Use Backup Code"}
                    </button>
                  </div>

                  {isBackupMode ? (
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="OASIS-ADMIN-XXXX"
                      autoFocus
                      className="w-full h-10 px-3 text-center font-mono text-xs sm:text-sm tracking-wider rounded-xl border border-white/12 bg-white/[0.04] text-[#F5FAF6] focus:outline-none focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 transition-all"
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      autoFocus
                      className="w-full h-11 text-center font-mono text-xl sm:text-2xl tracking-[0.35em] rounded-xl border border-white/12 bg-white/[0.04] text-[#F5FAF6] placeholder-white/15 focus:outline-none focus:border-[#88DECC] focus:ring-1.5 focus:ring-[#88DECC]/20 transition-all"
                    />
                  )}
                </div>

                {/* Signature Cream CTA Pill */}
                <div className="pt-0.5">
                  <button
                    type="submit"
                    className="join-cta-pill group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!isBackupMode && code.length < 6) || (isBackupMode && code.trim().length < 4) || loading}
                  >
                    <span className="font-medium tracking-tight">
                      {loading ? "Verifying authentication..." : "Verify & Enter Console"}
                    </span>
                    <div className="join-cta-disc shrink-0">
                      {loading ? (
                        <RotateCw className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <svg viewBox="0 0 5 8" width="5" height="8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M.6.6 4 4 .6 7.4" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#ECF1EF]/60 pt-0.5">
                  <button
                    type="button"
                    onClick={handleSetupFetch}
                    className="hover:text-[#88DECC] transition-colors cursor-pointer"
                  >
                    View QR / setup secret
                  </button>
                  <Link
                    href="/contact"
                    className="hover:text-[#88DECC] transition-colors"
                  >
                    Lost access?
                  </Link>
                </div>
              </form>
            )}

            {/* Footer Guarantee */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/50">
              <ShieldCheck className="w-3 h-3 text-[#88DECC] shrink-0" />
              <span>Protected administrator sanctuary &middot; Multi-factor gate</span>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 relative z-10 w-full py-1 sm:py-1.5 text-center text-[10px] sm:text-[10.5px] text-[#ECF1EF]/40 font-mono">
        OASIS &middot; Curated &amp; Admin Vetted Startup Community &middot; Odisha
      </footer>
    </div>
  );
}
