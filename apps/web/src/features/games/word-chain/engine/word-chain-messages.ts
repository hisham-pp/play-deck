import type { WordChainCategory, WordChainRejection } from '../types/word-chain.types';
import { CATEGORY_LABELS, REJECTION_MESSAGES } from './word-chain-constants';

export interface RejectionContext {
  readonly minLength: number;
  readonly prefix: string;
  readonly category: WordChainCategory | null;
}

export function rejectionMessage(reason: WordChainRejection, context: RejectionContext): string {
  const template = REJECTION_MESSAGES[reason] ?? 'That word cannot be played.';
  return template
    .replace('{min}', String(context.minLength))
    .replace('{prefix}', context.prefix.toUpperCase())
    .replace('{category}', context.category ? CATEGORY_LABELS[context.category] : 'chosen');
}

export function turnPrompt(playerName: string, prefix: string, minLength: number): string {
  const start = prefix ? `a word starting with "${prefix.toUpperCase()}"` : 'any word';
  return `${playerName}, play ${start} — at least ${minLength} letters.`;
}

export function acceptedMessage(playerName: string, word: string, points: number): string {
  return `${playerName} played "${word}" for ${points} points.`;
}

export function lifeLostMessage(playerName: string, lives: number): string {
  if (lives <= 0) return `Time up — ${playerName} is out.`;
  const plural = lives === 1 ? 'life' : 'lives';
  return `Time up — ${playerName} loses a life and has ${lives} ${plural} left.`;
}
