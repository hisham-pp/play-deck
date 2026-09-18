import type { GameDefinition } from '@playdeck/game-types';
import { AVAILABLE_GAMES } from './available-games';
import { COMING_SOON_ARCADE_GAMES_1 } from './coming-soon-arcade-1';
import { COMING_SOON_ARCADE_GAMES_2 } from './coming-soon-arcade-2';
import { COMING_SOON_CASUAL_GAMES_1 } from './coming-soon-casual-1';
import { COMING_SOON_CASUAL_GAMES_2 } from './coming-soon-casual-2';
import { COMING_SOON_PUZZLE_GAMES } from './coming-soon-puzzle';
import { COMING_SOON_STRATEGY_GAMES } from './coming-soon-strategy';

export const GAME_DEFINITIONS: GameDefinition[] = [
  ...AVAILABLE_GAMES,
  ...COMING_SOON_ARCADE_GAMES_1,
  ...COMING_SOON_ARCADE_GAMES_2,
  ...COMING_SOON_PUZZLE_GAMES,
  ...COMING_SOON_STRATEGY_GAMES,
  ...COMING_SOON_CASUAL_GAMES_1,
  ...COMING_SOON_CASUAL_GAMES_2,
];
