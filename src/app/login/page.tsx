"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { AuthUI } from "@/components/ui/auth-ui";
import { AccountLockedModal } from "@/components/auth/AccountLockedModal";
import { UnregisteredAccountModal } from "@/components/auth/UnregisteredAccountModal";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedEmail, setLockedEmail] = useState("");
  const [unregisteredModalOpen, setUnregisteredModalOpen] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const notice = params.get("notice");
    const emailQuery = params.get("email");
    if (notice === "not_registered") {
      const timer = window.setTimeout(() => {
        setUnregisteredEmail(emailQuery || "");
        setUnregisteredModalOpen(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          json?.error?.message || json?.message || "Invalid email address or password."
        );
      }

      const user = json?.data?.user;

      // Handle Admin Multi-Factor Authentication requirement
      if (user?.requiresMfa) {
        window.location.href = "/admin/mfa";
        return;
      }

      // Handle unapproved/locked membership state
      if (
        user?.accountStatus === "pending_verification" ||
        user?.accountStatus === "pending_approval"
      ) {
        setLockedEmail(user.email || email);
        setLockedModalOpen(true);
        return;
      }

      // Active approved member / admin routing
      if (user?.adminLevel) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthUI
        title="Welcome back"
        subtitle="Sign in to access your venture dashboard and community"
        emailPlaceholder="name@startup.in"
        submitLabel="Sign in"
        loadingLabel="Signing in..."
        isLoading={isLoading}
        error={error}
        onClearError={() => {
          if (error) setError(null);
        }}
        onSignIn={handleSignIn}
        onGoogleClick={() => {
          window.location.href = "/api/v1/auth/google?mode=login";
        }}
        showSignUpToggle={false}
        signUpPrompt="New to OASIS?"
        signUpLinkLabel="Apply for membership"
        signUpHref="/join"
        signInContent={{
          image: {
            src: "/login-assets/login-astronaut.jpg",
            alt: "Astronaut connecting power cables with lightning in space",
            fit: "contain",
            bgClassName: "bg-black",
          },
          quote: {
            text: "Building Odisha's startup ecosystem, one founder at a time.",
            author: "OASIS · Odisha Startup Community",
          },
        }}
        topBarSlot={
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group focus:outline-none"
              aria-label="OASIS home"
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#1E1F33] p-1.5 border border-[#E9C68C]/35 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-[1.03]">
                <Image
                  src="/login-assets/oasis-emblem-gold.png"
                  alt="OASIS Odisha Startup Community"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-[0.2em] text-[#1E1F33] uppercase">
                  OASIS
                </span>
                <span className="text-[10px] tracking-wider text-[#656482] uppercase mt-1">
                  Odisha Startup Community
                </span>
              </div>
            </Link>
            <Link
              href="/faq"
              className="text-xs font-medium text-[#656482] hover:text-[#1E1F33] transition-colors"
            >
              Need help?
            </Link>
          </div>
        }
        bottomSlot={
          <div className="text-center space-y-2">
            <p className="text-[11px] text-[#656482]">
              By continuing, you agree to our{" "}
              <Link
                href="/legal/privacy"
                className="underline underline-offset-2 hover:text-[#1E1F33]"
              >
                Privacy Notice
              </Link>{" "}
              and{" "}
              <Link
                href="/legal/guidelines"
                className="underline underline-offset-2 hover:text-[#1E1F33]"
              >
                Community Guidelines
              </Link>
              .
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#656482]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#86601F] shrink-0" />
              <span>Encrypted login &middot; Admin-approved membership</span>
            </div>
          </div>
        }
      />

      {/* Modals */}
      <AccountLockedModal
        isOpen={lockedModalOpen}
        onClose={() => {
          setLockedModalOpen(false);
          window.location.href = "/dashboard";
        }}
        email={lockedEmail}
        onViewApplication={() => {
          setLockedModalOpen(false);
          window.location.href = "/dashboard";
        }}
      />

      <UnregisteredAccountModal
        isOpen={unregisteredModalOpen}
        onClose={() => setUnregisteredModalOpen(false)}
        email={unregisteredEmail}
        onContinue={() => {
          window.location.href = `/join?notice=not_registered&email=${encodeURIComponent(
            unregisteredEmail
          )}`;
        }}
      />
    </>
  );
}
