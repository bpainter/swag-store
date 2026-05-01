import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com",
      },
    ],
  },
  // Client router cache windows. Recently-visited routes serve from the
  // in-memory RSC payload cache without a server roundtrip during the
  // window — back-button + tab-flip navigations feel instant. Catalog
  // doesn't churn minute-to-minute, so 60s/300s is safe.
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
};

export default nextConfig;
