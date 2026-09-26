import type {
  GameCategory,
  GameContent,
  GameControlDefinition,
  GameControlItem,
  GameDefinition,
  GameDifficultyPreset,
  PlayerCapacity,
  StickmanGameSubtype,
} from '@playdeck/game-types';
import { type GameStatus, GameStatuses } from '../enums/status.enum';
import { formatGameName } from '../helpers/name.utils';
import { resolveGameAssets } from './asset-resolver';
import { BADGE_COMING_SOON, BADGE_READY_TO_PLAY } from './constants';
import type {
  GameEntryOptions,
  GamePackage,
  UnifiedGameModule,
  UnifiedGameModuleOptions,
} from './types';

export type { GameEntryOptions, GamePackage, UnifiedGameModule, UnifiedGameModuleOptions };

/**
 * Base game model class standardizing metadata, asset resolution, and definition contracts.
 * Extend this class or use `defineGame` / `defineGameModule` to create future game modules with zero boilerplate.
 */
export class BaseGameEntry<TState = unknown> {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly category: GameCategory;
  readonly players: PlayerCapacity;
  readonly status: GameStatus;
  readonly thumbnailUrl: string;
  readonly bannerUrl: string;
  readonly tags: string[];
  readonly featured: boolean;
  readonly badge: string;
  readonly releaseDate?: string;
  readonly controls?: GameControlDefinition[];
  readonly difficultyPresets?: GameDifficultyPreset[];
  readonly subtype?: StickmanGameSubtype | string;
  readonly createGame?: () => TState;
  readonly content?: GameContent;

  constructor(options: GameEntryOptions<TState>) {
    this.id = options.id.trim().toLowerCase();
    this.name = options.name?.trim() || formatGameName(this.id);
    this.slug = (options.slug ?? options.id).trim().toLowerCase();
    this.description = options.description;
    this.category = options.category;
    this.players = options.players;
    this.status = options.status ?? GameStatuses.AVAILABLE;

    const assets = resolveGameAssets(this.id, {
      thumbnailUrl: options.thumbnailUrl,
      bannerUrl: options.bannerUrl,
      iconExt: options.iconExt,
      bannerExt: options.bannerExt,
    });
    this.thumbnailUrl = assets.thumbnailUrl;
    this.bannerUrl = assets.bannerUrl;

    this.tags = options.tags ?? [];
    this.featured = options.featured ?? true;
    this.badge =
      options.badge ??
      (this.status === GameStatuses.AVAILABLE ? BADGE_READY_TO_PLAY : BADGE_COMING_SOON);
    this.releaseDate = options.releaseDate;
    this.controls = options.controls;
    this.difficultyPresets = options.difficultyPresets;
    this.subtype = options.subtype;
    this.createGame = options.createGame;
    this.content = options.content;
  }

  toDefinition(): GameDefinition<TState> {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      category: this.category,
      players: this.players,
      status: this.status,
      thumbnailUrl: this.thumbnailUrl,
      bannerUrl: this.bannerUrl,
      tags: this.tags,
      featured: this.featured,
      releaseDate: this.releaseDate,
      badge: this.badge,
      controls: this.controls,
      difficultyPresets: this.difficultyPresets,
      subtype: this.subtype,
      createGame: this.createGame,
    };
  }

  isAvailable(): boolean {
    return this.status === GameStatuses.AVAILABLE;
  }

  getContent(): GameContent | undefined {
    return this.content;
  }
}

export function defineGame<TState = unknown>(
  options: GameEntryOptions<TState>,
): GameDefinition<TState> {
  return new BaseGameEntry<TState>(options).toDefinition();
}

export function defineGamePackage<TState = unknown>(
  options: GameEntryOptions<TState>,
): GamePackage<TState> {
  const entry = new BaseGameEntry<TState>(options);
  const def = entry.toDefinition();
  const content = entry.getContent() ?? {
    id: def.id,
    name: def.name,
    category: def.category,
    players: def.players,
    status: def.status,
    description: def.description,
    releaseDate: def.releaseDate,
    tags: def.tags,
    featured: def.featured,
    badge: def.badge,
    seo: {
      title: `${def.name} — Free Browser Play`,
      description: def.description,
      keywords: def.tags,
    },
    tagline: def.description,
    overview: [def.description],
    howToPlay: [],
    rules: [],
    controls: (def.controls ?? []).map((c) => ({
      key: c.key,
      action: c.action,
    })),
    tips: [],
    faq: [],
  };
  return {
    definition: def,
    content,
  };
}

export function defineGameModule<TState = unknown>(
  options: UnifiedGameModuleOptions<TState>,
): UnifiedGameModule<TState> {
  const defControls: GameControlDefinition[] | undefined = options.controls
    ? options.controls.map((c) => ({
        key: c.key,
        action: c.action,
      }))
    : undefined;

  const contentControls: GameControlItem[] = options.controls
    ? options.controls.map((c) => ({
        key: c.key,
        action: c.action,
      }))
    : [];

  const entry = new BaseGameEntry<TState>({
    id: options.id,
    name: options.name,
    slug: options.slug,
    description: options.description,
    category: options.category,
    players: options.players,
    status: options.status ?? GameStatuses.AVAILABLE,
    releaseDate: options.releaseDate,
    tags: options.tags,
    featured: options.featured ?? true,
    badge: options.badge,
    thumbnailUrl: options.thumbnailUrl,
    bannerUrl: options.bannerUrl,
    iconExt: options.iconExt,
    bannerExt: options.bannerExt,
    controls: defControls,
    difficultyPresets: options.difficultyPresets,
    subtype: options.subtype,
    createGame: options.createGame,
  });

  const definition = entry.toDefinition();

  const content: GameContent = {
    id: definition.id,
    name: definition.name,
    category: definition.category,
    players: definition.players,
    status: definition.status,
    description: definition.description,
    releaseDate: definition.releaseDate,
    tags: definition.tags,
    featured: definition.featured,
    badge: definition.badge,
    seo: options.seo,
    tagline: options.tagline,
    overview: options.overview,
    howToPlay: options.howToPlay,
    rules: options.rules,
    controls: contentControls,
    tips: options.tips,
    faq: options.faq,
  };

  return {
    id: definition.id,
    definition,
    content,
    toDefinition: () => definition,
    toContent: () => content,
  };
}
