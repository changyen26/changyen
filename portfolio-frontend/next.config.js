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
  // 允許跨域開發請求 - 支援手機和其他設備訪問
  allowedDevOrigins: [
    'http://192.168.254.48:3000', // 允許從 IP 地址訪問
    'http://localhost:3000',      // 允許本地訪問
  ],
  // 允許外部圖片域名
  images: {
    domains: ['localhost', '192.168.254.48'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.254.48',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
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