import { GameCategory } from './game';

export interface Player {
  id: string;
  displayName: string;
  avatar?: string;
  isGuest: boolean;
  createdAt: string;
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
