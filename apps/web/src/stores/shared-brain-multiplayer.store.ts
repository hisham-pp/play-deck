import { create } from 'zustand';
import { COURSES_CATALOG } from '@/features/games/shared-brain/engine/course-catalog';
import { createInitialCharacter } from '@/features/games/shared-brain/engine/platformer-physics';
import type {
  PlayerPair,
  SharedBrainPlayer,
  SharedBrainRole,
} from '@/features/games/shared-brain/types/shared-brain.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const SHARED_BRAIN_GAME_ID = 'shared-brain';
export const SHARED_BRAIN_CHANNEL = 'shared-brain';
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

const TEAM_COLORS = [
  { a: '#38bdf8', b: '#f59e0b' }, // Cyan / Amber (Team 1)
  { a: '#ec4899', b: '#10b981' }, // Pink / Emerald (Team 2)
  { a: '#8b5cf6', b: '#f97316' }, // Purple / Orange (Team 3)
];

const DEFAULT_AVATARS = ['🧠', '🕹️', '⚡', '🤖', '👾', '🌟'];
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface SharedBrainMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: SharedBrainPlayer[];
  pairs: PlayerPair[];
  selectedCourseId: string;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: SharedBrainMultiplayerState['status']) => void;
  isHost: () => boolean;
  selectCourse: (courseId: string) => void;
  swapRole: (playerId: string) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function derivePairs(players: SharedBrainPlayer[], courseId: string): PlayerPair[] {
  const course = COURSES_CATALOG.find((c) => c.id === courseId) || COURSES_CATALOG[0];
  const pairs: PlayerPair[] = [];

  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i + 1];
    const teamIndex = Math.floor(i / 2);
    const colors = TEAM_COLORS[teamIndex % TEAM_COLORS.length];

    if (p1 && p2) {
      // Determine roles: p1 is navigator by default unless swapped
      const nav = p1.role === 'navigator' ? p1 : p2;
      const mot = p1.role === 'navigator' ? p2 : p1;

      pairs.push({
        pairId: `team-${teamIndex + 1}`,
        navigatorId: nav.id,
        motorId: mot.id,
        navigatorName: nav.name,
        motorName: mot.name,
        navigatorAvatar: nav.avatar,
        motorAvatar: mot.avatar,
        colorA: colors.a,
        colorB: colors.b,
        isBotA: nav.isBot,
        isBotB: mot.isBot,
        character: createInitialCharacter(course.spawnPoint),
      });
    }
  }

  return pairs;
}

function reconcileRoster(
  presence: PlayerPresence[],
  hostId: string | null,
  currentBots: SharedBrainPlayer[] = [],
  courseId: string,
): { players: SharedBrainPlayer[]; pairs: PlayerPair[] } {
  const humanPlayers = [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_PLAYERS)
    .map((person, index) => {
      const teamIndex = Math.floor(index / 2);
      const isNavigator = index % 2 === 0;
      return {
        id: person.playerId,
        name: person.displayName,
        avatar: person.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
        role: (isNavigator ? 'navigator' : 'motor') as SharedBrainRole,
        teamIndex,
        isBot: false,
        isHost: person.playerId === hostId,
        ready: true,
      };
    });

  const remainingSlots = Math.max(0, MAX_PLAYERS - humanPlayers.length);
  const botsToKeep = currentBots.slice(0, remainingSlots).map((bot, idx) => {
    const totalIdx = humanPlayers.length + idx;
    const teamIndex = Math.floor(totalIdx / 2);
    const isNavigator = totalIdx % 2 === 0;
    return {
      ...bot,
      teamIndex,
      role: (isNavigator ? 'navigator' : 'motor') as SharedBrainRole,
    };
  });

  const fullPlayers = [...humanPlayers, ...botsToKeep];
  const pairs = derivePairs(fullPlayers, courseId);

  return { players: fullPlayers, pairs };
}

