import { create } from 'zustand';
import {
  CHANNEL_NAMESPACE,
  DEFAULT_AVATAR,
  GAME_ID,
  MAX_SEATS,
  TEAM_A,
  TEAM_B,
} from '@/features/games/anagram-sprint/engine/anagram-constants';
import type { AnagramSeat } from '@/features/games/anagram-sprint/types/anagram-sprint.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const STATUS_ERROR = 'error';

export interface AnagramRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface AnagramMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  seats: AnagramSeat[];
  /** Seated players missing from presence — shown greyed out on the scoreboard. */
  disconnectedIds: string[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: AnagramRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: AnagramRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: AnagramMultiplayerState['status']) => void;
  isHost: () => boolean;
}

/**
 * Seats everyone deterministically: the host first, then the rest by player id.
 * Every client derives the same order from the same presence roster, so no
 * seat-assignment handshake is needed — and because teams alternate down that
 * order, a team match splits the room the same way on every screen.
 */
function reconcileSeats(presence: PlayerPresence[], hostId: string | null): AnagramSeat[] {
  return [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_SEATS)
    .map((person, index) => ({
      id: person.playerId,
      name: person.displayName,
      avatar: person.avatar || DEFAULT_AVATAR,
      team: index % 2 === 0 ? TEAM_A : TEAM_B,
    }));
}

export const useAnagramMultiplayerStore = create<AnagramMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, seats, status } = get();
      const presentIds = new Set(present.map((person) => person.playerId));

      // Once the first word is dealt the seating is frozen: a dropped
      // connection must not renumber the scoreboard mid-match.
      if (status === 'playing') {
        set({
          disconnectedIds: seats.filter((seat) => !presentIds.has(seat.id)).map((seat) => seat.id),
        });
        return;
      }

      set({ seats: reconcileSeats(present, hostId), disconnectedIds: [] });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    seats: [],
    disconnectedIds: [],
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    createRoom: async (host) => {
      try {
        const room = await RoomService.createRoom(GAME_ID, host.id);
        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar,
          role: 'host',
        };

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          seats: reconcileSeats([presence], host.id),
          disconnectedIds: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return room.code;
      } catch {
        set({ error: 'Failed to create room', status: STATUS_ERROR });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        const room = await RoomService.fetchRoomByCode(code, GAME_ID);
        if (!room || room.gameId !== GAME_ID) {
          set({ error: 'That room is not an Anagram Sprint room', status: STATUS_ERROR });
          return false;
        }

        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          seats: [],
          disconnectedIds: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        const connected = await transport.connect(code, {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar,
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
        seats: [],
        disconnectedIds: [],
        transport: null,
        error: null,
      });
    },

    setStatus: (status) => set({ status }),
  };
});
