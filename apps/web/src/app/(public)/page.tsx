import type { Metadata } from 'next';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  title: 'Play Something — Curated Arcade Hub',
  description:
    'Discover and play instant local arcade and strategy games directly in your browser with zero latency.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'Play Something — Curated Arcade Hub | PlayDeck',
    description:
      'Discover and play instant local arcade and strategy games directly in your browser with zero latency.',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
