import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { CompactGameCard } from './CompactGameCard';
import { FeaturedGameCard } from './FeaturedGameCard';
import { StandardGameCard } from './StandardGameCard';

interface GameCardProps {
  game: GameDefinition;
  layout?: 'standard' | 'featured' | 'compact';
}

export function GameCard({ game, layout = 'standard' }: GameCardProps) {
  if (layout === 'featured') {
    return <FeaturedGameCard game={game} />;
  }

  if (layout === 'compact') {
    return <CompactGameCard game={game} />;
  }

  return <StandardGameCard game={game} />;
}
