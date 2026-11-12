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
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300&family=Instrument+Sans:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="join-flow dark min-h-screen w-full bg-[#03080B] text-[#F5FAF6] antialiased md:h-svh md:max-h-svh md:overflow-hidden"
        style={{
          backgroundColor: "#03080B",
          color: "#F5FAF6",
          colorScheme: "dark",
        }}
      >
        {children}
      </div>
    </>
  );
}
