export type BlockColor =
  | '#ef4444' // Red
  | '#3b82f6' // Blue
  | '#10b981' // Green
  | '#f59e0b' // Amber/Yellow
  | '#8b5cf6' // Purple
  | '#ec4899' // Pink
  | '#06b6d4' // Cyan
  | '#f8fafc' // White
  | null; // Empty

export type Grid8x8 = BlockColor[][];

export type BlueprintDifficulty = 'easy' | 'medium' | 'hard';
export type ArchitectDifficulty = BlueprintDifficulty;

export interface Blueprint {
  id: string;
  name: string;
  difficulty: BlueprintDifficulty;
  grid: Grid8x8;
  descriptionHints: string[];
  colorPalette: string[];
}

export type ArchitectRole = 'architect' | 'builder';

export type BotBuildSkill = 'high' | 'medium' | 'chaotic';

export interface ArchitectPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost?: boolean;
  isBot?: boolean;
  botSkill?: BotBuildSkill;
  role: ArchitectRole;
  buildGrid: Grid8x8;
  hasSubmitted: boolean;
  similarityScore: number;
  score: number;
  awardsReceived: string[];
}

export type ArchitectPhase =
  | 'lobby'
  | 'briefing'
  | 'building'
  | 'reveal'
  | 'voting'
  | 'round_summary'
  | 'round_over'
  | 'game_over';

export type ArchitectAwardType = 'closest_match' | 'funniest_disaster';

export interface ArchitectVote {
  voterId: string;
  targetPlayerId?: string;
  targetBuilderId?: string;
  awardType?: ArchitectAwardType;
  award?: ArchitectAwardType;
}

export interface ArchitectAwardResult {
  awardType?: ArchitectAwardType;
  title?: string;
  winnerId?: string;
  winnerName?: string;
  voteCount?: number;
  closestMatchPlayerId?: string;
  funniestDisasterPlayerId?: string;
}

export interface BadArchitectState {
  phase: ArchitectPhase;
  round?: number;
  currentRound: number;
  totalRounds?: number;
  maxRounds: number;
  difficulty: BlueprintDifficulty;
  blueprint: Blueprint;
  currentBlueprint: Blueprint;
  architectId: string;
  roundArchitectIndices: number[];
  buildDurationSeconds: number;
  buildStartTime: number;
  phaseStartTime: number;
  phaseDurationSeconds: number;
  players: ArchitectPlayer[];
  submissions: Record<string, Grid8x8>;
  votes: ArchitectVote[];
  awards: ArchitectAwardResult[];
  awardResult: ArchitectAwardResult | null;
}
