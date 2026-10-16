"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Copy,
  Check,
  ArrowRight,
  RotateCw,
  AlertCircle,
  QrCode,
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
    <div className="min-h-screen flex flex-col bg-[#141522] text-[#FCF6E3]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="w-full bg-[#1A1B2B] border-b border-white/10 px-6 lg:px-12 h-16 flex items-center justify-between">
        <BrandLockup variant="horizontal" href="/admin" />
        <Link
          href="/dashboard"
          className="text-xs font-mono text-[#F3D3A2]/80 hover:text-[#F3D3A2] transition-colors"
        >
          Exit to Member Portal →
        </Link>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#1E1F33] shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#282942] border border-[#F3D3A2]/30 flex items-center justify-center text-[#F3D3A2] mx-auto shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-white">
                Admin Console Security
              </h1>
              <p className="text-xs text-[#A9A7C4] leading-relaxed">
                Two-factor authentication (TOTP) or emergency backup code is mandatory to access OASIS governance records and review queues.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSetupMode ? (
              /* TOTP Setup Mode */
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-[#171827] text-center space-y-3">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="TOTP QR Code"
                      className="w-36 h-36 bg-white p-2 rounded-xl mx-auto"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                      <QrCode className="w-28 h-28 text-[#1E1F33]" />
                    </div>
                  )}
                  <div className="text-[11px] text-[#A9A7C4]">
                    Scan this QR code with Google Authenticator, 1Password, or Authy.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A9A7C4] block">
                    Or enter manual secret key:
                  </span>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-[#171827]">
                    <code className="text-xs font-mono text-[#F3D3A2] flex-1 tracking-wider">
                      {manualKey}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1 rounded text-[#A9A7C4] hover:text-white hover:bg-white/10 cursor-pointer"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-white/15 text-[#FCF6E3] hover:bg-white/5"
                  onClick={() => setIsSetupMode(false)}
                >
                  Proceed to enter code
                </Button>
              </div>
            ) : (
              /* Code Verification Form */
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#A9A7C4]">
                      {isBackupMode ? "Emergency Backup Code" : "6-Digit Security Code"}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsBackupMode(!isBackupMode);
                        setCode("");
                        setError(null);
                      }}
                      className="text-[11px] font-mono text-[#F3D3A2] hover:underline cursor-pointer"
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
                      className="w-full h-12 text-center font-mono text-base tracking-widest rounded-xl border border-white/20 bg-[#141522] text-white focus:outline-none focus:ring-2 focus:ring-[#F3D3A2]"
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
                      className="w-full h-14 text-center font-mono text-2xl tracking-[0.4em] rounded-xl border border-white/20 bg-[#141522] text-white focus:outline-none focus:ring-2 focus:ring-[#F3D3A2]"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#F3D3A2] text-[#1E1F33] hover:bg-[#E9C68C] font-semibold gap-2 cursor-pointer"
                  disabled={(!isBackupMode && code.length < 6) || (isBackupMode && code.trim().length < 4) || loading}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Verifying authentication...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="flex justify-between items-center text-xs text-[#A9A7C4] pt-2">
                  <button
                    type="button"
                    onClick={handleSetupFetch}
                    className="hover:text-[#F3D3A2] transition-colors cursor-pointer"
                  >
                    View QR / setup secret
                  </button>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Lost access?
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
