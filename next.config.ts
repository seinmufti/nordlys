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
  async headers() {
    return [
      {
        source: "/:slug",
        headers: [
          {
            key: "Permissions-Policy",
            value: "fullscreen=(self), web-share=(self), clipboard-write=(self), clipboard-read=(self)",
          },
        ],
      },
      {
        source: "/:slug/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "fullscreen=(self), web-share=(self), clipboard-write=(self), clipboard-read=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
