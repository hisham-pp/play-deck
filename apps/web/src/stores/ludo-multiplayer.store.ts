import { create } from 'zustand';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { LudoAction, LudoPlayer } from '@/features/games/ludo/types/ludo.types';
import { fillEmptySeatsWithBots } from '@/features/games/ludo/bots/bot-fill';
import { finalizeSeats } from '@/features/games/ludo/utils/finalize-seats';

interface LudoMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: LudoPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (hostPlayer: { id: string; displayName: string; avatar: string }) => Promise<string | null>;
  joinRoomByCode: (code: string, player: { id: string; displayName: string; avatar: string }) => Promise<boolean>;
  leaveRoom: () => void;
  addBot: () => void;
  fillRemainingWithBots: (targetSeatCount?: number) => void;
  toggleReady: (playerId: string) => void;
  broadcastAction: (action: LudoAction) => void;
}

export const useLudoMultiplayerStore = create<LudoMultiplayerState>((set, get) => ({
  roomCode: null,
  hostId: null,
  status: 'idle',
  players: [],
  transport: null,
  error: null,

  createRoom: async (hostPlayer) => {
    try {
      const room = await RoomService.createRoom(hostPlayer.id, 'ludo');
      const transport = new SupabaseTransportService('ludo');

      const initialHostSeat: LudoPlayer = {
        id: hostPlayer.id,
        displayName: hostPlayer.displayName,
        avatar: hostPlayer.avatar,
        type: 'human',
        color: 'red',
        seatIndex: 0,
        status: 'connected',
        ready: true,
      };

      const presence: PlayerPresence = {
        playerId: hostPlayer.id,
        displayName: hostPlayer.displayName,
        avatar: hostPlayer.avatar,
        role: 'host',
      };

      await transport.connect(room.code, presence);

      set({
        roomCode: room.code,
        hostId: hostPlayer.id,
        status: 'lobby',
        players: [initialHostSeat],
        transport,
        error: null,
      });

      return room.code;
    } catch {
      set({ error: 'Failed to create room' });
      return null;
    }
  },

  joinRoomByCode: async (code, player) => {
    try {
      const transport = new SupabaseTransportService('ludo');
      const presence: PlayerPresence = {
        playerId: player.id,
        displayName: player.displayName,
        avatar: player.avatar,
        role: 'guest',
      };

      const connected = await transport.connect(code, presence);
      if (!connected) {
        set({ error: 'Could not connect to room' });
        return false;
      }

      set((state) => {
        const nextSeatIndex = state.players.length;
        const colors: ('red' | 'green' | 'yellow' | 'blue' | 'cyan' | 'purple')[] = [
          'red',
          'green',
          'yellow',
          'blue',
          'cyan',
          'purple',
        ];
        const newPlayer: LudoPlayer = {
          id: player.id,
          displayName: player.displayName,
          avatar: player.avatar,
          type: 'human',
          color: colors[nextSeatIndex % colors.length],
          seatIndex: nextSeatIndex,
          status: 'connected',
          ready: true,
        };

        return {
          roomCode: code,
          status: 'lobby',
          players: [...state.players, newPlayer],
          transport,
          error: null,
        };
      });

      return true;
    } catch {
      set({ error: 'Failed to join room' });
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
      status: 'idle',
      players: [],
      transport: null,
      error: null,
    });
  },

  addBot: () => {
    set((state) => {
      const targetCount = Math.min(6, state.players.length + 1);
      const seatSlots: (LudoPlayer | null)[] = Array.from({ length: targetCount }, (_, i) => state.players[i] ?? null);
      const filled = fillEmptySeatsWithBots(seatSlots);
      return { players: finalizeSeats(filled) };
    });
  },

  fillRemainingWithBots: (targetSeatCount = 4) => {
    set((state) => {
      const seatSlots: (LudoPlayer | null)[] = Array.from({ length: targetSeatCount }, (_, i) => state.players[i] ?? null);
      const filled = fillEmptySeatsWithBots(seatSlots);
      return { players: finalizeSeats(filled) };
    });
  },

  toggleReady: (playerId) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, ready: !p.ready } : p,
      ),
    }));
  },

  broadcastAction: (action) => {
    const { transport, hostId } = get();
    if (transport && hostId) {
      transport.send('ludo-action', action, hostId);
    }
  },
}));
