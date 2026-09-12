import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

export const metadata: Metadata = {
  title: 'Player Profile',
  description:
    'Manage your player handle, avatar, statistics, and local browser storage diagnostics.',
  openGraph: {
    title: 'Player Profile | PlayDeck',
    description:
      'Manage your player handle, avatar, statistics, and local browser storage diagnostics.',
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
