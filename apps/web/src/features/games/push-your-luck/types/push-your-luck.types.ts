/** What a single card pulled from the risk deck does to the turn. */
export type DrawKind = 'points' | 'multiplier' | 'steal' | 'insurance' | 'bust';

export interface DrawCard {
  kind: DrawKind;
  /** Points gained, multiplier factor, or points stolen — read per `kind`. */
  value: number;
  label: string;
  detail: string;
}

export type SeatKind = 'human' | 'bot';

/** How much risk a bot seat is willing to carry before it banks. */
export type BotNerve = 'cautious' | 'balanced' | 'reckless';

export type MatchPhase = 'lobby' | 'playing' | 'game-over';

export type TurnOutcome = 'safe' | 'saved' | 'bust' | 'banked';

export interface PushYourLuckSeat {
  id: string;
  name: string;
  avatar: string;
  kind: SeatKind;
  nerve: BotNerve;
  /** Points that are safe — only a steal can take these away. */
  banked: number;
  /** Insurance tokens; each one absorbs a single bust. */
  insurance: number;
  busts: number;
  bestRound: number;
}

export interface TurnEvent {
  card: DrawCard;
  potAfter: number;
  outcome: TurnOutcome;
}

export interface PushYourLuckTurn {
  /** Points accumulated this turn and still at risk. */
  pot: number;
  draws: number;
  events: TurnEvent[];
  savedByInsurance: boolean;
  /** Set once the turn is over, so the UI can hold on the result for a beat. */
  resolved: 'bust' | 'banked' | null;
}

export interface PushYourLuckState {
  phase: MatchPhase;
  seats: PushYourLuckSeat[];
  activeSeat: number;
  targetScore: number;
  round: number;
  turn: PushYourLuckTurn;
  /** Probability that the next push busts, 0-1. */
  bustChance: number;
  lastOutcome: TurnOutcome | null;
  lastCard: DrawCard | null;
  /** Seat id a steal card last took points from. */
  stolenFrom: string | null;
  winnerId: string | null;
  /** Deterministic PRNG cursor, so a match can be replayed in tests. */
  seed: number;
  announcement: string;
}

export type PushYourLuckAction =
  | { type: 'CONFIGURE'; seats: PushYourLuckSeat[]; targetScore: number; seed?: number }
  | { type: 'PUSH' }
  | { type: 'BANK' }
  | { type: 'END_TURN' }
  | { type: 'RESET_MATCH' };

export interface PushYourLuckStats {
  matchesPlayed: number;
  wins: number;
  totalBanked: number;
  totalBusts: number;
  biggestBank: number;
  longestPushStreak: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string;
}
