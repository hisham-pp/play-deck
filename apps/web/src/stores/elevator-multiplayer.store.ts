import { create } from 'zustand';
import {
  CHANNEL_NAMESPACE,
  GAME_ID,
  MAX_SEATS,
  SEAT_COLORS,
  SEAT_TYPE_BOT,
  SEAT_TYPE_HUMAN,
} from '@/features/games/unstable-elevator/engine/elevator-constants';
import type { ElevatorSeat } from '@/features/games/unstable-elevator/types/unstable-elevator.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const DEFAULT_AVATAR = '🛗';
const STATUS_ERROR = 'error';

export interface ElevatorRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface ElevatorMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  /** Every seat in the crew: humans reconciled from presence, plus any bots. */
  seats: ElevatorSeat[];
  /** Seated humans missing from presence; the host places for them. */
  disconnectedIds: string[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: ElevatorRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: ElevatorRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  publishSeats: (seats: ElevatorSeat[]) => void;
  adoptSeats: (seats: ElevatorSeat[]) => void;
  setStatus: (status: ElevatorMultiplayerState['status']) => void;
  isHost: () => boolean;
}

function toPresence(seat: ElevatorSeat, hostId: string | null): PlayerPresence {
  return {
    playerId: seat.id,
    displayName: seat.displayName,
    avatar: seat.avatar || DEFAULT_AVATAR,
    role: seat.id === hostId ? 'host' : 'guest',
  };
}

function humanSeat(presence: PlayerPresence, seatIndex: number): ElevatorSeat {
  return {
    id: presence.playerId,
    displayName: presence.displayName,
    avatar: presence.avatar,
    type: SEAT_TYPE_HUMAN,
    color: SEAT_COLORS[seatIndex % SEAT_COLORS.length],
    seatIndex,
    status: 'connected',
  };
}

/**
 * Seats everyone deterministically: the host first, then the other humans by
 * player id, then bots. Every client derives the same order from the same
 * presence roster, so no seat handshake is needed.
 */
function reconcileSeats(
  presence: PlayerPresence[],
  hostId: string | null,
  bots: ElevatorSeat[],
): ElevatorSeat[] {
  const humans = [...presence].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.playerId.localeCompare(b.playerId);
  });

  const seated: ElevatorSeat[] = [];
  for (const person of humans) {
    if (seated.length >= MAX_SEATS) break;
    seated.push(humanSeat(person, seated.length));
  }
  for (const bot of bots) {
    if (seated.length >= MAX_SEATS) break;
    seated.push({
      ...bot,
      seatIndex: seated.length,
      color: SEAT_COLORS[seated.length % SEAT_COLORS.length],
    });
  }
  return seated;
}

export const useElevatorMultiplayerStore = create<ElevatorMultiplayerState>((set, get) => {
  /** Bots are host-owned and never appear in presence, so they live apart. */
  let bots: ElevatorSeat[] = [];

  function rebuildFromSeats(): ElevatorSeat[] {
    const { seats, hostId } = get();
    const humans = seats.filter((seat) => seat.type === SEAT_TYPE_HUMAN);
    return reconcileSeats(
      humans.map((seat) => toPresence(seat, hostId)),
      hostId,
      bots,
    );
  }

  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, seats, status } = get();
      const presentIds = new Set(present.map((person) => person.playerId));

      // Once the run starts the crew is fixed: a player's cargo and score must
      // survive a dropped connection, so an absent seat is marked, not removed.
      const disconnectedIds = seats
        .filter((seat) => seat.type === SEAT_TYPE_HUMAN && !presentIds.has(seat.id))
        .map((seat) => seat.id);

      if (status === 'playing') {
        set({
          disconnectedIds,
          seats: seats.map((seat) =>
            seat.type === SEAT_TYPE_HUMAN
              ? { ...seat, status: presentIds.has(seat.id) ? 'connected' : 'disconnected' }
              : seat,
          ),
        });
        return;
      }

      const nextSeats = reconcileSeats(present, hostId, bots);
      set({ seats: nextSeats, disconnectedIds: [] });
      if (get().isHost()) get().publishSeats(nextSeats);
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
        bots = [];

        const hostPresence: PlayerPresence = {
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
          seats: reconcileSeats([hostPresence], host.id, []),
          disconnectedIds: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, hostPresence);
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
          set({ error: 'That room is not an Unstable Elevator room', status: STATUS_ERROR });
          return false;
        }

        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        bots = [];
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
      bots = [];
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

    addBot: () => {
      if (get().seats.length >= MAX_SEATS) return;

      const botNumber = bots.length + 1;
      bots = [
        ...bots,
        {
          id: `bot-${botNumber}-${Math.random().toString(36).slice(2, 8)}`,
          displayName: `Bot ${botNumber}`,
          avatar: '🤖',
          type: SEAT_TYPE_BOT,
          color: SEAT_COLORS[0],
          seatIndex: 0,
          status: 'connected',
        },
      ];

      const next = rebuildFromSeats();
      set({ seats: next });
      get().publishSeats(next);
    },

    removeBot: (botId) => {
      bots = bots.filter((bot) => bot.id !== botId);
      const next = rebuildFromSeats();
      set({ seats: next });
      get().publishSeats(next);
    },

    publishSeats: (seats) => {
      const { transport, hostId } = get();
      if (!transport || !hostId) return;
      transport.send('SEATS', { seats }, hostId);
    },

    adoptSeats: (seats) => set({ seats }),

    setStatus: (status) => set({ status }),
  };
});
