import type { Player, PlayerStats } from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { StorageService } from '@/lib/storage/storage';

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
};

export function createGuestPlayer(): Player {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    id: generateId('player'),
    displayName: `Player_${randomSuffix}`,
    avatar: '🕹️',
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
}

export async function persistPlayerAndStats(player: Player, stats: PlayerStats): Promise<void> {
  await StorageService.set(STORAGE_KEYS.PLAYER, { player, stats });
}
