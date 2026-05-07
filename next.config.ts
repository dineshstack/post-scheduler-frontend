import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['ckeditor5', '@ckeditor/ckeditor5-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',   // DineshStack blog uses ImageKit
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // Proxy API calls to the Laravel backend during development
  // In production, use environment variables + direct calls
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },

  // Redirect root path to dashboard (proxy.ts will handle auth check)
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
