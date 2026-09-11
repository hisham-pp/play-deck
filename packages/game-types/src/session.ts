export type SessionStatus = 'waiting' | 'playing' | 'paused' | 'completed' | 'abandoned';

export interface GameSessionPlayer {
  id: string;
  displayName: string;
  avatar?: string;
  isHost?: boolean;
  score?: number;
  rank?: number;
}

export interface GameSession<TState = unknown> {
  id: string;
  gameId: string;
  players: GameSessionPlayer[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
  winnerPlayerId?: string;
  state: TState;
}

export interface GameResult {
  sessionId: string;
  gameId: string;
  winnerPlayerId?: string;
  isDraw?: boolean;
  durationSeconds: number;
  completedAt: string;
  players: {
    id: string;
    displayName: string;
    score?: number;
    rank?: number;
  }[];
}
