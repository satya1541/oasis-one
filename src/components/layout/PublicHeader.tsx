"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicHeaderProps {
  activeRoute?: "who-its-for" | "admission" | "experience" | "faq" | "contact";
}

export function PublicHeader({ activeRoute }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/who-its-for", label: "Who it's for", key: "who-its-for" },
    { href: "/experience", label: "Experience", key: "experience" },
    { href: "/admission", label: "Admission", key: "admission" },
    { href: "/faq", label: "FAQ", key: "faq" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#1E1F33]/90 backdrop-blur-2xl border-b border-[#F3D3A2]/15 px-4 sm:px-8 lg:px-12 h-16 sm:h-[72px] flex items-center transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.25)] pt-[env(safe-area-inset-top,0px)]">
        <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
          <BrandLockup variant="horizontal" priority href="/" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {navLinks.map((item) => {
              const isActive = activeRoute === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "text-xs uppercase tracking-[0.16em] font-medium transition-colors duration-200",
                    isActive
                      ? "text-[var(--brand-gold)] font-semibold border-b-2 border-[var(--brand-gold)] pb-1 pt-1"
                      : "text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/legal/privacy"
              className="text-xs uppercase tracking-[0.16em] font-medium text-[var(--brand-cream)]/70 hover:text-[var(--brand-gold)] transition-colors duration-200"
            >
              Privacy Policy
            </Link>

            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[var(--brand-cream)]/85 hover:text-[var(--brand-gold)] transition-colors duration-200 ml-2"
            >
              Log in
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/15 font-medium h-9 px-4.5 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
              asChild
            >
              <Link href="/join">Join OASIS</Link>
            </Button>
          </nav>

          {/* Mobile Right Bar (<768px) */}
          <div className="flex md:hidden items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--brand-gold)]/40 text-[var(--brand-gold)] hover:bg-[var(--brand-gold)]/15 font-medium h-8.5 px-3 rounded-full text-xs"
              asChild
            >
              <Link href="/join">Join</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-[var(--brand-cream)]/80 hover:text-[var(--brand-cream)] hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#12131F]/90 backdrop-blur-xl flex flex-col justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] text-[var(--brand-cream)] animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <BrandLockup variant="horizontal" priority href="/" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col space-y-3 py-6 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  activeRoute === item.key
                    ? "bg-white/10 text-[var(--brand-gold)] font-semibold"
                    : "hover:bg-white/5 text-[var(--brand-cream)]/90"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/legal/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-white/5 text-[var(--brand-cream)]/90"
            >
              Contact &amp; Support
            </Link>
          </div>

          <div className="space-y-3 pt-5 border-t border-white/10">
            <Button
              variant="gold"
              size="lg"
              className="w-full justify-center rounded-2xl h-11 text-sm font-semibold shadow-lg"
              asChild
            >
              <Link href="/join" onClick={() => setMobileMenuOpen(false)}>
                Apply to Join OASIS
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center rounded-2xl h-11 text-sm text-[var(--brand-cream)] border-white/20 hover:bg-white/5"
              asChild
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                Member Portal Sign In
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
