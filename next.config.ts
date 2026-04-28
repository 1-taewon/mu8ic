import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    turbopack: {
      resolveAlias: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
  },
};

export default nextConfig;
