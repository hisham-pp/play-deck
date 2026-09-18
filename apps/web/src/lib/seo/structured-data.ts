import type { GameContent } from '@playdeck/game-types';
import type { GameDefinition } from '@playdeck/game-types';
import { SITE_NAME, SITE_URL, absoluteUrl, gameOverviewPath, gamePlayPath } from './site';

const SCHEMA_CONTEXT = 'https://schema.org';

type JsonLd = Record<string, unknown>;

const CATEGORY_GENRES: Record<string, string> = {
  puzzle: 'Puzzle',
  strategy: 'Strategy',
  arcade: 'Arcade',
  board: 'Board Game',
  card: 'Card Game',
  casual: 'Casual',
  all: 'Casual',
};

/** Coming-soon entries carry a placeholder like "Coming Soon" rather than a date. */
function isoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : value;
}

function playModes(game: GameDefinition): string[] {
  const modes: string[] = [];
  if (game.players.min <= 1) modes.push('SinglePlayer');
  if (game.players.max > 1) modes.push('MultiPlayer');
  return modes;
}

/**
 * `VideoGame` entity for a single game page. Google surfaces name, image,
 * genre and aggregate play modes from this.
 */
export function buildGameSchema(game: GameDefinition, content?: GameContent): JsonLd {
  const url = absoluteUrl(gameOverviewPath(game.slug));

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'VideoGame',
    '@id': `${url}#game`,
    name: game.name,
    url,
    description: content?.seo.description ?? game.description,
    image: absoluteUrl(game.bannerUrl || game.thumbnailUrl || '/images/og-image.png'),
    genre: CATEGORY_GENRES[game.category] ?? 'Casual',
    keywords: [...game.tags, ...(content?.seo.keywords ?? [])].join(', '),
    inLanguage: 'en',
    playMode: playModes(game),
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      minValue: game.players.min,
      maxValue: game.players.max,
    },
    gamePlatform: ['Web Browser', 'PC', 'Mobile'],
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    ...(isoDate(game.releaseDate) ? { datePublished: game.releaseDate } : {}),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability:
        game.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: absoluteUrl(
        game.status === 'available' ? gamePlayPath(game.slug) : gameOverviewPath(game.slug),
      ),
    },
  };
}

/** Breadcrumb trail: Home › Games › <Game>. */
export function buildBreadcrumbSchema(game: GameDefinition): JsonLd {
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: game.name, path: gameOverviewPath(game.slug) },
  ];

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** FAQ rich result. Only emitted when the game actually has questions. */
export function buildFaqSchema(content: GameContent): JsonLd | null {
  if (!content.faq.length) return null;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: content.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/** Step-by-step `HowTo` derived from the game's How to Play section. */
export function buildHowToSchema(game: GameDefinition, content: GameContent): JsonLd | null {
  if (!content.howToPlay.length) return null;

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'HowTo',
    name: `How to play ${game.name}`,
    description: content.tagline,
    totalTime: 'PT2M',
    step: content.howToPlay.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      url: `${absoluteUrl(gameOverviewPath(game.slug))}#how-to-play`,
    })),
  };
}

/** `ItemList` for the catalog page so the full roster is machine-readable. */
export function buildGameListSchema(games: GameDefinition[]): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'ItemList',
    name: `${SITE_NAME} Games Catalog`,
    numberOfItems: games.length,
    itemListElement: games.map((game, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: game.name,
      url: absoluteUrl(gameOverviewPath(game.slug)),
    })),
  };
}
