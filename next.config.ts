import type { NextConfig } from "next";
import { buildHostedRewrites } from "./src/data/hosted-rewrites";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.*",
    "192.168.0.*",
  ],
  async rewrites() {
    return {
      beforeFiles: buildHostedRewrites(),
    };
  },
};

export default nextConfig;
