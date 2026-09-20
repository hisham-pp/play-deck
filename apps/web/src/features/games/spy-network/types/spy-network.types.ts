export type SpyNetworkPhase = 'lobby' | 'qa' | 'discussion' | 'voting' | 'reveal' | 'game-over';
export type SpyGuessResult = 'correct' | 'wrong' | null;

export interface QAEntry {
  id: string;
  questionerId: string;
  questionerName: string;
  respondentId: string;
  respondentName: string;
  question: string;
  answer: string;
}

export interface SpyNetworkPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  isSpy: boolean;
  votedForId: string | null;
  score: number;
  isEliminated: boolean;
}

export interface SpyNetworkState {
  phase: SpyNetworkPhase;
  players: SpyNetworkPlayer[];
  location: string | null;
  qaLog: QAEntry[];
  currentQuestionerId: string | null;
  currentRespondentId: string | null;
  roundNumber: number;
  maxRounds: number;
  spyGuessResult: SpyGuessResult;
  spyGuessedLocation: string | null;
  timeRemaining: number;
}
