export type SnakeLadderColor = 'red' | 'green' | 'yellow' | 'blue';

export type SnakeLadderPlayerType = 'human' | 'bot';

export type SnakeLadderPlayerStatus = 'connected' | 'disconnected' | 'playing' | 'finished';

/** Seat-level identity, independent of React or any transport concern. */
export interface SnakeLadderPlayer {
  id: string;
  displayName: string;
  type: SnakeLadderPlayerType;
  color: SnakeLadderColor;
  avatar?: string;
  seatIndex: number;
  status: SnakeLadderPlayerStatus;
  ready: boolean;
}

export interface SnakeLadderPlayerState {
  playerId: string;
  seatIndex: number;
  color: SnakeLadderColor;
  /** 0 = off-board start pocket, 1..100 = square number. */
  position: number;
  finished: boolean;
  finishRank: number | null;
  consecutiveSixes: number;
}

export type SnakeLadderJumpKind = 'snake' | 'ladder';

export interface SnakeLadderJump {
  kind: SnakeLadderJumpKind;
  from: number;
  to: number;
}

/**
 * A fully resolved turn. The engine settles the whole move at once so a server
 * can stay authoritative; the board replays `from -> walkTo -> to` purely as
 * presentation.
 */
export interface SnakeLadderMove {
  /** Monotonic, so the board can tell a repeated identical move from a re-render. */
  moveId: number;
  playerId: string;
  seatIndex: number;
  dice: number;
  from: number;
  /** Square reached by walking the dice out, before any snake or ladder. */
  walkTo: number;
  /** Final square once a snake or ladder has been applied. */
  to: number;
  jump: SnakeLadderJump | null;
  /** True when the exact-finish rule left the token where it was. */
  overshot: boolean;
  /** True when the six-to-start rule kept the token in its pocket. */
  blockedAtStart: boolean;
  won: boolean;
}

export interface SnakeLadderRuleSettings {
  /** Classic variant: a token only leaves the start pocket on a six. */
  requireSixToStart: boolean;
  /** A roll past 100 forfeits the move instead of bouncing back. */
  requireExactRollToFinish: boolean;
  sixGrantsExtraTurn: boolean;
  /** Rolling this many sixes in a row burns the turn. */
  maxConsecutiveSixes: number;
  /** End the match at the first finisher instead of racing out the places. */
  endOnFirstFinisher: boolean;
}

export type SnakeLadderGameStatus = 'waiting' | 'playing' | 'paused' | 'completed';

export interface SnakeLadderDiceState {
  value: number | null;
  rollsThisTurn: number;
}

export interface SnakeLadderGameState {
  status: SnakeLadderGameStatus;
  players: SnakeLadderPlayerState[];
  currentTurnSeatIndex: number;
  dice: SnakeLadderDiceState;
  lastMove: SnakeLadderMove | null;
  lastMoveNote: string | null;
  winnerOrder: string[];
  moveCount: number;
  settings: SnakeLadderRuleSettings;
}

export type SnakeLadderAction =
  | { type: 'START_GAME'; playerId: string }
  | { type: 'PAUSE_GAME'; playerId: string }
  | { type: 'RESUME_GAME'; playerId: string }
  | { type: 'END_GAME'; playerId: string }
  | { type: 'ROLL_DICE'; playerId: string; payload: { value: number } };

export interface SnakeLadderStats {
  gamesPlayed: number;
  wins: number;
  bestFinishRank: number | null;
  longestClimb: number;
  worstSlide: number;
  lastPlayedAt: string;
}

export interface SnakeLadderPreferences {
  lastSeatCount: number;
  lastBotCount: number;
}
