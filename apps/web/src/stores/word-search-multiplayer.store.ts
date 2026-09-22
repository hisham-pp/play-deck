import { create } from 'zustand';

import {
  generateGrid,
  scoreWord,
  validateSelection,
} from '@/features/games/word-search-arena/engine/word-search-engine';
import { wordSearchSoundService } from '@/features/games/word-search-arena/services/word-search-sound.service';
import type {
  Coordinate,
  GridSize,
  GridTheme,
  SelectionState,
  WordPlacement,
  WordSearchGrid,
  WordSearchMode,
  WordSearchPlayer,
} from '@/features/games/word-search-arena/types/word-search.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const WORD_SEARCH_GAME_ID = 'word-search-arena';
export const WORD_SEARCH_CHANNEL = 'word-search';

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const STATUS_PLAYING = 'playing';
const STATUS_GAME_OVER = 'game-over';
const DEFAULT_AVATAR = '🔍';

const PLAYER_COLORS = ['#f59e0b', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];

const BOT_NAMES = [
  { name: 'Scout Bot', avatar: '🔎' },
  { name: 'Eagle Eye', avatar: '🦅' },
  { name: 'Hawk Vision', avatar: '👁️' },
  { name: 'Finder Bot', avatar: '🧭' },
];

export interface WordSearchRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface WordSearchMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'game-over';
  mode: WordSearchMode;
  theme: GridTheme;
  gridSize: GridSize;
  grid: WordSearchGrid | null;
  players: WordSearchPlayer[];
  foundWordSet: Set<string>;
  selection: SelectionState;
  gameStartTime: number | null;
  transport: SupabaseTransportService | null;
  error: string | null;

  // Actions
  setMode: (mode: WordSearchMode) => void;
  setTheme: (theme: GridTheme) => void;
  setGridSize: (size: GridSize) => void;
  startSoloGame: () => void;
  updateSelection: (cells: Coordinate[]) => void;
  commitSelection: () => WordPlacement | null;
  clearSelection: () => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (id: string) => void;
  createRoom: (host: WordSearchRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: WordSearchRoomIdentity) => Promise<boolean>;
  startGame: () => void;
  endGame: () => void;
  leaveRoom: () => void;
}

function makePlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  isHost = false,
  index = 0,
): WordSearchPlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || DEFAULT_AVATAR,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    score: 0,
    foundWordsCount: 0,
    isHost,
    isBot,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: WordSearchPlayer[],
  hostId: string | null,
): WordSearchPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const humans = presences.map((pres, i) =>
    makePlayer(pres.playerId, pres.displayName, pres.avatar, false, pres.playerId === hostId, i),
  );
  return [...humans, ...bots];
}

const EMPTY_SELECTION: SelectionState = {
  start: null,
  current: null,
  cells: [],
  text: '',
};

export const useWordSearchMultiplayerStore = create<WordSearchMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((presences: PlayerPresence[]) => {
      const { hostId, players } = get();
      set({ players: syncPresences(presences, players, hostId) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: STATUS_IDLE,
    mode: 'solo',
    theme: 'animals',
    gridSize: 'medium',
    grid: null,
    players: [],
    foundWordSet: new Set(),
    selection: EMPTY_SELECTION,
    gameStartTime: null,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setMode: (mode) => set({ mode }),
    setTheme: (theme) => set({ theme }),
    setGridSize: (gridSize) => set({ gridSize }),

    startSoloGame: () => {
      const { theme, gridSize } = get();
      const grid = generateGrid(theme, gridSize);
      set({
        grid,
        status: STATUS_PLAYING,
        foundWordSet: new Set(),
        selection: EMPTY_SELECTION,
        gameStartTime: Date.now(),
      });
    },

    updateSelection: (cells) => {
      const { grid } = get();
      if (!grid) return;
      const text = cells.map((c) => grid.letters[c.row][c.col]).join('');
      set({
        selection: {
          start: cells[0] ?? null,
          current: cells[cells.length - 1] ?? null,
          cells,
          text,
        },
      });
      if (cells.length > 0) wordSearchSoundService.playSelect();
    },

    commitSelection: () => {
      const { grid, selection, foundWordSet, players, localPlayerId, gameStartTime } = get();
      if (!grid || selection.cells.length < 2) {
        set({ selection: EMPTY_SELECTION });
        return null;
      }

      const result = validateSelection(grid, selection.cells, foundWordSet);
      if (!result) {
        wordSearchSoundService.playInvalid();
        set({ selection: EMPTY_SELECTION });
        return null;
      }

      // Claim the word
      const now = Date.now();
      const pts = scoreWord(result.word, now, gameStartTime ?? now);
      const newFoundSet = new Set(foundWordSet);
      newFoundSet.add(result.word);

      // Update placement
      const updatedPlacements = grid.placements.map((p) =>
        p.word === result.word
          ? {
              ...p,
              found: true,
              claimedBy: localPlayerId,
              claimedAt: now,
            }
          : p,
      );
      const updatedGrid: WordSearchGrid = { ...grid, placements: updatedPlacements };

      // Update player score
      const updatedPlayers = players.map((p) =>
        p.id === localPlayerId
          ? { ...p, score: p.score + pts, foundWordsCount: p.foundWordsCount + 1 }
          : p,
      );

      const allFound = newFoundSet.size >= grid.placements.length;
      if (allFound) wordSearchSoundService.playFinish();
      else wordSearchSoundService.playWordFound();

      set({
        grid: updatedGrid,
        foundWordSet: newFoundSet,
        players: updatedPlayers,
        selection: EMPTY_SELECTION,
        status: allFound ? STATUS_GAME_OVER : get().status,
      });

      return result;
    },

    clearSelection: () => set({ selection: EMPTY_SELECTION }),

    addBot: () => {
      const { players } = get();
      if (players.length >= 6) return;
      const botIdx = players.filter((p) => p.isBot).length;
      const t = BOT_NAMES[botIdx % BOT_NAMES.length];
      const bot = makePlayer(`bot-ws-${Date.now()}`, t.name, t.avatar, true, false, players.length);
      set({ players: [...players, bot] });
    },

    removeBot: (id) => set({ players: get().players.filter((p) => p.id !== id) }),

    createRoom: async (host) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(WORD_SEARCH_GAME_ID, host.id);
        const transport = new SupabaseTransportService(WORD_SEARCH_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || DEFAULT_AVATAR,
          role: 'host',
        };
        await transport.connect(room.code, presence);
        attachPresence(transport);

        const hostPlayer = makePlayer(host.id, host.displayName, host.avatar, false, true, 0);
        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          players: [hostPlayer],
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
        const transport = new SupabaseTransportService(WORD_SEARCH_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || DEFAULT_AVATAR,
          role: 'guest',
        };
        await transport.connect(clean, presence);
        attachPresence(transport);

        const local = makePlayer(
          identity.id,
          identity.displayName,
          identity.avatar,
          false,
          false,
          0,
        );
        set({
          roomCode: clean,
          hostId: null,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          players: [local],
          transport,
        });
        return true;
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Join error' });
        return false;
      }
    },

    startGame: () => {
      const { theme, gridSize } = get();
      const grid = generateGrid(theme, gridSize);
      set({
        status: STATUS_PLAYING,
        grid,
        foundWordSet: new Set(),
        selection: EMPTY_SELECTION,
        gameStartTime: Date.now(),
      });
    },

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
        grid: null,
        foundWordSet: new Set(),
        selection: EMPTY_SELECTION,
        gameStartTime: null,
        transport: null,
        error: null,
      });
    },
  };
});