export const useSharedBrainMultiplayerStore = create<SharedBrainMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, players, status, selectedCourseId } = get();

      if (status === 'playing') return;

      const existingBots = players.filter((p) => p.isBot);
      const reconciled = reconcileRoster(present, hostId, existingBots, selectedCourseId);
      set({ players: reconciled.players, pairs: reconciled.pairs });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    players: [],
    pairs: [],
    selectedCourseId: COURSES_CATALOG[0].id,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    selectCourse: (courseId) => {
      const { players } = get();
      set({
        selectedCourseId: courseId,
        pairs: derivePairs(players, courseId),
      });
    },

    swapRole: (playerId) => {
      const { players, selectedCourseId } = get();
      const updated = players.map((p) => {
        if (p.id === playerId) {
          const nextRole: SharedBrainRole = p.role === 'navigator' ? 'motor' : 'navigator';
          return { ...p, role: nextRole };
        }
        return p;
      });

      set({
        players: updated,
        pairs: derivePairs(updated, selectedCourseId),
      });
    },

    createRoom: async (host) => {
      try {
        const room = await RoomService.createRoom(SHARED_BRAIN_GAME_ID, host.id);
        const transport = new SupabaseTransportService(SHARED_BRAIN_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🧠',
          role: 'host',
        };

        const courseId = COURSES_CATALOG[0].id;
        const initial = reconcileRoster([presence], host.id, [], courseId);

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          players: initial.players,
          pairs: initial.pairs,
          selectedCourseId: courseId,
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return room.code;
      } catch {
        set({ error: 'Failed to create Shared Brain room', status: STATUS_ERROR });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        const room = await RoomService.fetchRoomByCode(code, SHARED_BRAIN_GAME_ID);
        if (!room || room.gameId !== SHARED_BRAIN_GAME_ID) {
          set({ error: 'Room not found or not Shared Brain', status: STATUS_ERROR });
          return false;
        }

        const transport = new SupabaseTransportService(SHARED_BRAIN_CHANNEL);
        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          players: [],
          pairs: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        const connected = await transport.connect(code, {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🧠',
          role: 'guest',
        });
        if (!connected) {
          set({ error: 'Could not connect to the room', status: STATUS_ERROR });
          return false;
        }

        await RoomService.joinRoom(code, identity.id);
        return true;
      } catch {
        set({ error: 'Failed to join room', status: STATUS_ERROR });
        return false;
      }
    },

    leaveRoom: () => {
      get().transport?.disconnect();
      set({
        roomCode: null,
        hostId: null,
        localPlayerId: null,
        status: 'idle',
        players: [],
        pairs: [],
        transport: null,
        error: null,
      });
    },

    setStatus: (status) => set({ status }),

    addBot: () => {
      const { players, selectedCourseId } = get();
      if (players.length >= MAX_PLAYERS) return;

      const botIdx = players.length;
      const isNav = botIdx % 2 === 0;
      const teamIdx = Math.floor(botIdx / 2);
      const botNames = ['Cortex AI', 'Synapse Bot', 'Neuro CPU', 'Glial AI', 'Axon Bot'];

      const newBot: SharedBrainPlayer = {
        id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: botNames[botIdx % botNames.length] || `Bot ${botIdx + 1}`,
        avatar: '🤖',
        role: isNav ? 'navigator' : 'motor',
        teamIndex: teamIdx,
        isBot: true,
        ready: true,
      };

      const nextPlayers = [...players, newBot];
      set({
        players: nextPlayers,
        pairs: derivePairs(nextPlayers, selectedCourseId),
      });
    },

    removeBot: (botId: string) => {
      const { players, selectedCourseId } = get();
      const updated = players
        .filter((p) => p.id !== botId)
        .map((p, idx) => ({
          ...p,
          teamIndex: Math.floor(idx / 2),
        }));

      set({
        players: updated,
        pairs: derivePairs(updated, selectedCourseId),
      });
    },
  };
});
