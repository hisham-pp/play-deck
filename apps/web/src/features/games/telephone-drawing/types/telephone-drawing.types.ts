export type TelephoneStepType = 'draw' | 'describe';

export type BotDrawingStyle = 'picasso' | 'doodler' | 'stickman' | 'abstract';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: DrawingPoint[];
  color: string;
  size: number;
}

export interface TelephoneChainStep {
  stepIndex: number;
  type: TelephoneStepType;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  drawingData?: string; // Serialized SVG or base64 data URL
  description?: string;
  votesReceived: number;
  voterIds: string[];
}

export interface TelephonePlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  botStyle?: BotDrawingStyle;
  score: number;
  votedStepIndex: number | null;
  awardsReceived: string[];
}

export type TelephonePhase = 'lobby' | 'turn' | 'reveal' | 'voting' | 'game-over';

export interface TelephoneGameOptions {
  drawTimeLimit: number;
  describeTimeLimit: number;
}

export interface TelephoneRoundResult {
  initialPhrase: string;
  finalDescription?: string;
  mostMutatedStepIndex?: number;
  bestArtistId?: string;
}

export interface TelephoneState {
  phase: TelephonePhase;
  initialPhrase: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: TelephoneChainStep[];
  players: TelephonePlayer[];
  activePlayerId: string;
  timeRemaining: number;
  revealIndex: number;
  options: TelephoneGameOptions;
  roundResult: TelephoneRoundResult | null;
}
