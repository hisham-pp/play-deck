'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, Compass, Library, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { usePlayerStore } from '@/stores/player.store';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/games', label: 'Games', icon: Compass },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { player, initPlayer } = usePlayerStore();

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  return (
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
                    : 'text-deck-600 dark:text-deck-400 hover:text-deck-900 dark:hover:text-white hover:bg-surface-raised'
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
          <ThemeToggle />

          <Link
            href="/profile"
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-surface-border bg-surface-raised hover:bg-surface-overlay transition-colors text-xs font-medium"
          >
            <span className="text-base">{player?.avatar || '🕹️'}</span>
            <span className="max-w-[90px] truncate text-deck-700 dark:text-deck-300">
              {player?.displayName || 'Player'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
