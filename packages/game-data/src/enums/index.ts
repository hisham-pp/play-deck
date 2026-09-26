import { GameCategories, type GameCategory } from './category.enum';
import { GameControlKeys, type GameControlKey } from './controls.enum';
import { GameReleaseDates, type GameReleaseDate } from './release-date.enum';
import { GameStatuses, type GameStatus } from './status.enum';
import { GameTags, type GameTag } from './tags.enum';

export * from './category.enum';
export * from './controls.enum';
export * from './release-date.enum';
export * from './status.enum';
export * from './tags.enum';

// Shorthand standalone aliases
export const Categories = GameCategories;
export const Tags = GameTags;
export const Statuses = GameStatuses;
export const ReleaseDates = GameReleaseDates;
export const Dates = GameReleaseDates;
export const ControlKeys = GameControlKeys;
export const Controls = GameControlKeys;

export type {
    GameCategory as Category,
    GameTag as Tag,
    GameStatus as Status,
    GameReleaseDate as ReleaseDate,
    GameControlKey as ControlKey,
};

// Aggregated namespace bundle
export const Enums = {
    Categories: GameCategories,
    Tags: GameTags,
    Statuses: GameStatuses,
    ReleaseDates: GameReleaseDates,
    Dates: GameReleaseDates,
    ControlKeys: GameControlKeys,
    Controls: GameControlKeys,
} as const;
