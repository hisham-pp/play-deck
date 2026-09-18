import type { Metadata } from 'next';
import { GAME_DEFINITIONS } from '@/data/games';
import { DEFAULT_OG_IMAGE, gameOverviewPath, SITE_NAME } from '@/lib/seo/site';
import { PlayGameClient } from './PlayGameClient';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = GAME_DEFINITIONS.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    return { title: 'Game Session Not Found', robots: { index: false, follow: false } };
  }

  const description = `Instant browser session for ${game.name}. ${game.description}`;

  return {
    title: `Play ${game.name}`,
    description,
    // The session shell renders no crawlable content: the overview page is the
    // indexable surface for this game, so point search engines there instead.
    robots: { index: false, follow: true },
    alternates: { canonical: gameOverviewPath(game.slug) },
    openGraph: {
      title: `Play ${game.name} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: game.bannerUrl || game.thumbnailUrl || DEFAULT_OG_IMAGE,
          alt: `${game.name} cover art`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Play ${game.name} | ${SITE_NAME}`,
      description,
      images: [game.bannerUrl || game.thumbnailUrl || DEFAULT_OG_IMAGE],
    },
  };
}

export default async function PlayGamePage({ params }: PageProps) {
  const { gameId } = await params;
  return <PlayGameClient gameId={gameId} />;
}
