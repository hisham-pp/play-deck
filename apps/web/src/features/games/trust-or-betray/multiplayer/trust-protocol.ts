import type {
  ChatMessage,
  PlayerChoice,
  TrustOrBetrayState,
  TrustPlayer,
} from '../types/trust-or-betray.types';

export const TRUST_EVENTS = {
  start: 'TRUST_START',
  choice: 'TRUST_CHOICE',
  vote: 'TRUST_VOTE',
  chat: 'TRUST_CHAT',
  sync: 'TRUST_SYNC',
  restart: 'TRUST_RESTART',
} as const;

export interface TrustStartPayload {
  players: TrustPlayer[];
  totalRounds: number;
  seed: string;
}

export interface TrustChoicePayload {
  playerId: string;
  choice: PlayerChoice;
}

export interface TrustVotePayload {
  voterId: string;
  accusedId: string | null;
}

export interface TrustChatPayload {
  message: ChatMessage;
}

export interface TrustSyncPayload {
  state: TrustOrBetrayState;
}

export function isTrustStartPayload(data: unknown): data is TrustStartPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as TrustStartPayload;
  return Array.isArray(p.players) && typeof p.totalRounds === 'number';
}

export function isTrustChoicePayload(data: unknown): data is TrustChoicePayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as TrustChoicePayload;
  return typeof p.playerId === 'string' && (p.choice === 'cooperate' || p.choice === 'betray');
}

export function isTrustVotePayload(data: unknown): data is TrustVotePayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as TrustVotePayload;
  return typeof p.voterId === 'string' && (p.accusedId === null || typeof p.accusedId === 'string');
}

export function isTrustChatPayload(data: unknown): data is TrustChatPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as TrustChatPayload;
  return Boolean(p.message && typeof p.message.text === 'string');
}
