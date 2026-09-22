import type {
  ChatMessage,
  ContributionCard,
  SaboteurGameState,
  SaboteurPlayer,
} from '../types/secret-saboteur.types';

export const SABOTEUR_EVENTS = {
  start: 'SABOTEUR_START',
  contribute: 'SABOTEUR_CONTRIBUTE',
  vote: 'SABOTEUR_VOTE',
  chat: 'SABOTEUR_CHAT',
  sync: 'SABOTEUR_SYNC',
  restart: 'SABOTEUR_RESTART',
} as const;

// ---------------------------------------------------------------------------
// Payload Types
// ---------------------------------------------------------------------------

export interface SaboteurStartPayload {
  players: SaboteurPlayer[];
  totalRounds: number;
  seed: string;
}

export interface SaboteurContributePayload {
  playerId: string;
  card: ContributionCard;
}

export interface SaboteurVotePayload {
  voterId: string;
  accusedId: string | null;
}

export interface SaboteurChatPayload {
  message: ChatMessage;
}

export interface SaboteurSyncPayload {
  state: SaboteurGameState;
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

export function isSaboteurStartPayload(data: unknown): data is SaboteurStartPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as SaboteurStartPayload;
  return Array.isArray(p.players) && typeof p.totalRounds === 'number';
}

export function isSaboteurContributePayload(data: unknown): data is SaboteurContributePayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as SaboteurContributePayload;
  return typeof p.playerId === 'string' && p.card !== null && typeof p.card === 'object';
}

export function isSaboteurVotePayload(data: unknown): data is SaboteurVotePayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as SaboteurVotePayload;
  return typeof p.voterId === 'string' && (p.accusedId === null || typeof p.accusedId === 'string');
}

export function isSaboteurChatPayload(data: unknown): data is SaboteurChatPayload {
  if (!data || typeof data !== 'object') return false;
  const p = data as SaboteurChatPayload;
  return Boolean(p.message && typeof p.message.text === 'string');
}
