/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // 安全標頭配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:8000 http://192.168.254.48:8000 https://changyen-backend.zeabur.app; font-src 'self'; connect-src 'self' http://localhost:8000 http://192.168.254.48:8000 https://changyen-backend.zeabur.app; frame-src 'none';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
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
    domains: ['localhost', '192.168.254.48', 'changyen-backend.zeabur.app'],
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
      {
        protocol: 'https',
        hostname: 'changyen-backend.zeabur.app',
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