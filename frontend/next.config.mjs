/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress development warnings in production
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@clerk/nextjs',
      'framer-motion',
      'react',
      'react-dom'
    ],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
        },
        framer: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 20,
        },
        clerk: {
          test: /[\\/]node_modules[\\/]@clerk[\\/]/,
          name: 'clerk',
          chunks: 'all',
          priority: 20,
        }
      },
    };

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
      
      // Suppress console logs in production
      // Note: terser-webpack-plugin is included by default in Next.js
      // No need to manually add it
    }

    return config;
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Optimize compression
  compress: true,
  // Optimize powered by header
  poweredByHeader: false,
  // Optimize static generation
  generateEtags: false,
  // Optimize headers
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://clerk.dev https://helping-dolphin-19.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 https://api.openrouter.ai https://clerk.com https://clerk.dev https://helping-dolphin-19.clerk.accounts.dev; frame-src 'self' https://clerk.com https://helping-dolphin-19.clerk.accounts.dev; worker-src 'self' blob: data:;",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  // Optimize redirects
  async redirects() {
    return [];
  },
  // Optimize rewrites
  async rewrites() {
    // Build-time rewrite for secret admin path → /admin
    const raw = process.env.NEXT_PUBLIC_ADMIN_PATH;
    let secret = raw || '';
    if (secret) {
      if (!secret.startsWith('/')) secret = `/${secret}`;
      if (secret.length > 1 && secret.endsWith('/')) secret = secret.slice(0, -1);
    }
    const rules = [];
    if (secret && secret !== '/admin') {
      rules.push(
        { source: `${secret}`, destination: '/admin' },
        { source: `${secret}/:path*`, destination: '/admin/:path*' }
      );
    }
    return rules;
  },
};

export default nextConfig; 