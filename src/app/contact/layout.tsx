import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Community Support · OASIS Odisha",
  description:
    "Get in touch with the OASIS team for membership queries, partnership opportunities, grievance redressal, or technical support.",
  alternates: {
    canonical: "/contact",
  },
  keywords: [
    "Contact OASIS Odisha",
    "OASIS Support",
    "Odisha Startup Community Helpdesk",
    "OASIS Bhubaneswar",
  ],
  openGraph: {
    title: "Contact & Community Support · OASIS Odisha",
    description:
      "Get in touch with the OASIS team for membership queries, partnership opportunities, or technical support.",
    url: "https://oasisodisha.in/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
