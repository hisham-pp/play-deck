import { create } from 'zustand';
import type { DashPlayer } from '@/features/games/loot-dash/types/loot-dash.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const LOOT_DASH_GAME_ID = 'loot-dash';
export const LOOT_DASH_CHANNEL = 'loot-dash-arena';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const STATUS_PLAYING = 'playing';
const STATUS_ERROR = 'error';

export const DASH_PLAYER_COLORS = [
  '#f59e0b', // Amber Gold
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
];

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface LootDashMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: DashPlayer[];
  roundDurationSec: number;
  targetScore: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: LootDashMultiplayerState['status']) => void;
  isHost: () => boolean;
  setRoundDuration: (sec: number) => void;
  setTargetScore: (score: number) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  color: string,
  isBot: boolean,
  slotIdx: number,
): DashPlayer {
  return {
    id,
    name,
    color,
    isBot,
    isAlive: true,
    position: { x: 120 + slotIdx * 120, y: 120 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    radius: 18,
    score: 0,
    coinsCollected: 0,
    gemsCollected: 0,
    trapsTriggered: 0,
    stealsCount: 0,
    activePowerUp: null,
    powerUpTimeRemaining: 0,
    stunTimer: 0,
    slowTimer: 0,
    invulnerableTimer: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: DashPlayer[],
  hostId: string | null,
): DashPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: DashPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = DASH_PLAYER_COLORS[idx % DASH_PLAYER_COLORS.length];
    const name = pres.displayName + (isHost ? ' (Host)' : '');
    return makeRosterPlayer(pres.playerId, name, color, false, idx);
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useLootDashMultiplayerStore = create<LootDashMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((presences) => {
      const { hostId, players, status } = get();
      if (status === STATUS_PLAYING) return;
      set({ players: syncPresences(presences, players, hostId) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: STATUS_IDLE,
    players: [],
    roundDurationSec: 90,
    targetScore: 250,
    transport: null,
    error: null,

    createRoom: async (host: RoomIdentity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(LOOT_DASH_GAME_ID, host.id);
        const transport = new SupabaseTransportService(LOOT_DASH_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '💎',
          role: 'host',
        };

        const p1 = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          DASH_PLAYER_COLORS[0],
          false,
          0,
        );
        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          transport,
          players: [p1],
          status: STATUS_LOBBY,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return room.code;
      } catch {
        set({ status: STATUS_ERROR, error: 'Room creation failed' });
        return null;
      }
    },

    joinRoomByCode: async (code: string, identity: RoomIdentity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.fetchRoomByCode(
          code.trim().toUpperCase(),
          LOOT_DASH_GAME_ID,
        );
        if (!room || room.gameId !== LOOT_DASH_GAME_ID) {
          throw new Error('Room not found');
        }

        const transport = new SupabaseTransportService(LOOT_DASH_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🏃',
          role: 'guest',
        };

        set({
          roomCode: room.code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          transport,
          status: STATUS_LOBBY,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return true;
      } catch {
        set({ status: STATUS_ERROR, error: 'Failed to join room' });
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

    setStatus: (status) => set({ status }),
    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },
    setRoundDuration: (sec) => set({ roundDurationSec: sec }),
    setTargetScore: (score) => set({ targetScore: score }),

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_PLAYERS) return;
      const botIdx = players.length;
      const botId = `bot-${Date.now()}-${botIdx}`;
      const bot = makeRosterPlayer(
        botId,
        `DashBot ${botIdx}`,
        DASH_PLAYER_COLORS[botIdx % DASH_PLAYER_COLORS.length],
        true,
        botIdx,
      );
      set({ players: [...players, bot] });
    },

    removeBot: (botId: string) => {
      set((s) => ({ players: s.players.filter((p) => p.id !== botId) }));
    },
  };
});
