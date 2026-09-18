import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { GameTemplate } from '@/components/game/GameTemplate';
import { pickRelatedGames, RelatedGames } from '@/components/game/RelatedGames';
import { JsonLd } from '@/components/seo/JsonLd';
import { GAME_DEFINITIONS } from '@/data/games';
import { getGameContent } from '@/data/games/content';
import { DEFAULT_OG_IMAGE, gameOverviewPath, gamePlayPath, SITE_NAME } from '@/lib/seo/site';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGameSchema,
  buildHowToSchema,
} from '@/lib/seo/structured-data';

/**
 * The catalog is fully known at build time, so every game page is prerendered
 * and any other slug is a hard 404. Without this, Next renders unknown params
 * on demand and caches the not-found page as a 200 — a soft 404 that search
 * engines will happily index.
 */
export const dynamicParams = false;

/** Each game is pre-rendered at build time under its canonical slug. */
export async function generateStaticParams() {
  return GAME_DEFINITIONS.map((game) => ({ gameId: game.slug }));
}

interface PageProps {
  params: Promise<{ gameId: string }>;
}

/**
 * Slug-only on purpose: the slug is the single canonical URL for a game.
 * Legacy id URLs are 308'd to it by `redirects()` in next.config.ts, and
 * anything else is a genuine 404 rather than a second copy of the page.
 */
function findGame(slug: string): GameDefinition | undefined {
  return GAME_DEFINITIONS.find((game) => game.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = findGame(gameId);

  if (!game) {
    return { title: 'Game Not Found', robots: { index: false, follow: false } };
  }

  const content = getGameContent(game.id);
  const title = content?.seo.title ?? `${game.name} — Overview & Play Rules`;
  const description = content?.seo.description ?? game.description;
  const canonical = gameOverviewPath(game.slug);
  const image = game.bannerUrl || game.thumbnailUrl || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    keywords: [game.name, game.category, ...game.tags, ...(content?.seo.keywords ?? []), SITE_NAME],
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${game.name} cover art` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function GameOverviewPage({ params }: PageProps) {
  const { gameId } = await params;
  const game = findGame(gameId);

  if (!game) {
    notFound();
  }

  const { createGame: _createGame, ...serializableGame } = game;
  const content = getGameContent(game.id);
  const related = pickRelatedGames(game, GAME_DEFINITIONS);

  return (
    <>
      <JsonLd
        schema={[
          buildGameSchema(game, content),
          buildBreadcrumbSchema(game),
          content ? buildHowToSchema(game, content) : null,
          content ? buildFaqSchema(content) : null,
        ]}
      />
      <GameTemplate
        game={serializableGame}
        content={content}
        playHref={gamePlayPath(game.slug)}
        footer={<RelatedGames games={related} />}
      />
    </>
  );
}
