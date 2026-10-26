import type { Metadata, Viewport } from "next";
import { Jost, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

import { JsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  themeColor: "#1E1F33",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://oasisodisha.in"),
  title: {
    default: "OASIS — Odisha's Premier Startup & Entrepreneurship Community",
    template: "%s | OASIS Odisha",
  },
  description:
    "A vetted, members-only ecosystem connecting 650+ aspiring entrepreneurs, startup founders, and mentors in Odisha. Find co-founders, get mentored, and scale your venture.",
  applicationName: "OASIS",
  keywords: [
    "OASIS Odisha",
    "Odisha Startups",
    "Bhubaneswar Startup Founders",
    "Odisha Entrepreneurship Network",
    "Startup Mentorship Odisha",
    "Startup Odisha Policy Grants",
    "Angel Investors Odisha",
    "Odisha Tech Founders",
    "Make in Odisha Startups",
    "Cuttack Rourkela Entrepreneurs",
    "Odisha Angel Network",
    "Early Stage Founders India",
  ],
  authors: [{ name: "OASIS Community", url: "https://oasisodisha.in" }],
  creator: "OASIS Community Foundation",
  publisher: "OASIS",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon.ico" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://oasisodisha.in",
    siteName: "OASIS — Odisha Startup Network",
    title: "OASIS — Odisha's Premier Startup & Entrepreneurship Community",
    description:
      "A vetted, members-only ecosystem connecting 650+ aspiring entrepreneurs, startup founders, and mentors in Odisha.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "OASIS — Odisha Startup Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@oasisodisha",
    creator: "@oasisodisha",
    title: "OASIS — Odisha's Premier Startup & Entrepreneurship Community",
    description:
      "A vetted, members-only ecosystem connecting 650+ aspiring entrepreneurs, startup founders, and mentors in Odisha.",
    images: ["/brand/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
