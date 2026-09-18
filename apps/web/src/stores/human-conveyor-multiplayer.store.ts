import { create } from 'zustand';
import {
  CONVEYOR_COLORS,
  CONVEYOR_GLYPHS,
} from '@/features/games/human-conveyor-belt/engine/conveyor-engine';
import { CONVEYOR_LAYOUTS } from '@/features/games/human-conveyor-belt/engine/conveyor-layouts';
import type { ConveyorGlyph } from '@/features/games/human-conveyor-belt/engine/conveyor-types';
import {
  SupabaseTransportService,
  type PlayerPresence,
} from '@/features/multiplayer/services/supabase-transport.service';

export const MAX_CONVEYOR_SEATS = 6;
export const MIN_CONVEYOR_SEATS = 2;

export interface ConveyorPlayerSeat {
  seatIndex: number;
  playerId: string | null;
  displayName: string | null;
  avatar: string;
  color: string;
  glyph: ConveyorGlyph;
  isBot: boolean;
  isReady: boolean;
  isHost: boolean;
}

export interface HumanConveyorMultiplayerState {
  roomCode: string | null;
  isHost: boolean;
  localPlayerId: string | null;
  localSeatIndex: number | null;
  transport: SupabaseTransportService | null;
  seats: ConveyorPlayerSeat[];
  selectedLayoutId: string;
  status: 'idle' | 'in-lobby' | 'playing';
  error: string | null;

  createRoom: (hostPlayer: { id: string; displayName: string; avatar?: string }) => Promise<string>;
  joinRoomByCode: (
    code: string,
    player: { id: string; displayName: string; avatar?: string },
  ) => Promise<boolean>;
  leaveRoom: () => void;
  toggleBot: (seatIndex: number) => void;
  setLayout: (layoutId: string) => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
}

function createDefaultSeats(): ConveyorPlayerSeat[] {
  return Array.from({ length: MAX_CONVEYOR_SEATS }, (_, idx) => ({
    seatIndex: idx,
    playerId: null,
    displayName: null,
    avatar: '🤖',
    color: CONVEYOR_COLORS[idx % CONVEYOR_COLORS.length],
    glyph: CONVEYOR_GLYPHS[idx % CONVEYOR_GLYPHS.length],
    isBot: idx > 1, // Seats 2-5 default to bots if unassigned
    isReady: false,
    isHost: false,
  }));
}

export const useHumanConveyorMultiplayerStore = create<HumanConveyorMultiplayerState>(
  (set, get) => ({
    roomCode: null,
    isHost: false,
    localPlayerId: null,
    localSeatIndex: null,
    transport: null,
    seats: createDefaultSeats(),
    selectedLayoutId: CONVEYOR_LAYOUTS[0].id,
    status: 'idle',
    error: null,

    createRoom: async (hostPlayer) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const transport = new SupabaseTransportService('human-conveyor');

      const seats = createDefaultSeats();
      seats[0] = {
        ...seats[0],
        playerId: hostPlayer.id,
        displayName: hostPlayer.displayName,
        avatar: hostPlayer.avatar || '⚙️',
        isBot: false,
        isReady: true,
        isHost: true,
      };

      const playerPresence: PlayerPresence = {
        playerId: hostPlayer.id,
        displayName: hostPlayer.displayName,
        avatar: hostPlayer.avatar || '⚙️',
        role: 'host',
      };

      set({
        roomCode: code,
        isHost: true,
        localPlayerId: hostPlayer.id,
        localSeatIndex: 0,
        transport,
        seats,
        status: 'in-lobby',
        error: null,
      });

      await transport.connect(code, playerPresence);
      return code;
    },

    joinRoomByCode: async (code, player) => {
      const cleanedCode = code.trim();
      if (!/^\d{6}$/.test(cleanedCode)) {
        set({ error: 'Please enter a valid 6-digit room code' });
        return false;
      }

      const transport = new SupabaseTransportService('human-conveyor');
      const seats = createDefaultSeats();
      // Claim seat 1 for joining player initially
      seats[1] = {
        ...seats[1],
        playerId: player.id,
        displayName: player.displayName,
        avatar: player.avatar || '🕹️',
        isBot: false,
        isReady: true,
        isHost: false,
      };

      const playerPresence: PlayerPresence = {
        playerId: player.id,
        displayName: player.displayName,
        avatar: player.avatar || '🕹️',
        role: 'guest',
      };

      set({
        roomCode: cleanedCode,
        isHost: false,
        localPlayerId: player.id,
        localSeatIndex: 1,
        transport,
        seats,
        status: 'in-lobby',
        error: null,
      });

      const ok = await transport.connect(cleanedCode, playerPresence);
      if (!ok) {
        set({ error: 'Failed to connect to room channel' });
        return false;
      }
      return true;
    },

    leaveRoom: () => {
      const { transport } = get();
      if (transport) {
        transport.disconnect();
      }
      set({
        roomCode: null,
        isHost: false,
        localPlayerId: null,
        localSeatIndex: null,
        transport: null,
        seats: createDefaultSeats(),
        status: 'idle',
        error: null,
      });
    },

    toggleBot: (seatIndex) => {
      const { seats, isHost } = get();
      if (!isHost || seatIndex === 0) return;

      const targetSeat = seats[seatIndex];
      if (!targetSeat || targetSeat.playerId !== null) return;

      const updated = seats.map((s, idx) => (idx === seatIndex ? { ...s, isBot: !s.isBot } : s));
      set({ seats: updated });
    },

    setLayout: (layoutId) => {
      const { isHost, transport, localPlayerId } = get();
      if (!isHost) return;
      set({ selectedLayoutId: layoutId });
      if (transport) {
        transport.send('conveyor:layout_change', { layoutId }, localPlayerId || 'host');
      }
    },

    setReady: (ready) => {
      const { seats, localSeatIndex, transport, localPlayerId } = get();
      if (localSeatIndex === null) return;

      const updated = seats.map((s, idx) =>
        idx === localSeatIndex ? { ...s, isReady: ready } : s,
      );
      set({ seats: updated });

      if (transport) {
        transport.send(
          'conveyor:player_ready',
          {
            seatIndex: localSeatIndex,
            isReady: ready,
          },
          localPlayerId || 'player',
        );
      }
    },

    startGame: () => {
      const { isHost, transport, selectedLayoutId, localPlayerId } = get();
      if (!isHost) return;

      set({ status: 'playing' });
      if (transport) {
        transport.send(
          'conveyor:start_game',
          { layoutId: selectedLayoutId },
          localPlayerId || 'host',
        );
      }
    },
  }),
);
