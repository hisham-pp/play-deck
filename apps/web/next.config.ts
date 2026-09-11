import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@playdeck/game-core', '@playdeck/game-types', '@playdeck/shared'],
};

export default nextConfig;
