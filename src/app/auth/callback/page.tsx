"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { GlassLogoPill } from "@/components/brand/GlassLogoPill";
import { useRouter, useSearchParams } from "next/navigation";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";
import { ShieldCheck, AlertCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        if (!res.ok) {
          throw new Error("Failed to verify authentication session.");
        }

        const data = await res.json();
        const user = data.data?.user || data.data;

        if (!user) {
          throw new Error("No active session found.");
        }

        // Determine destination based on user profile and role
        if (user.adminLevel) {
          if (user.mfaVerified) {
            router.replace(nextParam && nextParam.startsWith("/admin") ? nextParam : "/admin");
          } else {
            router.replace("/admin/mfa");
          }
          return;
        }

        if (user.accountStatus === "pending_verification") {
          router.replace("/verify-email");
          return;
        }

        if (user.accountStatus === "suspended" || user.accountStatus === "revoked") {
          router.replace("/suspended");
          return;
        }

        // Active or pending review members
        router.replace(nextParam || "/dashboard");
      } catch (err: any) {
        if (mounted) {
          setErrorMsg(err.message || "Authentication failed. Redirecting to login...");
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(err.message || "auth_failed")}`);
          }, 1500);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router, nextParam]);

  return (
    <div className="login-bg h-screen max-h-screen min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#03080B] text-[#F5FAF6]">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-2 sm:py-2.5 flex items-center justify-between pointer-events-auto">
        <GlassLogoPill href="/" />

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#88DECC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88DECC] animate-pulse" />
            <span>Secure Handshake</span>
          </div>
        </div>
      </header>

      {/* ── Main Authorizing Card ────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 py-1 overflow-hidden">
        <div className="w-full max-w-[420px] mx-auto animate-fade-in-up my-auto">
          <div className="join-glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.85)] text-center space-y-4 relative overflow-hidden">
            {/* Top Specular Hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#88DECC]/50 to-transparent" />

            {/* Ambient Rotating Astrolabe */}
            <div className="relative flex justify-center items-center py-2">
              <div className="absolute inset-0 rounded-full bg-[#88DECC]/15 blur-2xl" />
              <AstrolabeStar size={130} className="relative z-10" />
            </div>

            {/* Heading & Subhead */}
            <div className="space-y-1">
              <h2 className="join-hero-headline text-xl sm:text-2xl font-light text-[#F5FAF6] tracking-tight">
                {errorMsg ? "Authentication Error" : "Authorizing Session..."}
              </h2>
              <p className="join-hero-subhead text-xs text-[#ECF1EF]/70 leading-relaxed font-normal max-w-xs mx-auto">
                {errorMsg
                  ? errorMsg
                  : "Finalizing secure login to OASIS. Directing you to your workspace."}
              </p>
            </div>

            {/* Shimmering Progress Bar */}
            {!errorMsg && (
              <div className="w-36 h-1 mx-auto rounded-full bg-white/10 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#88DECC] to-transparent animate-pulse" />
              </div>
            )}

            {errorMsg && (
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Redirecting back to login...</span>
              </div>
            )}

            {/* Footer Guarantee */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-[#ECF1EF]/50">
              <ShieldCheck className="w-3.5 h-3.5 text-[#88DECC] shrink-0" />
              <span>End-to-end encrypted session handshake</span>
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="login-bg h-screen flex items-center justify-center bg-[#03080B] text-[#F5FAF6]">
          <div className="flex flex-col items-center gap-3">
            <AstrolabeStar size={90} />
            <div className="text-xs font-mono text-[#88DECC]">Loading session...</div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
