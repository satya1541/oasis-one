import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:7500/api/:path*",
      },
      {
        source: "/socket.io/:path*",
        destination: "http://localhost:7500/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
