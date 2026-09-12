import type { GameCategory } from './game';

export interface Player {
  id: string;
  displayName: string;
  avatar?: string;
  isGuest: boolean;
  createdAt: string;
  email?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  favoriteCategory?: GameCategory;
}

export interface PlayerPreferences {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  reducedMotion: boolean;
  autoSave: boolean;
}

export interface PlayerGameStats {
  playerId: string;
  gameId: string;
  highScore: number;
  gamesPlayed: number;
  lastPlayedAt: string;
  customData?: Record<string, unknown>;
}
