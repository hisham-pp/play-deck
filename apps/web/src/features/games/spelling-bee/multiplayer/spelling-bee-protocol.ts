import type {
  FoundWord,
  HoneycombPuzzle,
  SpellingBeeMode,
  SpellingBeePlayer,
} from '../types/spelling-bee.types';

export const SPELLING_BEE_MESSAGE_TYPES = {
  START_GAME: 'spelling_bee_start_game',
  SUBMIT_WORD: 'spelling_bee_submit_word',
  SYNC_SCORE: 'spelling_bee_sync_score',
  ROUND_END: 'spelling_bee_round_end',
} as const;

export interface SbStartGamePayload {
  puzzle: HoneycombPuzzle;
  mode: SpellingBeeMode;
  duration: number;
}

export interface SbSubmitWordPayload {
  playerId: string;
  foundWord: FoundWord;
}

export interface SbSyncScorePayload {
  players: SpellingBeePlayer[];
}

export interface SbRoundEndPayload {
  finalPlayers: SpellingBeePlayer[];
}
