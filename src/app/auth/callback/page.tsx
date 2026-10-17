"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AstrolabeStar } from "@/components/brand/AstrolabeStar";

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
          // If admin, strictly route to /admin only if MFA is already verified, else /admin/mfa
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#141522] text-[#FCF6E3] px-4">
      <div className="flex flex-col items-center space-y-6 text-center max-w-sm">
        <div className="relative flex items-center justify-center">
          <AstrolabeStar className="w-12 h-12 text-[#D4AF37] animate-spin text-opacity-90" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-display font-medium tracking-wide text-[#FCF6E3]">
            {errorMsg ? "Authentication Error" : "Authorizing Session..."}
          </h2>
          <p className="text-xs text-[#FCF6E3]/60 leading-relaxed font-sans">
            {errorMsg ? errorMsg : "Finalizing secure login to OASIS ONE. Directing you to your workspace."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#141522] text-[#FCF6E3]">
          <AstrolabeStar className="w-10 h-10 text-[#D4AF37] animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
