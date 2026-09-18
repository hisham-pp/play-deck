import { create } from 'zustand';
import type {
  CoursePreset,
  Player,
  PlayerGlyph,
} from '@/features/games/mini-golf/engine/mini-golf-types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const GAME_ID = 'mini-golf';
const DEFAULT_AVATAR = '⛳';
const STATUS_ERROR = 'error';

export const MAX_GOLF_SEATS = 4;
export const MIN_GOLF_SEATS = 1; // Solo or up to 4 in lobby

export const GOLF_SEAT_CONFIGS: { color: string; glyph: PlayerGlyph }[] = [
  { color: '#10b981', glyph: 'circle' },
  { color: '#38bdf8', glyph: 'diamond' },
  { color: '#f59e0b', glyph: 'star' },
  { color: '#ec4899', glyph: 'triangle' },
];

export interface GolfPlayerSeat extends Player {
  seatIndex: number;
  displayName: string;
  avatar: string;
  status: 'connected' | 'disconnected';
  isHost: boolean;
}

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface MiniGolfMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  seats: GolfPlayerSeat[];
  disconnectedIds: string[];
  coursePreset: CoursePreset;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  setCoursePreset: (preset: CoursePreset) => void;
  publishSeats: (seats: GolfPlayerSeat[]) => void;
  adoptSeats: (seats: GolfPlayerSeat[]) => void;
  setStatus: (status: MiniGolfMultiplayerState['status']) => void;
  isHost: () => boolean;
  getTransport: () => SupabaseTransportService | null;
}

function toPresence(seat: GolfPlayerSeat, hostId: string | null): PlayerPresence {
  return {
    playerId: seat.id,
    displayName: seat.displayName,
    avatar: seat.avatar ?? DEFAULT_AVATAR,
    role: seat.id === hostId ? 'host' : 'guest',
  };
}

function createHumanSeat(
  presence: PlayerPresence,
  seatIndex: number,
  hostId: string | null,
): GolfPlayerSeat {
  const config = GOLF_SEAT_CONFIGS[seatIndex % GOLF_SEAT_CONFIGS.length];
  return {
    id: presence.playerId,
    name: presence.displayName,
    displayName: presence.displayName,
    avatar: presence.avatar,
    color: config.color,
    glyph: config.glyph,
    seatIndex,
    status: 'connected',
    isHost: presence.playerId === hostId,
  };
}

function reconcileSeats(
  presence: PlayerPresence[],
  hostId: string | null,
  bots: GolfPlayerSeat[],
): GolfPlayerSeat[] {
  const humans = [...presence].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.playerId.localeCompare(b.playerId);
  });

  const seated: GolfPlayerSeat[] = [];
  for (const person of humans) {
    if (seated.length >= MAX_GOLF_SEATS) break;
    seated.push(createHumanSeat(person, seated.length, hostId));
  }
  for (const bot of bots) {
    if (seated.length >= MAX_GOLF_SEATS) break;
    const config = GOLF_SEAT_CONFIGS[seated.length % GOLF_SEAT_CONFIGS.length];
    seated.push({
      ...bot,
      seatIndex: seated.length,
      color: config.color,
      glyph: config.glyph,
    });
  }
  return seated;
}

export const useMiniGolfMultiplayerStore = create<MiniGolfMultiplayerState>((set, get) => {
  let bots: GolfPlayerSeat[] = [];

  function rebuildFromSeats(): GolfPlayerSeat[] {
    const { seats, hostId } = get();
    const humans = seats.filter((seat) => !seat.isAi);
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

      const disconnectedIds = seats
        .filter((seat) => !seat.isAi && !presentIds.has(seat.id))
        .map((seat) => seat.id);

      if (status === 'playing') {
        set({
          disconnectedIds,
          seats: seats.map((seat) =>
            !seat.isAi
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
    coursePreset: 'front-9',
    transport: null,
    error: null,

    createRoom: async (host: RoomIdentity) => {
      bots = [];
      const transport = new SupabaseTransportService();
      try {
        const room = await RoomService.createRoom(GAME_ID, host.id);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || DEFAULT_AVATAR,
          role: 'host',
        };

        await transport.connect(room.code, presence);
        attachPresence(transport);

        const initialSeat = createHumanSeat(presence, 0, host.id);
        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          seats: [initialSeat],
          disconnectedIds: [],
          coursePreset: 'front-9',
          transport,
          error: null,
        });

        return room.code;
      } catch {
        set({ status: STATUS_ERROR, error: 'Failed to create room' });
        return null;
      }
    },

    joinRoomByCode: async (code: string, identity: RoomIdentity) => {
      bots = [];
      const cleanCode = code.trim().toUpperCase();
      const transport = new SupabaseTransportService();
      try {
        const room = await RoomService.fetchRoomByCode(cleanCode, GAME_ID);
        if (!room) {
          set({ status: STATUS_ERROR, error: 'Room not found' });
          return false;
        }

        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || DEFAULT_AVATAR,
          role: 'guest',
        };

        await RoomService.joinRoom(cleanCode, identity.id);
        await transport.connect(cleanCode, presence);
        attachPresence(transport);

        set({
          roomCode: cleanCode,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          seats: [],
          disconnectedIds: [],
          coursePreset: 'front-9',
          transport,
          error: null,
        });

        return true;
      } catch {
        set({ status: STATUS_ERROR, error: 'Failed to join room' });
        return false;
      }
    },

    leaveRoom: () => {
      const { transport } = get();
      bots = [];
      if (transport) {
        transport.disconnect();
      }
      set({
        roomCode: null,
        hostId: null,
        localPlayerId: null,
        status: 'idle',
        seats: [],
        disconnectedIds: [],
        coursePreset: 'front-9',
        transport: null,
        error: null,
      });
    },

    addBot: () => {
      const { seats, isHost, publishSeats } = get();
      if (!isHost() || seats.length >= MAX_GOLF_SEATS) return;

      const botIndex = bots.length + 1;
      const config = GOLF_SEAT_CONFIGS[seats.length % GOLF_SEAT_CONFIGS.length];
      const bot: GolfPlayerSeat = {
        id: `ai-bot-${botIndex}-${Date.now()}`,
        name: `Ace Bot ${botIndex}`,
        displayName: `Ace Bot ${botIndex}`,
        avatar: '🤖',
        isAi: true,
        color: config.color,
        glyph: config.glyph,
        seatIndex: seats.length,
        status: 'connected',
        isHost: false,
      };

      bots = [...bots, bot];
      const nextSeats = rebuildFromSeats();
      set({ seats: nextSeats });
      publishSeats(nextSeats);
    },

    removeBot: (botId: string) => {
      const { isHost, publishSeats } = get();
      if (!isHost()) return;

      bots = bots.filter((b) => b.id !== botId);
      const nextSeats = rebuildFromSeats();
      set({ seats: nextSeats });
      publishSeats(nextSeats);
    },

    setCoursePreset: (coursePreset: CoursePreset) => {
      set({ coursePreset });
      const { transport, localPlayerId, isHost } = get();
      if (isHost() && transport && localPlayerId) {
        transport.send('GOLF_SET_PRESET', { coursePreset }, localPlayerId);
      }
    },

    publishSeats: (seats: GolfPlayerSeat[]) => {
      const { transport, localPlayerId } = get();
      if (transport && localPlayerId) {
        transport.send('GOLF_SEATS', { seats }, localPlayerId);
      }
    },

    adoptSeats: (seats: GolfPlayerSeat[]) => {
      set({ seats });
    },

    setStatus: (status) => {
      set({ status });
    },

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    getTransport: () => get().transport,
  };
});
