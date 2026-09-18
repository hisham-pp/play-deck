import type { NextConfig } from 'next';
import { GAME_DEFINITIONS } from './src/data/games';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@playdeck/game-core',
    '@playdeck/game-types',
    '@playdeck/shared',
    '@playdeck/ui',
  ],
  /**
   * A game whose id differs from its slug would otherwise be reachable at two
   * URLs. Redirecting at the routing layer gives a real 308 — a `redirect()`
   * inside a prerendered page only produces a meta-refresh soft redirect.
   */
  async redirects() {
    return GAME_DEFINITIONS.filter((game) => game.id !== game.slug).map((game) => ({
      source: `/games/${game.id}`,
      destination: `/games/${game.slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
