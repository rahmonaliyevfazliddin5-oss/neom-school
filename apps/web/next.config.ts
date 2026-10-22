import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output is active inside Docker container builds (Linux)
  // On Windows host, default output avoids EPERM symlink restrictions
  output: process.env.NEXT_OUTPUT_STANDALONE === 'true' ? 'standalone' : undefined,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  transpilePackages: ['@neom/shared'],
  async rewrites() {
    return [];
  },
};

export default nextConfig;
