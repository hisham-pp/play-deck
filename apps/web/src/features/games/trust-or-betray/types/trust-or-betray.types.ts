export type PlayerChoice = 'cooperate' | 'betray';

export type RoundPhase =
  | 'lobby'
  | 'briefing'
  | 'choosing'
  | 'reveal'
  | 'discussion'
  | 'trial_vote'
  | 'round_summary'
  | 'match_over';

export type TrustLevel = 'devoted' | 'loyal' | 'neutral' | 'shaky' | 'traitor';

export type BotArchetype = 'saint' | 'opportunist' | 'grudgebearer' | 'wildcard';

export interface MissionObjective {
  id: string;
  name: string;
  category: string;
  description: string;
  basePot: number;
  bonusMultiplier: number;
}

export interface TrustPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  archetype?: BotArchetype;
  score: number;
  currentChoice: PlayerChoice | null;
  hasLockedIn: boolean;
  trustRating: number; // 0 to 100
  trustLevel: TrustLevel;
  cooperationCount: number;
  betrayalCount: number;
  isExiled: boolean;
  exileRoundsRemaining: number;
  votesAgainst: number;
}

export type RoundOutcome = 'all_cooperate' | 'solo_betray' | 'failed_betray' | 'mutual_ruin';

export interface RoundResult {
  roundNumber: number;
  mission: MissionObjective;
  pot: number;
  outcome: RoundOutcome;
  choices: Record<string, PlayerChoice>;
  scoreDeltas: Record<string, number>;
  exiledPlayerId?: string | null;
}

export interface TrialVote {
  voterId: string;
  accusedId: string | null; // null = skip/abstain
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface TrustOrBetrayConfig {
  playerCount: number;
  roundCount: number;
  choiceDuration: number;
  discussionDuration: number;
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface TrustOrBetrayState {
  phase: RoundPhase;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  activeMission: MissionObjective;
  groupPot: number;
  cooperationStreak: number;
  players: TrustPlayer[];
  history: RoundResult[];
  chat: ChatMessage[];
  currentVotes: Record<string, string | null>;
  winnerId?: string;
  winnerName?: string;
}

export interface TrustOrBetrayCareerStats {
  matchesPlayed: number;
  matchesWon: number;
  highScore: number;
  totalCooperations: number;
  totalBetrayals: number;
  soloSabotages: number;
  timesExiled: number;
  successfulAlliances: number;
  lastPlayedAt: string;
}
