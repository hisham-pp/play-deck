import type { MetadataRoute } from 'next';
import { GAME_DEFINITIONS } from '@/data/games';
import { absoluteUrl, gameOverviewPath } from '@/lib/seo/site';

/** Routes that exist independently of the catalog. */
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/games', changeFrequency: 'weekly', priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // One entry per game, always under the canonical slug. Player-specific
  // routes (/library, /profile) and session shells (/play/*) stay out.
  const gameEntries = GAME_DEFINITIONS.filter((game) => game.status !== 'coming-soon').map(
    (game) => ({
      url: absoluteUrl(gameOverviewPath(game.slug)),
      lastModified: game.releaseDate ? new Date(game.releaseDate) : now,
      changeFrequency: 'monthly' as const,
      priority: game.featured ? 0.8 : 0.7,
    }),
  );

  return [...staticEntries, ...gameEntries];
}
