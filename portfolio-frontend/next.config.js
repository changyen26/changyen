/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  experimental: {
    // Enable experimental features for better performance
    optimizePackageImports: ['framer-motion', 'gsap'],
  },
};

module.exports = nextConfig;