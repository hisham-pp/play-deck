'use client';

import React from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { AchievementsCard } from '@/features/player/components/profile/AchievementsCard';

export default function ProfileAchievementsPage() {
  const stats = usePlayerStore((s) => s.stats);
  return (
    <div className="flex flex-col gap-8">
      <AchievementsCard stats={stats} />
    </div>
  );
}
