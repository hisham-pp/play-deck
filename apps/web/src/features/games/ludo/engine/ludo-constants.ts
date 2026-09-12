import type { LudoRuleSettings } from '../types/ludo.types';

export const PIECES_PER_PLAYER = 4;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const DEFAULT_RULE_SETTINGS: LudoRuleSettings = {
  requireSixToExitBase: true,
  requireExactRollToFinish: true,
  sixGrantsExtraTurn: true,
  maxConsecutiveSixes: 3,
  endWhenOnePlayerRemains: true,
  boardLayout: 'classic4',
};

export const STATUS_WAITING = 'waiting' as const;
export const STATUS_PLAYING = 'playing' as const;
export const STATUS_PAUSED = 'paused' as const;
export const STATUS_COMPLETED = 'completed' as const;

export const PHASE_AWAITING_ROLL = 'awaiting-roll' as const;
export const PHASE_AWAITING_MOVE = 'awaiting-move' as const;
export const PHASE_TURN_END = 'turn-end' as const;
