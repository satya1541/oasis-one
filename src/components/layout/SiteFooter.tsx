import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  HelpCircle,
  FileText,
  Lock,
  Users,
  AlertCircle,
  Cookie,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full bg-[#12131F] text-[#FCF6E3] border-t border-[#D4AF37]/20 pt-16 pb-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-[1240px] mx-auto space-y-12">
        {/* ── Main Footer Columns Grid ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand & Community Identity (span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLockup variant="full" href="/" />
            <p className="text-xs sm:text-sm text-[#FCF6E3]/70 leading-relaxed max-w-sm pt-1">
              OASIS ONE is the admin-approved, role-aware digital sanctuary for 650+ aspiring entrepreneurs, startup founders, and mentors across Odisha.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Network Active
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-mono text-[#D4AF37]">
                650+ Vetted Members
              </span>
            </div>

            <div className="pt-2 text-[11px] font-mono text-[#FCF6E3]/40 tracking-wider uppercase">
              Bhubaneswar · Cuttack · Rourkela · Sambalpur · Berhampur
            </div>
          </div>

          {/* Column 2: Ecosystem & Navigation (span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FCF6E3]/75">
              <li>
                <Link href="/join" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1">
                  <span>Apply to Join</span>
                  <ArrowUpRight className="w-3 h-3 text-[#D4AF37]/60" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#D4AF37] transition-colors">
                  Member Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#D4AF37] transition-colors">
                  Community Portal
                </Link>
              </li>
              <li>
                <Link href="/people" className="hover:text-[#D4AF37] transition-colors">
                  Founders &amp; Mentors
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#D4AF37] transition-colors">
                  Events &amp; Roundtables
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1">
                  <span>Migration FAQ</span>
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance (span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Legal &amp; Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FCF6E3]/75">
              <li>
                <Link href="/legal" className="hover:text-[#D4AF37] transition-colors font-medium text-[#FCF6E3]">
                  Legal &amp; Governance Hub
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <span>Privacy Notice (DPDP Act)</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <span>Community Guidelines</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/grievance" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <span>Grievance &amp; Appeals</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-[#D4AF37] transition-colors inline-flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                  <span>Operations &amp; Cookies</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Statutory Registered Office & Support (span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] font-mono">
              Registered Office
            </h4>
            <div className="space-y-3 text-xs text-[#FCF6E3]/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Plot No.: 2762, Brahmeswar Patna,<br />
                  Bhubaneswar, Odisha, India, 751018
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="tel:+919040198628" className="hover:text-[#D4AF37] transition-colors">
                  +91-904-01-98-628
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href="mailto:Info@oasisodisha.in" className="hover:text-[#D4AF37] transition-colors">
                  Info@oasisodisha.in
                </a>
              </div>

              <div className="pt-2 border-t border-white/10">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:underline"
                >
                  <span>Submit Inquiry or Grievance Ticket →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-Footer Bar ───────────────────────────────────────── */}
        <div className="pt-8 border-t border-[#D4AF37]/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FCF6E3]/50">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-center md:text-left text-[11px]">
            <span>© 2026 OASIS ONE. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span>Digital Personal Data Protection Act, 2023 (DPDP Act) Compliant</span>
            <span className="hidden sm:inline">·</span>
            <span>Rule 3 Intermediary Guidelines Compliant</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-[#D4AF37]/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin-Vetted Entrepreneurship Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
