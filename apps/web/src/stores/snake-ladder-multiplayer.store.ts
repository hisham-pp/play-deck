import { create } from 'zustand';
import {
  MAX_SEATS,
  SEAT_COLORS,
} from '@/features/games/snake-and-ladder/engine/snake-ladder-constants';
import type { SnakeLadderPlayer } from '@/features/games/snake-and-ladder/types/snake-and-ladder.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const GAME_ID = 'snake-and-ladder';
const CHANNEL_NAMESPACE = 'snake-and-ladder';
const DEFAULT_AVATAR = '🕹️';
const TYPE_HUMAN = 'human';
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface SnakeLadderMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  /** Every seat in the match: humans reconciled from presence, plus any bots. */
  seats: SnakeLadderPlayer[];
  /** Seated humans missing from presence; the host rolls on their behalf. */
  disconnectedIds: string[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  /** Host pushes the agreed roster so every client seats players identically. */
  publishSeats: (seats: SnakeLadderPlayer[]) => void;
  adoptSeats: (seats: SnakeLadderPlayer[]) => void;
  setStatus: (status: SnakeLadderMultiplayerState['status']) => void;
  isHost: () => boolean;
}

function toPresence(seat: SnakeLadderPlayer, hostId: string | null): PlayerPresence {
  return {
    playerId: seat.id,
    displayName: seat.displayName,
    avatar: seat.avatar ?? DEFAULT_AVATAR,
    role: seat.id === hostId ? 'host' : 'guest',
  };
}

function humanSeat(presence: PlayerPresence, seatIndex: number): SnakeLadderPlayer {
  return {
    id: presence.playerId,
    displayName: presence.displayName,
    avatar: presence.avatar,
    type: TYPE_HUMAN,
    color: SEAT_COLORS[seatIndex % SEAT_COLORS.length],
    seatIndex,
    status: 'connected',
    ready: true,
  };
}

/**
 * Seats everyone deterministically: the host first, then the remaining humans
 * by player id, then bots. Every client derives the same order from the same
 * presence roster, so no seat-assignment handshake is needed.
 */
function reconcileSeats(
  presence: PlayerPresence[],
  hostId: string | null,
  bots: SnakeLadderPlayer[],
): SnakeLadderPlayer[] {
  const humans = [...presence].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.playerId.localeCompare(b.playerId);
  });

  const seated: SnakeLadderPlayer[] = [];
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

export const useSnakeLadderMultiplayerStore = create<SnakeLadderMultiplayerState>((set, get) => {
  /** Bots are host-owned and never appear in presence, so they are tracked apart. */
  let bots: SnakeLadderPlayer[] = [];

  function rebuildFromSeats(): SnakeLadderPlayer[] {
    const { seats, hostId } = get();
    const humans = seats.filter((seat) => seat.type === TYPE_HUMAN);
    return reconcileSeats(
      humans.map((seat) => toPresence(seat, hostId)),
      hostId,
      bots,
    );
  }

  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, seats, status } = get();
      const presentIds = new Set(present.map((p) => p.playerId));

      // Once play starts the seating is frozen: a token's square must survive a
      // dropped connection, so a missing human is marked absent, not unseated.
      const disconnectedIds = seats
        .filter((seat) => seat.type === TYPE_HUMAN && !presentIds.has(seat.id))
        .map((seat) => seat.id);

      if (status === 'playing') {
        set({
          disconnectedIds,
          seats: seats.map((seat) =>
            seat.type === TYPE_HUMAN
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
          set({ error: 'That room is not a Snake & Ladder room', status: STATUS_ERROR });
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
          type: 'bot',
          color: SEAT_COLORS[0],
          seatIndex: 0,
          status: 'connected',
          ready: true,
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
