import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  // Don't static-generate any pages (avoids DB connection issues during build)
  experimental: {
  },
};

export default nextConfig;
