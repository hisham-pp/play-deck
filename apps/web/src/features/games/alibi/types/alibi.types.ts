export type AlibiPhase = 'lobby' | 'reading' | 'discussion' | 'voting' | 'reveal' | 'game-over';

export interface StoryVariant {
  baseStory: string;
  playerStory: string;
  inconsistencies: string[];
}

export interface AlibiPlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  isSuspect: boolean;
  storyVariant: StoryVariant | null;
  votedForId: string | null;
  score: number;
}

export interface AlibiState {
  phase: AlibiPhase;
  players: AlibiPlayer[];
  baseScenario: string;
  readingTimeRemaining: number;
  discussionTimeRemaining: number;
  roundNumber: number;
  maxRounds: number;
}
