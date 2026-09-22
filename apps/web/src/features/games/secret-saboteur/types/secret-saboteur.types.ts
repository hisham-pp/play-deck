export type SaboteurRole = 'worker' | 'saboteur' | 'inspector';

export type RoundPhase =
  | 'lobby'
  | 'role_reveal'
  | 'briefing'
  | 'contributing'
  | 'reveal'
  | 'discussion'
  | 'trial_vote'
  | 'round_summary'
  | 'game_over';

export type CardType = 'repair' | 'boost' | 'patch' | 'fault' | 'overload';

export interface ContributionCard {
  id: string;
  title: string;
  type: CardType;
  powerDelta: number;
  isSabotage: boolean;
  description: string;
  icon: string;
}

export interface SectorMission {
  id: string;
  name: string;
  subsystem: string;
  description: string;
  requiredComponents: string;
}

export interface SaboteurPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  /** Bot behavioural archetype — only present on bot players */
  archetype?: string;
  role: SaboteurRole;
  hand: ContributionCard[];
  selectedCard: ContributionCard | null;
  hasLockedIn: boolean;
  isDetained: boolean;
  suspicionScore: number;
  votesAgainst: number;
}

export interface RoundContribution {
  id: string;
  title: string;
  type: CardType;
  powerDelta: number;
  isSabotage: boolean;
  icon: string;
}

export interface RoundSummary {
  roundNumber: number;
  sector: SectorMission;
  contributions: RoundContribution[];
  netPowerDelta: number;
  meltdownAdded: boolean;
  detainedPlayerId: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SaboteurConfig {
  playerCount: number;
  roundCount: number;
  includeInspector: boolean;
  soundEnabled: boolean;
}

export interface SaboteurGameState {
  phase: RoundPhase;
  currentRound: number;
  totalRounds: number;
  reactorProgress: number;
  meltdownStrikes: number;
  activeSector: SectorMission;
  players: SaboteurPlayer[];
  history: RoundSummary[];
  chat: ChatMessage[];
  winner: 'crew' | 'saboteur' | null;
  winReason: string;
}

export interface SaboteurCareerStats {
  matchesPlayed: number;
  matchesWon: number;
  workerWins: number;
  saboteurWins: number;
  saboteursExposed: number;
  reactorCompletions: number;
  inspectionsConducted: number;
  lastPlayedAt: string;
}
