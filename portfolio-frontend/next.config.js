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
  webpack: (config) => {
    // Ensure proper module resolution
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    return config;
  },
};

module.exports = nextConfig;