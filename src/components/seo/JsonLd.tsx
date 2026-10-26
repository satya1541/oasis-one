import React from "react";

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oasisodisha.in";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "OASIS",
    alternateName: ["OASIS Odisha", "OASIS Startup Network", "OASIS Community"],
    legalName: "OASIS Community Foundation",
    url: baseUrl,
    logo: `${baseUrl}/brand/favicon-32.png`,
    image: `${baseUrl}/brand/og-image.png`,
    description:
      "A vetted, members-only ecosystem connecting 650+ aspiring entrepreneurs, startup founders, and industry mentors across Odisha.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bhubaneswar",
      addressRegion: "Odisha",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Odisha",
    },
    knowsAbout: [
      "Startup Incubation",
      "Angel Investment in Odisha",
      "Startup Odisha Policy",
      "Venture Capital",
      "Tech Entrepreneurship",
      "Mentorship",
    ],
    sameAs: [
      "https://twitter.com/oasisodisha",
      "https://www.linkedin.com/company/oasisodisha",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "OASIS",
    alternateName: "OASIS Odisha Startup Platform",
    description:
      "Odisha's premier members-only startup and entrepreneurship network.",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
