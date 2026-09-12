'use client';

import { Compass, Gamepad2, Library, LogIn, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { FriendsModal } from '@/features/friends/components/FriendsModal';
import { GameInviteToast } from '@/features/friends/components/GameInviteToast';
import { useFriendsRealtime } from '@/features/friends/hooks/use-friends-realtime';
import { cn } from '@/lib/utils';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/games', label: 'Games', icon: Compass },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { player, initPlayer, setAuthModalOpen } = usePlayerStore();
  const { setModalOpen, incomingRequests, pendingInvites } = useFriendsStore();

  useFriendsRealtime();

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  const totalNotifications = incomingRequests.length + pendingInvites.length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface-base/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-base uppercase font-display text-deck-950 dark:text-white">
                PLAYDECK
              </span>
            </div>
          </Link>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'text-deck-950 dark:text-white bg-surface-overlay border border-surface-border'
                      : 'text-deck-600 dark:text-deck-400 hover:text-deck-900 dark:hover:text-white hover:bg-surface-raised',
                  )}
                >
                  <Icon className="w-4 h-4 opacity-70" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right action controls */}
          <div className="flex items-center gap-3">
            {/* Friends Trigger */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="relative p-2 rounded-lg border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-400 hover:text-white transition-colors"
              title="Friends & Invites"
              aria-label="Friends Hub"
            >
              <Users className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-deck-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            <ThemeToggle />

            {player?.isGuest && (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              href="/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-surface-border bg-surface-raised hover:bg-surface-overlay transition-colors text-xs font-medium"
            >
              <span className="text-base">{player?.avatar || '🕹️'}</span>
              <span className="max-w-[90px] truncate text-deck-700 dark:text-deck-300">
                {player?.displayName || 'Player'}
              </span>
              {player?.isGuest ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-overlay text-deck-400 uppercase font-mono">
                  Guest
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Signed in" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Modals & Notifications */}
      <AuthModal />
      <FriendsModal />
      <GameInviteToast />
    </>
  );
}
