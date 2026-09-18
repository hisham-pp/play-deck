import type { Metadata } from 'next';
import React from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import { GAME_DEFINITIONS } from '@/data/games';
import { SITE_NAME } from '@/lib/seo/site';
import { buildGameListSchema } from '@/lib/seo/structured-data';
import { GamesCatalogClient } from './GamesCatalogClient';

const TITLE = 'Games Catalog';
const DESCRIPTION =
  'Browse our curated collection of instant arcade, strategy, puzzle and board games ready for browser play. Free, no download, no sign-up.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/games' },
  openGraph: {
    type: 'website',
    url: '/games',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default function GamesPage() {
  const available = GAME_DEFINITIONS.filter((game) => game.status !== 'coming-soon');

  return (
    <>
      <JsonLd schema={[buildGameListSchema(available)]} />
      <GamesCatalogClient />
    </>
  );
}
