import { create } from 'zustand';

import { BOT_ARCHETYPES } from '@/features/games/kingdom-draft/engine/kingdom-bot';
import { createEmptyGrid } from '@/features/games/kingdom-draft/engine/kingdom-engine';
import type { KingdomPlayer } from '@/features/games/kingdom-draft/types/kingdom-draft.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const KINGDOM_GAME_ID = 'kingdom-draft';
export const KINGDOM_CHANNEL = 'kingdom-draft';
export const MIN_KINGDOM_PLAYERS = 2;
export const MAX_KINGDOM_PLAYERS = 6;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

export const KINGDOM_PLAYER_COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
];

export interface KingdomRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface KingdomMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: KingdomPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: KingdomRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: KingdomRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: KingdomMultiplayerState['status']) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  color: string,
  isBot: boolean,
  archetype?: string,
): KingdomPlayer {
  return {
    id,
    name,
    avatar: avatar || '🏰',
    color,
    isBot,
    archetype,
    grid: createEmptyGrid(),
    secretObjective: null,
    unplacedCard: null,
    score: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: KingdomPlayer[],
  hostId: string | null,
): KingdomPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: KingdomPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = KINGDOM_PLAYER_COLORS[idx % KINGDOM_PLAYER_COLORS.length]!;
    const name = pres.displayName + (isHost ? ' (Host)' : '');
    return makeRosterPlayer(pres.playerId, name, pres.avatar ?? '🏰', color, false);
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_KINGDOM_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useKingdomMultiplayerStore = create<KingdomMultiplayerState>((set, get) => {
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
        const room = await RoomService.createRoom(KINGDOM_GAME_ID, host.id);
        const transport = new SupabaseTransportService(KINGDOM_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '👑',
          role: 'host',
        };

        const initialPlayer = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          host.avatar,
          KINGDOM_PLAYER_COLORS[0]!,
          false,
        );

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          transport,
          players: [initialPlayer],
          error: null,
        });

        await transport.connect(room.code, presence);
        attachPresence(transport);
        return room.code;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create kingdom room';
        set({ status: 'error', error });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.fetchRoomByCode(code, KINGDOM_GAME_ID);
        if (!room || room.gameId !== KINGDOM_GAME_ID) {
          set({ status: 'error', error: 'Kingdom room not found' });
          return false;
        }

        const transport = new SupabaseTransportService(KINGDOM_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🏰',
          role: 'guest',
        };

        const localPlayer = makeRosterPlayer(
          identity.id,
          identity.displayName,
          identity.avatar,
          KINGDOM_PLAYER_COLORS[1]!,
          false,
        );

        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          transport,
          players: [localPlayer],
          error: null,
        });

        await transport.connect(code, presence);
        attachPresence(transport);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to join kingdom room';
        set({ status: 'error', error });
        return false;
      }
    },

    leaveRoom: () => {
      const { transport } = get();
      if (transport) {
        transport.disconnect();
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
      if (players.length >= MAX_KINGDOM_PLAYERS) return;

      const botIndex = players.filter((p) => p.isBot).length + 1;
      const archetype = BOT_ARCHETYPES[(botIndex - 1) % BOT_ARCHETYPES.length]!;
      const color = KINGDOM_PLAYER_COLORS[players.length % KINGDOM_PLAYER_COLORS.length]!;
      const botNames: Record<string, string> = {
        warlord: 'Lord Ironclad [Bot]',
        philosopher: 'Archivist Elion [Bot]',
        merchant: 'Guildmaster Jax [Bot]',
        agrarian: 'Baron Greenfield [Bot]',
      };

      const bot = makeRosterPlayer(
        `bot-${Date.now()}-${botIndex}`,
        botNames[archetype] ?? `Governor Bot ${botIndex}`,
        '🤖',
        color,
        true,
        archetype,
      );

      set({ players: [...players, bot] });
    },

    removeBot: (botId) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },
  };
});
