import type { Metadata } from 'next';
import { GamesCatalogClient } from './GamesCatalogClient';

export const metadata: Metadata = {
  title: 'Games Catalog',
  description:
    'Browse our curated collection of instant arcade, strategy, and puzzle games ready for browser play.',
  openGraph: {
    title: 'Games Catalog | PlayDeck',
    description:
      'Browse our curated collection of instant arcade, strategy, and puzzle games ready for browser play.',
  },
};

export default function GamesPage() {
  return <GamesCatalogClient />;
}
