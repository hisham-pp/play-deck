export type ImposterBuilderPhase =
  'lobby' | 'building' | 'reveal' | 'discussion' | 'voting' | 'game-over';

export interface BuildInstruction {
  id: string;
  normalVersion: string;
  imposterVersion: string;
  category: string;
}

export interface BuildCell {
  row: number;
  col: number;
  color: string;
  filled: boolean;
}

export interface ImposterBuilderPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  isImposter: boolean;
  grid: BuildCell[][];
  votedForId: string | null;
  score: number;
}

export interface ImposterBuilderState {
  phase: ImposterBuilderPhase;
  players: ImposterBuilderPlayer[];
  instruction: BuildInstruction | null;
  buildTimeRemaining: number;
  discussionTimeRemaining: number;
  roundNumber: number;
  maxRounds: number;
}
