'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/player.store';

export function ProfileInit({ children }: { children: React.ReactNode }) {
  const initPlayer = usePlayerStore((s) => s.initPlayer);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  return <>{children}</>;
}
