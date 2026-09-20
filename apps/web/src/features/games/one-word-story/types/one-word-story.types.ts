export type StoryMode = 'classic' | 'speed' | 'challenge';

export type StoryGenre = 'sci-fi' | 'fantasy' | 'horror' | 'comedy' | 'mystery' | 'cyberpunk';

export type BotPersonality = 'poet' | 'chaotic' | 'dramatic' | 'philosopher';

export type StoryPhase = 'lobby' | 'storytelling' | 'readback' | 'voting' | 'game_over';

export type StoryAwardType = 'funniest' | 'best_twist' | 'wildest';

export interface StoryWord {
  id: string;
  word: string;
  authorId: string;
  authorName: string;
  timestamp: number;
  turnIndex: number;
}

export interface StoryPrompt {
  id: string;
  title: string;
  genre: StoryGenre;
  starterPhrase: string;
  challengeWords?: string[];
}

export interface StoryPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost?: boolean;
  isBot?: boolean;
  botPersonality?: BotPersonality;
  score: number;
  wordsContributed: number;
  awardsReceived: string[];
}

export interface StoryVote {
  voterId: string;
  wordId: string;
  awardType: StoryAwardType;
}

export interface StoryAwardResult {
  awardType: StoryAwardType;
  title: string;
  wordId: string;
  word: string;
  authorId: string;
  authorName: string;
  voteCount: number;
}

export interface OneWordStoryState {
  phase: StoryPhase;
  mode: StoryMode;
  selectedPrompt: StoryPrompt;
  words: StoryWord[];
  activePlayerId: string;
  turnStartTime: number;
  turnDurationSeconds: number;
  maxWords: number;
  turnOrder: string[];
  turnIndex: number;
  votes: StoryVote[];
  awards: StoryAwardResult[];
  winnerId?: string;
}
