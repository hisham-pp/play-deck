import type { GameCategory } from './game';

export interface Player {
  id: string;
  displayName: string;
  avatar?: string;
  isGuest: boolean;
  createdAt: string;
  email?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: GameCategory | 'general';
  icon: string;
  xpReward: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  favoriteCategory?: GameCategory;
  totalScore?: number;
  xp?: number;
  level?: number;
  title?: string;
  currentStreak?: number;
  bestStreak?: number;
  bestScores?: Record<string, number>;
  unlockedAchievements?: string[];
  achievementsData?: Record<string, { unlockedAt: string; progress?: number }>;
  categoryPlays?: Record<string, number>;
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
