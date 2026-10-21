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

export const viewport: Viewport = {
  themeColor: "#1E1F33",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://oasisodisha.in"),
  title: "OASIS ONE — One Community. Infinite Possibilities.",
  description:
    "A members-only home for Odisha's aspiring entrepreneurs, founders and mentors. Find the right people, ask better questions, meet in person. 650+ verified members.",
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
    title: "OASIS ONE — One Community. Infinite Possibilities.",
    description:
      "A members-only home for Odisha's aspiring entrepreneurs, founders and mentors. 650+ verified members.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "OASIS ONE — Odisha Startup Community",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OASIS ONE — One Community. Infinite Possibilities.",
    description:
      "A members-only home for Odisha's aspiring entrepreneurs, founders and mentors. 650+ verified members.",
    images: ["/brand/og-image.png"],
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
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
