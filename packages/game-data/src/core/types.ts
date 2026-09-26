import type {
  GameCategory,
  GameContent,
  GameControlDefinition,
  GameControlItem,
  GameDefinition,
  GameDifficultyPreset,
  GameFaqItem,
  GameHowToStep,
  GameRuleItem,
  GameSeoMeta,
  PlayerCapacity,
  StickmanGameSubtype,
} from '@playdeck/game-types';
import type { GameStatus } from '../enums/status.enum';

export interface GameEntryOptions<TState = unknown> {
  id: string;
  name?: string;
  slug?: string;
  description: string;
  category: GameCategory;
  players: PlayerCapacity;
  status?: GameStatus;
  thumbnailUrl?: string;
  bannerUrl?: string;
  iconExt?: string;
  bannerExt?: string;
  tags?: string[];
  featured?: boolean;
  releaseDate?: string;
  badge?: string;
  controls?: GameControlDefinition[];
  difficultyPresets?: GameDifficultyPreset[];
  subtype?: StickmanGameSubtype | string;
  createGame?: () => TState;
  content?: GameContent;
}

/**
 * Unified game module declaration combining definition metadata and editorial content.
 * Single source of truth for an entire game.
 * Note: `status` is optional and defaults to `'available'`, `featured` defaults to `true`, and `name` defaults to auto-formatted title from `id`.
 */
export interface UnifiedGameModuleOptions<TState = unknown> {
  id: string;
  name?: string;
  slug?: string;
  description: string;
  category: GameCategory;
  players: PlayerCapacity;
  status?: GameStatus;
  releaseDate?: string;
  tags?: string[];
  featured?: boolean;
  badge?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  iconExt?: string;
  bannerExt?: string;
  controls?: GameControlDefinition[] | GameControlItem[];
  difficultyPresets?: GameDifficultyPreset[];
  subtype?: StickmanGameSubtype | string;
  createGame?: () => TState;

  // Editorial & SEO content fields
  seo: GameSeoMeta;
  tagline: string;
  overview: string[];
  howToPlay: GameHowToStep[];
  rules: GameRuleItem[];
  tips: string[];
  faq: GameFaqItem[];
}

/**
 * Complete game package combining both catalog definition and editorial SEO content.
 */
export interface GamePackage<TState = unknown> {
  definition: GameDefinition<TState>;
  content?: GameContent;
}

export type UnifiedGameModule<TState = unknown> = GamePackage<TState> & {
  id: string;
  definition: GameDefinition<TState>;
  content: GameContent;
  toDefinition(): GameDefinition<TState>;
  toContent(): GameContent;
};
