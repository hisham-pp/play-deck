import { create } from 'zustand';

import {
  COURSE_NEON_CIRCUIT,
  GRAVITY_COURSES,
} from '@/features/games/gravity-shift/engine/course-catalog';
import { createInitialCharacter } from '@/features/games/gravity-shift/engine/gravity-physics';
import type {
  GravityDirection,
  GravityShiftPlayer,
} from '@/features/games/gravity-shift/types/gravity-shift.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const GRAVITY_SHIFT_GAME_ID = 'gravity-shift';
export const GRAVITY_SHIFT_CHANNEL = 'gravity-shift';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

export const RACER_COLORS = [
  '#38bdf8', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#a855f7', // Purple
  '#f43f5e', // Rose
];

const DEFAULT_AVATARS = ['⚡', '🌀', '🚀', '🤖', '👾', '🌟'];
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface GravityShiftMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: GravityShiftPlayer[];
  selectedCourseId: string;
  currentGravity: GravityDirection;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: GravityShiftMultiplayerState['status']) => void;
  isHost: () => boolean;
  selectCourse: (courseId: string) => void;
  setGravity: (dir: GravityDirection) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function reconcileRoster(
  presence: PlayerPresence[],
  hostId: string | null,
  currentBots: GravityShiftPlayer[] = [],
  courseId: string,
): GravityShiftPlayer[] {
  const course = GRAVITY_COURSES.find((c) => c.id === courseId) || COURSE_NEON_CIRCUIT;

  const humanPlayers: GravityShiftPlayer[] = [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_PLAYERS)
    .map((person, index) => {
      const color = RACER_COLORS[index % RACER_COLORS.length];
      const avatar = person.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
      return {
        id: person.playerId,
        name: person.displayName,
        avatar,
        color,
        isBot: false,
        isHost: person.playerId === hostId,
        ready: true,
        character: createInitialCharacter(course.spawnPoint),
      };
    });

  const remainingSlots = Math.max(0, MAX_PLAYERS - humanPlayers.length);
  const botsToKeep = currentBots.slice(0, remainingSlots).map((bot, idx) => {
    const totalIdx = humanPlayers.length + idx;
    return {
      ...bot,
      color: RACER_COLORS[totalIdx % RACER_COLORS.length],
      character: createInitialCharacter(course.spawnPoint),
    };
  });

  return [...humanPlayers, ...botsToKeep];
}

export const useGravityShiftMultiplayerStore = create<GravityShiftMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, players, status, selectedCourseId } = get();

      if (status === 'playing') return;

      const existingBots = players.filter((p) => p.isBot);
      const reconciled = reconcileRoster(present, hostId, existingBots, selectedCourseId);
      set({ players: reconciled });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    players: [],
    selectedCourseId: COURSE_NEON_CIRCUIT.id,
    currentGravity: 'down',
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    selectCourse: (courseId: string) => {
      const course = GRAVITY_COURSES.find((c) => c.id === courseId) || COURSE_NEON_CIRCUIT;
      const currentPlayers = get().players.map((p) => ({
        ...p,
        character: createInitialCharacter(course.spawnPoint),
      }));

      set({
        selectedCourseId: courseId,
        players: currentPlayers,
        currentGravity: course.initialGravity,
      });
    },

    setGravity: (dir: GravityDirection) => {
      set({ currentGravity: dir });
    },

    setStatus: (status) => set({ status }),

    addBot: () => {
      const { players, selectedCourseId } = get();
      if (players.length >= MAX_PLAYERS) return;

      const course = GRAVITY_COURSES.find((c) => c.id === selectedCourseId) || COURSE_NEON_CIRCUIT;
      const botIndex = players.filter((p) => p.isBot).length + 1;
      const slot = players.length;

      const bot: GravityShiftPlayer = {
        id: `bot-${Date.now()}-${botIndex}`,
        name: `Grav-Bot ${botIndex}`,
        avatar: '🤖',
        color: RACER_COLORS[slot % RACER_COLORS.length],
        isBot: true,
        isHost: false,
        ready: true,
        character: createInitialCharacter(course.spawnPoint),
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
        const room = await RoomService.createRoom(GRAVITY_SHIFT_GAME_ID, host.id);
        const transport = new SupabaseTransportService(GRAVITY_SHIFT_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '⚡',
          role: 'host',
        };

        const course =
          GRAVITY_COURSES.find((c) => c.id === get().selectedCourseId) || COURSE_NEON_CIRCUIT;
        const initialHostPlayer: GravityShiftPlayer = {
          id: host.id,
          name: host.displayName,
          avatar: host.avatar || '⚡',
          color: RACER_COLORS[0],
          isBot: false,
          isHost: true,
          ready: true,
          character: createInitialCharacter(course.spawnPoint),
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
          GRAVITY_SHIFT_GAME_ID,
        );
        if (!room || room.gameId !== GRAVITY_SHIFT_GAME_ID) {
          throw new Error('Room is unavailable or has already begun.');
        }

        const transport = new SupabaseTransportService(GRAVITY_SHIFT_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🌀',
          role: 'guest',
        };

        const course =
          GRAVITY_COURSES.find((c) => c.id === get().selectedCourseId) || COURSE_NEON_CIRCUIT;

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

        // Sync initial presence
        const localPlayer: GravityShiftPlayer = {
          id: identity.id,
          name: identity.displayName,
          avatar: identity.avatar || '🌀',
          color: RACER_COLORS[1],
          isBot: false,
          isHost: room.hostId === identity.id,
          ready: true,
          character: createInitialCharacter(course.spawnPoint),
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
