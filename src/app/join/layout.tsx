import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for OASIS Membership · Join Odisha's Premier Founder Network",
  description:
    "Apply to join OASIS — Odisha's members-only community for startup founders, aspiring entrepreneurs, and mentors. Connect with 650+ verified ecosystem builders.",
  alternates: {
    canonical: "/join",
  },
  keywords: [
    "Join OASIS Odisha",
    "Startup Membership Odisha",
    "Odisha Founder Community Apply",
    "Odisha Startup Mentorship Application",
    "Bhubaneswar Startup Network Join",
  ],
  openGraph: {
    title: "Apply for OASIS Membership · Join Odisha's Premier Founder Network",
    description:
      "Apply to join OASIS — Odisha's members-only community for startup founders, aspiring entrepreneurs, and mentors.",
    url: "https://oasisodisha.in/join",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apply for OASIS Membership · Join Odisha's Premier Founder Network",
    description:
      "Apply to join OASIS — Odisha's members-only community for startup founders, aspiring entrepreneurs, and mentors.",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
