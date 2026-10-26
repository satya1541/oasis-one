import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · OASIS Member Sanctuary",
  description:
    "Secure sign-in for verified OASIS members. Access your entrepreneur dashboard, peer directory, community discussions, and mentor requests.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Sign In · OASIS Member Sanctuary",
    description:
      "Secure sign-in for verified OASIS members. Access your entrepreneur dashboard, peer directory, community discussions, and mentor requests.",
    url: "https://oasisodisha.in/login",
    type: "website",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
