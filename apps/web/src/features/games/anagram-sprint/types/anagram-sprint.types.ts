export type AnagramMode = 'solo' | 'classic' | 'survival' | 'blitz' | 'team';

export type AnagramDifficulty = 'easy' | 'medium' | 'hard';

/**
 * `common` and `advanced` grade the vocabulary; the rest are themed banks a
 * table can lock the match to.
 */
export type AnagramCategory =
  'common' | 'advanced' | 'animals' | 'food' | 'science' | 'travel' | 'sports';

export type AnagramStatus = 'setup' | 'countdown' | 'playing' | 'round-summary' | 'finished';

export type AnagramTeam = 'a' | 'b';

export interface AnagramWord {
  word: string;
  category: AnagramCategory;
  difficulty: AnagramDifficulty;
  /** Short clue shown when the hint is revealed. */
  hint: string;
}

export interface AnagramPlayer {
  id: string;
  name: string;
  avatar: string;
  team: AnagramTeam;
  score: number;
  /** Consecutive solved rounds, reset by a miss. */
  streak: number;
  bestStreak: number;
  solved: number;
  missed: number;
  /** Survival only — a missed word costs one. */
  lives: number;
  eliminated: boolean;
  /** Fastest correct answer of the match, in milliseconds. */
  fastestMs: number | null;
}

export interface AnagramRoundPlan {
  /** Index into the match, 0-based. */
  index: number;
  entry: AnagramWord;
  /** Letters as everyone first sees them. Deterministic from the match seed. */
  scrambled: string;
  seconds: number;
}

export interface AnagramRoundResult {
  playerId: string;
  /** The word actually typed — may be a valid alternative to the target. */
  word: string;
  elapsedMs: number;
  /** 1 for the first player home, 2 for the next, and so on. */
  placement: number;
  points: number;
  speedBonus: number;
  streakBonus: number;
}

export interface AnagramRoundRecap {
  index: number;
  answer: string;
  difficulty: AnagramDifficulty;
  category: AnagramCategory;
  results: AnagramRoundResult[];
  /** Seats that ran out of clock or attempts. */
  missedIds: string[];
}

export type AnagramRejection = 'wrong-letters' | 'not-a-solution' | 'no-attempts-left' | 'too-late';

export interface AnagramRules {
  mode: AnagramMode;
  /** `null` mixes every bank together. */
  category: AnagramCategory | null;
  totalRounds: number;
  /** Clock for the opening round; later rounds tighten with difficulty. */
  startingSeconds: number;
  /** Wrong guesses allowed per word. Running out ends that word for the seat. */
  maxAttempts: number;
  lives: number;
  /** Reveals the category, length and first letter of the answer. */
  hintsEnabled: boolean;
}

export interface AnagramSeat {
  id: string;
  name: string;
  avatar: string;
  team: AnagramTeam;
}

export interface AnagramState {
  status: AnagramStatus;
  rules: AnagramRules;
  seed: number;
  players: AnagramPlayer[];
  plan: AnagramRoundPlan[];
  roundIndex: number;
  roundStartedAt: number;
  /** Wrong guesses already spent this round, by player id. */
  attemptsUsed: Record<string, number>;
  results: AnagramRoundResult[];
  history: AnagramRoundRecap[];
  lastRejection: AnagramRejection | null;
  message: string;
  winnerIds: string[];
  winningTeam: AnagramTeam | null;
}

export interface AnagramStats {
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  wordsSolved: number;
  longestStreak: number;
  /** Fastest correct answer ever recorded, in milliseconds. */
  fastestMs: number | null;
  lastMode: AnagramMode | null;
  lastPlayedAt: string;
}
