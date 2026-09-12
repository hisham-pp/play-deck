import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import { GameTemplate } from '@/components/game/GameTemplate';
import { GAME_DEFINITIONS } from '@/data/games';

export async function generateStaticParams() {
  return GAME_DEFINITIONS.map((game) => ({
    gameId: game.id,
  }));
}

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = GAME_DEFINITIONS.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    return {
      title: 'Game Not Found',
    };
  }

  return {
    title: `${game.name} — Overview & Play Rules`,
    description: game.description,
    keywords: [game.name, game.category, ...game.tags, 'PlayDeck'],
    openGraph: {
      title: `${game.name} — Overview & Play Rules | PlayDeck`,
      description: game.description,
      images: [
        {
          url: game.thumbnailUrl || '/images/og-image.png',
          alt: `${game.name} icon`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${game.name} — Overview & Play Rules | PlayDeck`,
      description: game.description,
      images: [game.thumbnailUrl || '/images/og-image.png'],
    },
  };
}

export default async function GameOverviewPage({ params }: PageProps) {
  const { gameId } = await params;
  const game = GAME_DEFINITIONS.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    notFound();
  }

  const { createGame: _createGame, ...serializableGame } = game;

  return <GameTemplate game={serializableGame} />;
}
