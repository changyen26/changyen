import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  experimental: {
    // Enable experimental features for better performance
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
};

export default nextConfig;