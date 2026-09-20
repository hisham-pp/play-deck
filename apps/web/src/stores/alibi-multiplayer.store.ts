import { create } from 'zustand';

import type { AlibiPlayer } from '@/features/games/alibi/types/alibi.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const ALIBI_GAME_ID = 'alibi';
export const ALIBI_CHANNEL = 'alibi';
const MAX_ALIBI_PLAYERS = 8;
const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const DEFAULT_AVATAR = '🕵️';

const BOT_TEMPLATES = [
  { name: 'Inspector Bot', avatar: '🕵️' },
  { name: 'Witness AI', avatar: '👁️' },
  { name: 'Sherlock Bot', avatar: '🔍' },
  { name: 'Clue Master', avatar: '🔎' },
];

export interface AlibiRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface AlibiMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: AlibiPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: AlibiRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: AlibiRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: AlibiMultiplayerState['status']) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  isHost = false,
): AlibiPlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || DEFAULT_AVATAR,
    isHost,
    isBot,
    isSuspect: false,
    storyVariant: null,
    votedForId: null,
    score: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: AlibiPlayer[],
  hostId: string | null,
): AlibiPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const real: AlibiPlayer[] = presences.map((pres) => {
    const isHost = pres.playerId === hostId;
    return makeRosterPlayer(
      pres.playerId,
      pres.displayName + (isHost ? ' (Host)' : ''),
      pres.avatar ?? '🕵️',
      false,
      isHost,
    );
  });
  const combined = [...real];
  for (const bot of bots) {
    if (combined.length < MAX_ALIBI_PLAYERS) combined.push(bot);
  }
  return combined;
}

export const useAlibiMultiplayerStore = create<AlibiMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((presences: PlayerPresence[]) => {
      const { hostId, players, status } = get();
      if (status === 'playing') return;
      set({ players: syncPresences(presences, players, hostId) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: STATUS_IDLE,
    players: [],
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setStatus: (status) => set({ status }),

    createRoom: async (host) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(ALIBI_GAME_ID, host.id);
        const transport = new SupabaseTransportService(ALIBI_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || DEFAULT_AVATAR,
          role: 'host',
        };
        await transport.connect(room.code, presence);
        attachPresence(transport);
        const hostPlayer = makeRosterPlayer(host.id, host.displayName, host.avatar, false, true);
        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          players: [hostPlayer],
          transport,
          error: null,
        });
        return room.code;
      } catch (err) {
        set({
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to create room',
        });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const clean = code.trim().toUpperCase();
        const transport = new SupabaseTransportService(ALIBI_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || DEFAULT_AVATAR,
          role: 'guest',
        };
        await transport.connect(clean, presence);
        attachPresence(transport);
        const local = makeRosterPlayer(identity.id, identity.displayName, identity.avatar, false);
        set({
          roomCode: clean,
          hostId: null,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          players: [local],
          transport,
          error: null,
        });
        return true;
      } catch (err) {
        set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to join room' });
        return false;
      }
    },

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
        transport: null,
        error: null,
      });
    },

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_ALIBI_PLAYERS) return;
      const botIdx = players.filter((p) => p.isBot).length;
      const t = BOT_TEMPLATES[botIdx % BOT_TEMPLATES.length]!;
      const bot = makeRosterPlayer(`bot-alibi-${Date.now()}-${botIdx}`, t.name, t.avatar, true);
      set({ players: [...players, bot] });
    },

    removeBot: (botId: string) => {
      set({ players: get().players.filter((p) => p.id !== botId) });
    },
  };
});
