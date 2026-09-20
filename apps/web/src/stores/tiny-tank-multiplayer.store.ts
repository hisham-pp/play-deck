import { create } from 'zustand';
import type { TankPlayer } from '@/features/games/tiny-tank/types/tiny-tank.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const TINY_TANK_GAME_ID = 'tiny-tank-arena';
export const TINY_TANK_CHANNEL = 'tiny-tank-arena';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const STATUS_PLAYING = 'playing';
const STATUS_ERROR = 'error';

export const TANK_PLAYER_COLORS = [
  '#06b6d4',
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#10b981',
  '#ec4899',
];

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface TinyTankMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: TankPlayer[];
  roundDurationSec: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: TinyTankMultiplayerState['status']) => void;
  isHost: () => boolean;
  setRoundDuration: (sec: number) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  color: string,
  isBot: boolean,
  slotIdx: number,
): TankPlayer {
  return {
    id,
    name,
    color,
    isBot,
    isAlive: true,
    position: { x: 100 + slotIdx * 120, y: 100 },
    velocity: { x: 0, y: 0 },
    angle: 0,
    turretAngle: 0,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 50,
    ammo: 5,
    maxAmmo: 5,
    reloadTimer: 0,
    activeWeapon: 'cannon',
    weaponAmmo: { cannon: Infinity, bouncing: 0, homing: 0, mine: 0, laser: 0, rubber: 0 },
    score: 0,
    kills: 0,
    damageDealt: 0,
    recoilOffset: 0,
    invulnerableTimer: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: TankPlayer[],
  hostId: string | null,
): TankPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: TankPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = TANK_PLAYER_COLORS[idx % TANK_PLAYER_COLORS.length];
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

export const useTinyTankMultiplayerStore = create<TinyTankMultiplayerState>((set, get) => {
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
    transport: null,
    error: null,

    createRoom: async (host: RoomIdentity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(TINY_TANK_GAME_ID, host.id);
        const transport = new SupabaseTransportService(TINY_TANK_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🛡️',
          role: 'host',
        };

        const p1 = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          TANK_PLAYER_COLORS[0],
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
          TINY_TANK_GAME_ID,
        );
        if (!room || room.gameId !== TINY_TANK_GAME_ID) {
          throw new Error('Room not found');
        }

        const transport = new SupabaseTransportService(TINY_TANK_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '⚡',
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

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_PLAYERS) return;
      const botIdx = players.length;
      const botId = `bot-${Date.now()}-${botIdx}`;
      const bot = makeRosterPlayer(
        botId,
        `Bot Unit ${botIdx}`,
        TANK_PLAYER_COLORS[botIdx % TANK_PLAYER_COLORS.length],
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
