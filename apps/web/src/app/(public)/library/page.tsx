import type { Metadata } from 'next';
import { LibraryClient } from './LibraryClient';

export const metadata: Metadata = {
  title: 'Your Library',
  description:
    'Persisted history of game sessions and saved matches from your local browser storage.',
  openGraph: {
    title: 'Your Library | PlayDeck',
    description:
      'Persisted history of game sessions and saved matches from your local browser storage.',
  },
};

export default function LibraryPage() {
  return <LibraryClient />;
}
