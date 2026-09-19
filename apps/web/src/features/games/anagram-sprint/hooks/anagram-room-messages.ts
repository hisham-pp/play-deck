import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import type { AnagramRules, AnagramSeat, AnagramState } from '../types/anagram-sprint.types';

/**
 * Room protocol. Answers travel as answers — each seat reports the word it
 * typed and the clock it stopped — but the host owns the *boundaries*: it
 * decides when a word is over and broadcasts the settled scoreboard. Seats
 * therefore race live and still converge on one set of scores, without anyone
 * trusting their own clock to agree with seven others.
 */
export const ROOM_EVENTS = {
  start: 'ANAGRAM_START',
  answer: 'ANAGRAM_ANSWER',
  roundEnd: 'ANAGRAM_ROUND_END',
  roundStart: 'ANAGRAM_ROUND_START',
  syncRequest: 'ANAGRAM_SYNC_REQUEST',
  stateSync: 'ANAGRAM_STATE_SYNC',
} as const;

export interface AnagramStartPayload {
  rules: AnagramRules;
  seats: AnagramSeat[];
  seed: number;
}

export interface AnagramRoomHandlers {
  isHost: boolean;
  onStart: (payload: AnagramStartPayload) => void;
  onAnswer: (playerId: string, word: string, elapsedMs: number) => void;
  /** A settled scoreboard from the host, adopted wholesale. */
  onSnapshot: (snapshot: AnagramState) => void;
  onRoundStart: () => void;
  /** Replies to a guest that has asked for the current scoreboard. */
  onSyncRequest: () => void;
}

/**
 * Routes one room message. Kept apart from the hook so the protocol reads as a
 * single table rather than something buried in a subscription.
 */
export function routeRoomMessage(msg: TransportMessage, handlers: AnagramRoomHandlers): void {
  switch (msg.type) {
    case ROOM_EVENTS.start:
      handlers.onStart(msg.payload as AnagramStartPayload);
      return;
    case ROOM_EVENTS.answer: {
      const { playerId, word, elapsedMs } = msg.payload as {
        playerId: string;
        word: string;
        elapsedMs: number;
      };
      handlers.onAnswer(playerId, word, elapsedMs);
      return;
    }
    case ROOM_EVENTS.roundEnd:
    case ROOM_EVENTS.stateSync:
      if (handlers.isHost) return;
      handlers.onSnapshot((msg.payload as { state: AnagramState }).state);
      return;
    case ROOM_EVENTS.roundStart:
      if (handlers.isHost) return;
      handlers.onRoundStart();
      return;
    case ROOM_EVENTS.syncRequest:
      if (handlers.isHost) handlers.onSyncRequest();
      return;
    default:
      return;
  }
}
