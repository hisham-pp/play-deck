export type PlayerMark = 'X' | 'O';

export type BoardCell = PlayerMark | null;

export type GameMode = 'single' | 'local2p' | 'multiplayer';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type TicTacToeGameStatus = 'idle' | 'playing' | 'won' | 'draw';

export type WinningLine = [number, number, number];

export interface MatchScores {
  X: number;
  O: number;
  ties: number;
}

export interface MoveRecord {
  index: number;
  player: PlayerMark;
  timestamp: number;
}

export interface TicTacToeState {
  board: BoardCell[];
  turn: PlayerMark;
  startingPlayer: PlayerMark;
  status: TicTacToeGameStatus;
  winner: PlayerMark | null;
  winningLine: WinningLine | null;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  humanPlayerMark: PlayerMark;
  scores: MatchScores;
  round: number;
  moveHistory: MoveRecord[];
  isAiThinking: boolean;
}

export type TicTacToeAction =
  | { type: 'MAKE_MOVE'; index: number; player?: PlayerMark }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_DIFFICULTY'; difficulty: AIDifficulty }
  | { type: 'SET_HUMAN_MARK'; mark: PlayerMark }
  | { type: 'RESET_ROUND' }
  | { type: 'RESET_MATCH' }
  | { type: 'SET_AI_THINKING'; thinking: boolean };

export interface TicTacToeStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  vsAiEasyWins: number;
  vsAiMediumWins: number;
  vsAiHardWins: number;
  lastPlayedAt: string;
}

/**
 * Interface contract for remote multiplayer events,
 * allowing WebRTC/WebSocket transports to feed moves into the engine.
 */
export interface RemoteMoveEvent {
  index: number;
  player: PlayerMark;
  playerId: string;
}
