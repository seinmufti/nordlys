import type { NextConfig } from "next";
import { buildHostedRewrites } from "./src/data/hosted-rewrites";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.*",
    "192.168.0.*",
  ],
  async redirects() {
    return [
      // Rentobile was previously hosted as BaKre at /bakre.
      { source: "/bakre", destination: "/rentobile", permanent: true },
      { source: "/bakre/:path*", destination: "/rentobile/:path*", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: buildHostedRewrites(),
    };
  },
};

export default nextConfig;
