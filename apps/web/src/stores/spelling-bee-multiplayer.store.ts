import { create } from 'zustand';

import { getDailyPuzzle, getRandomPuzzle } from '@/features/games/spelling-bee/engine/puzzle-bank';
import {
  calculateRank,
  shuffleOuterLetters,
  validateSubmission,
} from '@/features/games/spelling-bee/engine/spelling-bee-engine';
import { spellingBeeSoundService } from '@/features/games/spelling-bee/services/spelling-bee-sound.service';
import type {
  FoundWord,
  HoneycombPuzzle,
  SpellingBeeMode,
  SpellingBeePlayer,
  SpellingBeeRank,
} from '@/features/games/spelling-bee/types/spelling-bee.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const SPELLING_BEE_GAME_ID = 'spelling-bee';
export const SPELLING_BEE_CHANNEL = 'spelling-bee';
const MAX_PLAYERS = 6;
const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const STATUS_PLAYING = 'playing';
const STATUS_GAME_OVER = 'game-over';
const DEFAULT_AVATAR = '🐝';
const DEFAULT_RANK: SpellingBeeRank = 'Beginner';

const BOT_TEMPLATES = [
  { name: 'Wordy Bee', avatar: '🐝' },
  { name: 'Spell Caster', avatar: '🧙' },
  { name: 'Hive Master', avatar: '🍯' },
  { name: 'Buzz Finder', avatar: '⚡' },
];

export interface SpellingBeeRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface SpellingBeeMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'game-over' | 'error';
  mode: SpellingBeeMode;
  puzzle: HoneycombPuzzle;
  outerLetters: string[];
  players: SpellingBeePlayer[];
  foundWords: FoundWord[];
  score: number;
  rank: SpellingBeeRank;
  currentInput: string;
  feedbackMessage: string | null;
  feedbackType: 'valid' | 'invalid' | 'pangram' | 'already-found' | null;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: SpellingBeeRoomIdentity, mode?: SpellingBeeMode) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: SpellingBeeRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setMode: (mode: SpellingBeeMode) => void;
  setPuzzle: (puzzle: HoneycombPuzzle) => void;
  shuffleOuter: () => void;
  setInput: (text: string) => void;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitWord: () => void;
  startGame: () => void;
  endGame: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  isHost: () => boolean;
}

function makePlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  isHost = false,
): SpellingBeePlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || DEFAULT_AVATAR,
    isHost,
    isBot,
    score: 0,
    foundWords: [],
    rank: DEFAULT_RANK,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: SpellingBeePlayer[],
  hostId: string | null,
): SpellingBeePlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const presentHumans = presences.map((pres) => {
    const prev = existing.find((p) => p.id === pres.playerId);
    return {
      id: pres.playerId,
      displayName: pres.displayName || 'Player',
      avatar: pres.avatar || DEFAULT_AVATAR,
      isHost: pres.playerId === hostId,
      isBot: false,
      score: prev?.score ?? 0,
      foundWords: prev?.foundWords ?? [],
      rank: prev?.rank ?? DEFAULT_RANK,
    };
  });
  return [...presentHumans, ...bots];
}

const initialPuzzle = getDailyPuzzle();

