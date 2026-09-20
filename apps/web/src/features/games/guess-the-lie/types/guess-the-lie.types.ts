export type PromptCategory = 'factual' | 'personal' | 'creative' | 'trivia';

export interface LiePrompt {
  id: string;
  category: PromptCategory;
  question: string;
  exampleTruths: string[];
  exampleLies: string[];
  hint?: string;
}

export type LiePlayerRole = 'truth_teller' | 'liar';

export type BotPersona = 'convincing' | 'blatant' | 'creative' | 'analytical';

export interface LiePlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost?: boolean;
  isBot?: boolean;
  botPersona?: BotPersona;
  role: LiePlayerRole;
  score: number;
  hasSubmitted: boolean;
  votedAnswerId: string | null;
  awardsReceived: string[];
}

export interface SubmittedAnswer {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  isLie: boolean;
  votesReceived: string[]; // voter player IDs
}

export type GuessTheLiePhase =
  | 'lobby'
  | 'briefing'
  | 'answering'
  | 'discussion'
  | 'voting'
  | 'reveal'
  | 'round_summary'
  | 'game_over';

export interface GuessTheLieRoundResult {
  liarId: string;
  liarName: string;
  lieAnswerId: string;
  correctGuesserIds: string[];
  fooledGuesserIds: string[];
  liarFooledBonus: number;
  playerPointsEarned: Record<string, number>;
}

export interface GuessTheLieState {
  phase: GuessTheLiePhase;
  currentRound: number;
  maxRounds: number;
  category: PromptCategory | 'all';
  currentPrompt: LiePrompt;
  liarId: string;
  roundLiarIndices: number[];
  answerDurationSeconds: number;
  discussionDurationSeconds: number;
  phaseStartTime: number;
  phaseDurationSeconds: number;
  players: LiePlayer[];
  answers: SubmittedAnswer[];
  roundResult: GuessTheLieRoundResult | null;
}
