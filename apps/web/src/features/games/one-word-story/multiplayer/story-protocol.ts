import type {
  OneWordStoryState,
  StoryMode,
  StoryPlayer,
  StoryPrompt,
  StoryVote,
} from '../types/one-word-story.types';

export const STORY_EVENTS = {
  start: 'STORY_START',
  addWord: 'STORY_ADD_WORD',
  sync: 'STORY_SYNC',
  castVote: 'STORY_CAST_VOTE',
  restart: 'STORY_RESTART',
} as const;

export interface StoryStartPayload {
  mode: StoryMode;
  prompt: StoryPrompt;
  players: StoryPlayer[];
  maxWords: number;
}

export interface StoryAddWordPayload {
  playerId: string;
  word: string;
}

export interface StorySyncPayload {
  state: OneWordStoryState;
}

export interface StoryCastVotePayload {
  vote: StoryVote;
}

const T_OBJ = 'object';
const T_STR = 'string';

export function isStoryStartPayload(data: unknown): data is StoryStartPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as StoryStartPayload;
  return Boolean(p.prompt) && Array.isArray(p.players);
}

export function isStoryAddWordPayload(data: unknown): data is StoryAddWordPayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as StoryAddWordPayload;
  return typeof p.playerId === T_STR && typeof p.word === T_STR;
}

export function isStoryCastVotePayload(data: unknown): data is StoryCastVotePayload {
  if (!data || typeof data !== T_OBJ) return false;
  const p = data as StoryCastVotePayload;
  return Boolean(p.vote) && typeof p.vote.wordId === T_STR && typeof p.vote.awardType === T_STR;
}
