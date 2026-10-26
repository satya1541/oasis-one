import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oasisodisha.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/who-its-for",
          "/experience",
          "/admission",
          "/faq",
          "/contact",
          "/legal",
          "/legal/*",
          "/join",
          "/login",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/dashboard",
          "/dashboard/*",
          "/community",
          "/community/*",
          "/people",
          "/people/*",
          "/events",
          "/events/*",
          "/planner",
          "/planner/*",
          "/settings",
          "/settings/*",
          "/profile",
          "/profile/*",
          "/notifications",
          "/notifications/*",
          "/application",
          "/application/*",
          "/verify-email",
          "/reset-password",
          "/suspended",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/who-its-for", "/experience", "/admission", "/faq", "/legal", "/legal/*", "/join"],
        disallow: ["/admin/*", "/api/*", "/dashboard/*", "/community/*", "/people/*"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/who-its-for", "/experience", "/admission", "/faq", "/legal", "/legal/*", "/join"],
        disallow: ["/admin/*", "/api/*", "/dashboard/*", "/community/*", "/people/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
