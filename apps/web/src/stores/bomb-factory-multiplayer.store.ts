import { create } from 'zustand';
import {
  CHANNEL_NAMESPACE,
  GAME_ID,
  MAX_SEATS,
} from '@/features/games/bomb-factory/engine/bomb-factory-constants';
import type { BombFactorySeat } from '@/features/games/bomb-factory/types/bomb-factory.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const DEFAULT_AVATAR = '🛠️';
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface BombFactoryMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  seats: BombFactorySeat[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: BombFactoryMultiplayerState['status']) => void;
  isHost: () => boolean;
}

/**
 * Seats everyone in the same order on every client: the host first, then the
 * rest by player id. The order decides who holds the wrench on which step, so
 * it has to be derived rather than announced.
 */
function reconcileSeats(presence: PlayerPresence[], hostId: string | null): BombFactorySeat[] {
  return [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_SEATS)
    .map((person, seatIndex) => ({
      id: person.playerId,
      displayName: person.displayName,
      avatar: person.avatar || DEFAULT_AVATAR,
      seatIndex,
      status: 'connected' as const,
    }));
}

export const useBombFactoryMultiplayerStore = create<BombFactoryMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, seats, status } = get();

      // Once the shift is running the roster is frozen: a dropped crew member
      // still holds a slice of the blueprint, so their seat has to stay.
      if (status === 'playing') {
        const presentIds = new Set(present.map((p) => p.playerId));
        set({
          seats: seats.map((seat) => ({
            ...seat,
            status: presentIds.has(seat.id) ? 'connected' : 'disconnected',
          })),
        });
        return;
      }

      set({ seats: reconcileSeats(present, hostId) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    seats: [],
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
          avatar: host.avatar || DEFAULT_AVATAR,
          role: 'host',
        };

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          seats: reconcileSeats([presence], host.id),
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return room.code;
      } catch {
        set({ error: 'Failed to open a factory room', status: STATUS_ERROR });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        const room = await RoomService.fetchRoomByCode(code, GAME_ID);
        if (!room || room.gameId !== GAME_ID) {
          set({ error: 'That room is not a Bomb Factory room', status: STATUS_ERROR });
          return false;
        }

        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          seats: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        const connected = await transport.connect(code, {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || DEFAULT_AVATAR,
          role: 'guest',
        });
        if (!connected) {
          set({ error: 'Could not connect to the room', status: STATUS_ERROR });
          return false;
        }

        await RoomService.joinRoom(code, identity.id);
        return true;
      } catch {
        set({ error: 'Failed to join the room', status: STATUS_ERROR });
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
        transport: null,
        error: null,
      });
    },

    setStatus: (status) => set({ status }),
  };
});
