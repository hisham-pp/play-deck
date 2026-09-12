import type { Metadata } from 'next';
import { GAME_DEFINITIONS } from '@/data/games';
import { PlayGameClient } from './PlayGameClient';

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = GAME_DEFINITIONS.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    return {
      title: 'Game Session Not Found',
    };
  }

  return {
    title: `Play ${game.name}`,
    description: `Instant browser session for ${game.name}. ${game.description}`,
    openGraph: {
      title: `Play ${game.name} | PlayDeck`,
      description: `Instant browser session for ${game.name}. ${game.description}`,
      images: [
        {
          url: game.thumbnailUrl || '/images/og-image.png',
          alt: `${game.name} icon`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `Play ${game.name} | PlayDeck`,
      description: `Instant browser session for ${game.name}. ${game.description}`,
      images: [game.thumbnailUrl || '/images/og-image.png'],
    },
  };
}

export default async function PlayGamePage({ params }: PageProps) {
  const { gameId } = await params;
  return <PlayGameClient gameId={gameId} />;
}
