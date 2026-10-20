import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output is active inside Docker container builds (Linux)
  // On Windows host, default output avoids EPERM symlink restrictions
  output: process.env.NEXT_OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,
  reactStrictMode: true,
  transpilePackages: ['@neom/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_INTERNAL_URL || 'http://127.0.0.1:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
