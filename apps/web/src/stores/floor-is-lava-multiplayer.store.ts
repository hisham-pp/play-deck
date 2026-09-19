import { create } from 'zustand';

import type { LavaPlayer } from '@/features/games/floor-is-lava/types/floor-is-lava.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const FLOOR_IS_LAVA_GAME_ID = 'floor-is-lava';
export const FLOOR_IS_LAVA_CHANNEL = 'floor-is-lava';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const LAVA_PLAYER_COLORS = [
  '#ef4444', // Flame Red
  '#f59e0b', // Amber
  '#38bdf8', // Cyan
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#ec4899', // Pink
];

const DEFAULT_AVATARS = ['🔥', '🌋', '⚡', '🤖', '👾', '🌟'];
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface FloorIsLavaMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: LavaPlayer[];
  lavaSpeedMultiplier: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: FloorIsLavaMultiplayerState['status']) => void;
  isHost: () => boolean;
  setLavaSpeed: (speed: number) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function reconcileRoster(
  presence: PlayerPresence[],
  hostId: string | null,
  currentBots: LavaPlayer[] = [],
): LavaPlayer[] {
  const humanPlayers: LavaPlayer[] = [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_PLAYERS)
    .map((person, index) => {
      const color = LAVA_PLAYER_COLORS[index % LAVA_PLAYER_COLORS.length];
      const avatar = person.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
      return {
        id: person.playerId,
        name: person.displayName,
        avatar,
        color,
        isBot: false,
        isHost: person.playerId === hostId,
        ready: true,
        isAlive: true,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 16,
        pushCooldown: 0,
        isPushing: false,
        activePowerUp: null,
        hasDoubleJumpReady: false,
      };
    });

  const remainingSlots = Math.max(0, MAX_PLAYERS - humanPlayers.length);
  const botsToKeep = currentBots.slice(0, remainingSlots).map((bot, idx) => {
    const totalIdx = humanPlayers.length + idx;
    return {
      ...bot,
      color: LAVA_PLAYER_COLORS[totalIdx % LAVA_PLAYER_COLORS.length],
    };
  });

  return [...humanPlayers, ...botsToKeep];
}

export const useFloorIsLavaMultiplayerStore = create<FloorIsLavaMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, players, status } = get();

      if (status === 'playing') return;

      const existingBots = players.filter((p) => p.isBot);
      const reconciled = reconcileRoster(present, hostId, existingBots);
      set({ players: reconciled });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    players: [],
    lavaSpeedMultiplier: 1.0,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setLavaSpeed: (multiplier: number) => {
      set({ lavaSpeedMultiplier: multiplier });
    },

    setStatus: (status) => set({ status }),

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_PLAYERS) return;

      const botIndex = players.filter((p) => p.isBot).length + 1;
      const slot = players.length;

      const bot: LavaPlayer = {
        id: `bot-${Date.now()}-${botIndex}`,
        name: `Lava-Bot ${botIndex}`,
        avatar: '🤖',
        color: LAVA_PLAYER_COLORS[slot % LAVA_PLAYER_COLORS.length],
        isBot: true,
        isHost: false,
        ready: true,
        isAlive: true,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        radius: 16,
        pushCooldown: 0,
        isPushing: false,
        activePowerUp: null,
        hasDoubleJumpReady: false,
      };

      set({ players: [...players, bot] });
    },

    removeBot: (botId: string) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },

    createRoom: async (host: RoomIdentity) => {
      try {
        set({ status: 'idle', error: null });
        const room = await RoomService.createRoom(FLOOR_IS_LAVA_GAME_ID, host.id);
        const transport = new SupabaseTransportService(FLOOR_IS_LAVA_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🔥',
          role: 'host',
        };

        const initialHostPlayer: LavaPlayer = {
          id: host.id,
          name: host.displayName,
          avatar: host.avatar || '🔥',
          color: LAVA_PLAYER_COLORS[0],
          isBot: false,
          isHost: true,
          ready: true,
          isAlive: true,
          position: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: 16,
          pushCooldown: 0,
          isPushing: false,
          activePowerUp: null,
          hasDoubleJumpReady: false,
        };

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          players: [initialHostPlayer],
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);

        return room.code;
      } catch (err) {
        set({
          status: STATUS_ERROR,
          error: err instanceof Error ? err.message : 'Failed to create room',
        });
        return null;
      }
    },

    joinRoomByCode: async (code: string, identity: RoomIdentity) => {
      try {
        set({ status: 'idle', error: null });
        const room = await RoomService.fetchRoomByCode(
          code.trim().toUpperCase(),
          FLOOR_IS_LAVA_GAME_ID,
        );
        if (!room || room.gameId !== FLOOR_IS_LAVA_GAME_ID) {
          throw new Error('Room is unavailable or has already begun.');
        }

        const transport = new SupabaseTransportService(FLOOR_IS_LAVA_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🌋',
          role: 'guest',
        };

        set({
          roomCode: room.code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);

        // Sync local player presence
        const localPlayer: LavaPlayer = {
          id: identity.id,
          name: identity.displayName,
          avatar: identity.avatar || '🌋',
          color: LAVA_PLAYER_COLORS[1],
          isBot: false,
          isHost: room.hostId === identity.id,
          ready: true,
          isAlive: true,
          position: { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          radius: 16,
          pushCooldown: 0,
          isPushing: false,
          activePowerUp: null,
          hasDoubleJumpReady: false,
        };
        set({ players: [localPlayer] });

        return true;
      } catch (err) {
        set({
          status: STATUS_ERROR,
          error: err instanceof Error ? err.message : 'Failed to join room',
        });
        return false;
      }
    },

    leaveRoom: () => {
      const { transport } = get();
      if (transport) {
        try {
          transport.disconnect();
        } catch {
          // graceful
        }
      }
      set({
        roomCode: null,
        hostId: null,
        localPlayerId: null,
        status: 'idle',
        players: [],
        transport: null,
        error: null,
      });
    },
  };
});
