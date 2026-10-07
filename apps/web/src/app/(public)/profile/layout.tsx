import type { Metadata } from 'next';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileNav } from './components/ProfileNav';
import { ProfileInit } from './components/ProfileInit';

export const metadata: Metadata = {
  title: 'Player Profile',
  description: 'Manage your player handle, avatar, statistics, and settings.',
  openGraph: {
    title: 'Player Profile | PlayDeck',
    description: 'Manage your player handle, avatar, statistics, and settings.',
  },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileInit>
      <div className="max-w-5xl mx-auto pb-12 pt-6 px-4">
        <ProfileHeader />
        
        <div className="mt-8 flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-56 shrink-0">
            <ProfileNav />
          </aside>
          
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProfileInit>
  );
}
