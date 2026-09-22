export type QuestionCategory =
  'trivia' | 'hypothetical' | 'absurd' | 'cosmological' | 'science' | 'pop_culture';

export type BotHumorStyle = 'absurd' | 'literal' | 'punny' | 'conspiracy';

export interface WrongAnswersQuestion {
  id: string;
  category: QuestionCategory;
  prompt: string;
  subtext?: string;
  botAnswers: Record<BotHumorStyle, string>;
}

export interface WrongAnswersPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  botStyle?: BotHumorStyle;
  score: number;
  streak: number;
  hasSubmitted: boolean;
  votedAnswerId: string | null;
  awardsReceived: string[];
}

export interface SubmittedWrongAnswer {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  voteCount: number;
  voterIds: string[];
}

export type WrongAnswersPhase =
  'lobby' | 'answering' | 'discussion' | 'voting' | 'reveal' | 'game-over';

export interface PlayerRoundScore {
  playerId: string;
  votesEarned: number;
  bonusPoints: number;
  streakBonus: number;
  totalRoundPoints: number;
}

export interface WrongAnswersRoundResult {
  roundNumber: number;
  questionId: string;
  winningAnswerIds: string[];
  mostVotedText: string;
  roundLeaderboard: PlayerRoundScore[];
}

export interface WrongAnswersGameOptions {
  totalRounds: number;
  answerTimeLimit: number;
  votingTimeLimit: number;
}

export interface WrongAnswersState {
  phase: WrongAnswersPhase;
  currentRound: number;
  totalRounds: number;
  currentQuestion: WrongAnswersQuestion;
  answers: SubmittedWrongAnswer[];
  players: WrongAnswersPlayer[];
  timeRemaining: number;
  roundResult: WrongAnswersRoundResult | null;
  history: WrongAnswersRoundResult[];
  options: WrongAnswersGameOptions;
}