export const useSpellingBeeMultiplayerStore = create<SpellingBeeMultiplayerState>((set, get) => ({
  roomCode: null,
  hostId: null,
  localPlayerId: null,
  status: STATUS_IDLE,
  mode: 'solo',
  puzzle: initialPuzzle,
  outerLetters: initialPuzzle.outerLetters,
  players: [],
  foundWords: [],
  score: 0,
  rank: DEFAULT_RANK,
  currentInput: '',
  feedbackMessage: null,
  feedbackType: null,
  transport: null,
  error: null,

  isHost: () => {
    const { localPlayerId, hostId } = get();
    return Boolean(localPlayerId && hostId && localPlayerId === hostId);
  },

  setMode: (mode) => {
    const puzzle = mode === 'daily' ? getDailyPuzzle() : getRandomPuzzle();
    set({
      mode,
      puzzle,
      outerLetters: puzzle.outerLetters,
      foundWords: [],
      score: 0,
      rank: DEFAULT_RANK,
    });
  },

  setPuzzle: (puzzle) =>
    set({
      puzzle,
      outerLetters: puzzle.outerLetters,
      foundWords: [],
      score: 0,
      rank: DEFAULT_RANK,
    }),

  shuffleOuter: () => {
    spellingBeeSoundService.playShuffle();
    set((s) => ({ outerLetters: shuffleOuterLetters(s.outerLetters) }));
  },

  setInput: (text) => set({ currentInput: text.toUpperCase() }),

  addLetter: (letter) => {
    spellingBeeSoundService.playLetterClick();
    set((s) => ({ currentInput: s.currentInput + letter.toUpperCase() }));
  },

  deleteLetter: () => {
    spellingBeeSoundService.playLetterClick();
    set((s) => ({ currentInput: s.currentInput.slice(0, -1) }));
  },

  submitWord: () => {
    const { currentInput, puzzle, foundWords, score } = get();
    const already = foundWords.map((f) => f.word);
    const res = validateSubmission(currentInput, puzzle, already);

    if (!res.isValid) {
      spellingBeeSoundService.playInvalidBuzz();
      const msg =
        res.reason === 'too-short'
          ? 'Too short (min 4 letters)'
          : res.reason === 'missing-center'
            ? `Missing center letter (${puzzle.centerLetter})`
            : res.reason === 'already-found'
              ? 'Already found'
              : res.reason === 'invalid-letter'
                ? 'Invalid letter'
                : 'Not in word list';
      set({
        feedbackMessage: msg,
        feedbackType: res.reason === 'already-found' ? 'already-found' : 'invalid',
      });
      return;
    }

    spellingBeeSoundService.playWordSuccess(res.isPangram);
    const newScore = score + res.score;
    const newRank = calculateRank(newScore, puzzle.maxScore);
    const newFound: FoundWord = {
      word: currentInput.toUpperCase(),
      score: res.score,
      isPangram: res.isPangram,
      discoveredAt: Date.now(),
    };

    set((s) => ({
      foundWords: [newFound, ...s.foundWords],
      score: newScore,
      rank: newRank,
      currentInput: '',
      feedbackMessage: res.isPangram ? `PANGRAM! +${res.score} pts` : `Nice! +${res.score} pts`,
      feedbackType: res.isPangram ? 'pangram' : 'valid',
    }));
  },

  createRoom: async (host, mode = 'race') => {
    try {
      set({ status: STATUS_IDLE, error: null });
      const room = await RoomService.createRoom(SPELLING_BEE_GAME_ID, host.id);
      const transport = new SupabaseTransportService(SPELLING_BEE_CHANNEL);
      const presence: PlayerPresence = {
        playerId: host.id,
        displayName: host.displayName,
        avatar: host.avatar || DEFAULT_AVATAR,
        role: 'host',
      };
      await transport.connect(room.code, presence);

      transport.onPresence((presences: PlayerPresence[]) => {
        set((s) => ({ players: syncPresences(presences, s.players, s.hostId) }));
      });

      const puzzle = getRandomPuzzle();
      set({
        roomCode: room.code,
        hostId: host.id,
        localPlayerId: host.id,
        status: STATUS_LOBBY,
        mode,
        puzzle,
        outerLetters: puzzle.outerLetters,
        players: [makePlayer(host.id, host.displayName, host.avatar, false, true)],
        transport,
      });
      return room.code;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Create room error' });
      return null;
    }
  },

  joinRoomByCode: async (code, identity) => {
    try {
      set({ status: STATUS_IDLE, error: null });
      const clean = code.trim().toUpperCase();
      const transport = new SupabaseTransportService(SPELLING_BEE_CHANNEL);
      const presence: PlayerPresence = {
        playerId: identity.id,
        displayName: identity.displayName,
        avatar: identity.avatar || DEFAULT_AVATAR,
        role: 'guest',
      };
      await transport.connect(clean, presence);

      transport.onPresence((presences: PlayerPresence[]) => {
        set((s) => ({ players: syncPresences(presences, s.players, s.hostId) }));
      });

      set({
        roomCode: clean,
        hostId: null,
        localPlayerId: identity.id,
        status: STATUS_LOBBY,
        transport,
      });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Join error' });
      return false;
    }
  },

  startGame: () => set({ status: STATUS_PLAYING }),
  endGame: () => set({ status: STATUS_GAME_OVER }),

  leaveRoom: () => {
    const { transport } = get();
    if (transport) {
      try {
        transport.disconnect();
      } catch {
        /* ignore */
      }
    }
    set({
      roomCode: null,
      hostId: null,
      localPlayerId: null,
      status: STATUS_IDLE,
      players: [],
      foundWords: [],
      score: 0,
      transport: null,
      error: null,
    });
  },

  addBot: () => {
    const { players } = get();
    if (players.length >= MAX_PLAYERS) return;
    const botIdx = players.filter((p) => p.isBot).length % BOT_TEMPLATES.length;
    const tmpl = BOT_TEMPLATES[botIdx];
    const bot = makePlayer(`bot-${Date.now()}`, tmpl.name, tmpl.avatar, true);
    set({ players: [...players, bot] });
  },

  removeBot: (botId) => {
    set((s) => ({ players: s.players.filter((p) => p.id !== botId) }));
  },
}));
