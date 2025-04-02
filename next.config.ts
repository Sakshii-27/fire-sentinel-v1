import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disables ESLint build errors
  },
};

export default nextConfig;