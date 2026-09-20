import { create } from 'zustand';
import type { MagnetPlayer } from '@/features/games/magnet-mayhem/types/magnet-mayhem.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const MAGNET_MAYHEM_GAME_ID = 'magnet-mayhem';
export const MAGNET_MAYHEM_CHANNEL = 'magnet-mayhem';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export const MAGNET_PLAYER_COLORS = [
  '#06b6d4', // Cyan (P1)
  '#f59e0b', // Amber (P2)
  '#10b981', // Emerald (P3)
  '#a855f7', // Purple (P4)
];

const DEFAULT_AVATARS = ['🧲', '⚡', '🤖', '👾'];
const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';
const STATUS_PLAYING = 'playing';
const STATUS_ERROR = 'error';
const ACTION_IDLE = 'idle';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface MagnetMayhemMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: MagnetPlayer[];
  roundDurationSec: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: MagnetMayhemMultiplayerState['status']) => void;
  isHost: () => boolean;
  setRoundDuration: (sec: number) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function createRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  color: string,
  isHost: boolean,
  isBot: boolean,
): MagnetPlayer {
  return {
    id,
    name,
    avatar,
    color,
    isBot,
    isHost,
    ready: true,
    score: 0,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    aimAngle: 0,
    action: ACTION_IDLE,
    energy: 100,
    stunnedTimer: 0,
    targetHitCount: 0,
    slingshotCount: 0,
    repelHitCount: 0,
    isTethered: false,
    tetherTarget: null,
  };
}

function reconcileRoster(
  presence: PlayerPresence[],
  hostId: string | null,
  currentBots: MagnetPlayer[] = [],
): MagnetPlayer[] {
  const humanPlayers: MagnetPlayer[] = [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_PLAYERS)
    .map((person, index) =>
      createRosterPlayer(
        person.playerId,
        person.displayName,
        person.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
        MAGNET_PLAYER_COLORS[index % MAGNET_PLAYER_COLORS.length],
        person.playerId === hostId,
        false,
      ),
    );

  const remainingSlots = Math.max(0, MAX_PLAYERS - humanPlayers.length);
  const botsToKeep = currentBots.slice(0, remainingSlots).map((bot, idx) => ({
    ...bot,
    color: MAGNET_PLAYER_COLORS[(humanPlayers.length + idx) % MAGNET_PLAYER_COLORS.length],
  }));

  return [...humanPlayers, ...botsToKeep];
}

export const useMagnetMayhemMultiplayerStore = create<MagnetMayhemMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, players, status } = get();
      if (status === STATUS_PLAYING) return;
      const existingBots = players.filter((p) => p.isBot);
      set({ players: reconcileRoster(present, hostId, existingBots) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: STATUS_IDLE,
    players: [],
    roundDurationSec: 60,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setRoundDuration: (sec: number) => set({ roundDurationSec: sec }),
    setStatus: (status) => set({ status }),

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_PLAYERS) return;
      const botIndex = players.filter((p) => p.isBot).length + 1;
      const bot = createRosterPlayer(
        `bot-${Date.now()}-${botIndex}`,
        `Magnet-Bot ${botIndex}`,
        '🤖',
        MAGNET_PLAYER_COLORS[players.length % MAGNET_PLAYER_COLORS.length],
        false,
        true,
      );
      set({ players: [...players, bot] });
    },

    removeBot: (botId: string) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },

    createRoom: async (host: RoomIdentity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(MAGNET_MAYHEM_GAME_ID, host.id);
        const transport = new SupabaseTransportService(MAGNET_MAYHEM_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🧲',
          role: 'host',
        };

        const initialHost = createRosterPlayer(
          host.id,
          host.displayName,
          host.avatar || '🧲',
          MAGNET_PLAYER_COLORS[0],
          true,
          false,
        );

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          players: [initialHost],
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
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.fetchRoomByCode(
          code.trim().toUpperCase(),
          MAGNET_MAYHEM_GAME_ID,
        );
        if (!room || room.gameId !== MAGNET_MAYHEM_GAME_ID) {
          throw new Error('Room is unavailable or has already begun.');
        }

        const transport = new SupabaseTransportService(MAGNET_MAYHEM_CHANNEL);
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
          status: STATUS_LOBBY,
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);

        const localPlayer = createRosterPlayer(
          identity.id,
          identity.displayName,
          identity.avatar || '⚡',
          MAGNET_PLAYER_COLORS[1],
          room.hostId === identity.id,
          false,
        );
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
        status: STATUS_IDLE,
        players: [],
        transport: null,
        error: null,
      });
    },
  };
});
