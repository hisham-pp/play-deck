import type { GameDefinition } from '@playdeck/game-types';
import { AVAILABLE_GAMES_1 } from './available-games-1';
import { AVAILABLE_GAMES_2 } from './available-games-2';

/** Split in two only to keep each file inside the repo's file-size rule. */
export const AVAILABLE_GAMES: GameDefinition[] = [...AVAILABLE_GAMES_1, ...AVAILABLE_GAMES_2];
