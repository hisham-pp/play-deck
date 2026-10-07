'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Medal, Settings, Users } from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/profile', icon: User },
  { name: 'Achievements', href: '/profile/achievements', icon: Medal },
  { name: 'Friends', href: '/profile/friends', icon: Users },
  { name: 'Settings', href: '/profile/settings', icon: Settings },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              isActive
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-surface-raised text-deck-400 border border-surface-border hover:bg-surface-overlay hover:text-deck-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
