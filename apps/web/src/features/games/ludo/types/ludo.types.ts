export type LudoColor = 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'cyan';

export type LudoBoardLayoutId = 'classic4' | 'extended6';

export type LudoPlayerType = 'human' | 'bot';

export type LudoPlayerStatus =
  | 'connected'
  | 'disconnected'
  | 'ready'
  | 'playing'
  | 'finished';

export type LudoBotDifficulty = 'easy' | 'normal' | 'hard';

export type LudoBotPersonality = 'aggressive' | 'defensive' | 'rusher' | 'balanced';

export interface LudoBotConfig {
  difficulty: LudoBotDifficulty;
  personality: LudoBotPersonality;
  botDefinitionId?: string;
}

/** Seat-level identity, independent of React or any transport concern. */
export interface LudoPlayer {
  id: string;
  displayName: string;
  type: LudoPlayerType;
  color: LudoColor;
  avatar?: string;
  seatIndex: number;
  status: LudoPlayerStatus;
  ready: boolean;
  botConfig?: LudoBotConfig;
}

export type LudoPieceLocation = 'base' | 'track' | 'home-stretch' | 'home';

export interface LudoPieceState {
  id: string;
  color: LudoColor;
  pieceIndex: 0 | 1 | 2 | 3;
  location: LudoPieceLocation;
  /**
   * 0 = still in base. 1..trackLength = position on the shared track
   * (relative to this color's own entry square). trackLength+1..trackLength+6
   * = home stretch. trackLength+7 = home (finished).
   */
  steps: number;
}

export interface LudoPlayerState {
  playerId: string;
  seatIndex: number;
  color: LudoColor;
  pieces: LudoPieceState[];
  finished: boolean;
  finishRank: number | null;
  consecutiveSixes: number;
}

export interface LudoRuleSettings {
  requireSixToExitBase: boolean;
  requireExactRollToFinish: boolean;
  sixGrantsExtraTurn: boolean;
  maxConsecutiveSixes: number;
  endWhenOnePlayerRemains: boolean;
  boardLayout: LudoBoardLayoutId;
}

export type LudoGameStatus = 'waiting' | 'playing' | 'paused' | 'completed';

export type LudoTurnPhase = 'awaiting-roll' | 'awaiting-move' | 'turn-end';

export interface LudoDiceState {
  value: number | null;
  rollsThisTurn: number;
}

export interface LudoGameState {
  status: LudoGameStatus;
  layout: LudoBoardLayoutId;
  players: LudoPlayerState[];
  currentTurnSeatIndex: number;
  dice: LudoDiceState;
  turnPhase: LudoTurnPhase;
  winnerOrder: string[];
  lastMoveNote: string | null;
  actionLog: LudoAction[];
  settings: LudoRuleSettings;
}

export type LudoAction =
  | { type: 'START_GAME'; playerId: string }
  | { type: 'PAUSE_GAME'; playerId: string }
  | { type: 'RESUME_GAME'; playerId: string }
  | { type: 'END_GAME'; playerId: string }
  | { type: 'ROLL_DICE'; playerId: string; payload: { value: number } }
  | { type: 'MOVE_PIECE'; playerId: string; payload: { pieceId: string } };

export interface LudoStats {
  gamesPlayed: number;
  wins: number;
  bestFinishRank: number | null;
  vsBotEasyWins: number;
  vsBotNormalWins: number;
  vsBotHardWins: number;
  lastPlayedAt: string;
}

export interface LudoPreferences {
  lastSeatCount: number;
  autoFillWithBots: boolean;
}
