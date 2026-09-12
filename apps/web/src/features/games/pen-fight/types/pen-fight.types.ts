export type PenFightPlayerId = 'p1' | 'p2';

export type PenFightMode = 'ai' | 'local2p' | 'online';

export type PenSpeedMode = 'normal' | 'slow';

export type AIDifficulty = 'rookie' | 'pro' | 'legend';

export type PenFightPhase = 'aiming' | 'flicking' | 'settling' | 'round-over' | 'match-over';

export type PenFightOutcome = PenFightPlayerId | 'draw' | null;

export const PEN_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
  '#14b8a6',
] as const;
export type PenColor = (typeof PEN_COLORS)[number];

export interface PenFightPlayerInfo {
  id: PenFightPlayerId;
  displayName: string;
  color: PenColor;
  isAI: boolean;
  roundWins: number;
}

export interface PenFightState {
  mode: PenFightMode;
  speedMode: PenSpeedMode;
  difficulty: AIDifficulty;
  players: Record<PenFightPlayerId, PenFightPlayerInfo>;
  activePlayer: PenFightPlayerId;
  startingPlayer: PenFightPlayerId;
  round: number;
  maxRounds: number;
  phase: PenFightPhase;
  roundWinner: PenFightOutcome;
  matchWinner: PenFightOutcome;
  flickCount: number;
  totalFlicks: number;
}

export type PenFightAction =
  | { type: 'SET_MODE'; mode: PenFightMode }
  | { type: 'SET_SPEED_MODE'; speedMode: PenSpeedMode }
  | { type: 'SET_DIFFICULTY'; difficulty: AIDifficulty }
  | { type: 'SET_PLAYER_NAME'; playerId: PenFightPlayerId; name: string }
  | { type: 'SET_PLAYER_COLOR'; playerId: PenFightPlayerId; color: PenColor }
  | { type: 'START_MATCH' }
  | { type: 'FLICK_TAKEN' }
  | { type: 'BEGIN_SETTLING' }
  | { type: 'ROUND_RESOLVED'; winner: PenFightOutcome }
  | { type: 'NEXT_ROUND' }
  | { type: 'REQUEST_REMATCH' };

export interface PenFightStats {
  matchesPlayed: number;
  matchWins: number;
  matchLosses: number;
  roundsWon: number;
  roundsLost: number;
  totalFlicks: number;
  bestFlickStreak: number;
  lastPlayedAt: string;
}

export interface FlickImpulse {
  x: number;
  y: number;
  z: number;
}

export interface FlickInput {
  direction: FlickImpulse;
  power: number;
}
