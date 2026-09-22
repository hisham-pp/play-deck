export type IdentityCategory =
  | 'all'
  | 'famous-people'
  | 'animals'
  | 'movie-characters'
  | 'professions'
  | 'objects'
  | 'historical-figures';

export interface IdentityItem {
  id: string;
  name: string;
  category: IdentityCategory;
  icon: string;
  description: string;
  isAlive: boolean;
  isHuman: boolean;
  isFictional: boolean;
  isObject: boolean;
  canFly?: boolean;
}

export interface WhoAmIPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  identity: IdentityItem;
  isSolved: boolean;
  solvedAtStep: number | null;
  score: number;
  questionsAsked: number;
  wrongGuesses: number;
  awardsReceived: string[];
}

export type VoteAnswer = 'yes' | 'no' | 'maybe';

export interface QALogEntry {
  id: string;
  roundNumber: number;
  questionerId: string;
  questionerName: string;
  questionText: string;
  yesVotes: string[];
  noVotes: string[];
  maybeVotes: string[];
  finalGuess?: string;
  wasCorrect?: boolean;
}

export type WhoAmIPhase =
  'lobby' | 'questioning' | 'answering' | 'guessing' | 'reveal' | 'game-over';

export interface WhoAmIState {
  phase: WhoAmIPhase;
  category: IdentityCategory;
  currentTurnPlayerId: string;
  turnIndex: number;
  roundNumber: number;
  maxRounds: number;
  players: WhoAmIPlayer[];
  currentQuestion: string | null;
  qaLog: QALogEntry[];
  timeRemaining: number;
  isLastGuessCorrect: boolean | null;
}
