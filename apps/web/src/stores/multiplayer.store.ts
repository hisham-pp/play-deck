import { create } from 'zustand';
import type { Player, Room } from '@playdeck/game-types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import {
  PlayerPresence,
  SupabaseTransportService,
  TransportMessage,
} from '@/features/multiplayer/services/supabase-transport.service';

const transport = new SupabaseTransportService();

export interface MultiplayerState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  currentRoom: Room | null;
  roomCode: string | null;
  role: 'host' | 'guest' | null;
  myMark: 'X' | 'O' | null;
  opponent: PlayerPresence | null;
  errorMessage: string | null;
  isLobbyOpen: boolean;

  setLobbyOpen: (open: boolean) => void;
  createRoom: (gameId: string, player: Player) => Promise<string | null>;
  joinRoomByCode: (code: string, player: Player) => Promise<boolean>;
  leaveRoom: () => void;
  sendGameAction: (type: string, payload: unknown, senderId: string) => void;
  onActionReceived: (callback: (msg: TransportMessage) => void) => () => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  connectionStatus: 'disconnected',
  currentRoom: null,
  roomCode: null,
  role: null,
  myMark: null,
  opponent: null,
  errorMessage: null,
  isLobbyOpen: false,

  setLobbyOpen: (open) => set({ isLobbyOpen: open, errorMessage: null }),

  createRoom: async (gameId, player) => {
    set({ connectionStatus: 'connecting', errorMessage: null });
    try {
      const room = await RoomService.createRoom(gameId, player.id);
      const presence: PlayerPresence = {
        playerId: player.id,
        displayName: player.displayName,
        avatar: player.avatar || '🕹️',
        role: 'host',
      };

      await transport.connect(room.code, presence);
      transport.onPresence((players) => {
        const other = players.find((p) => p.playerId !== player.id) || null;
        set({ opponent: other });
      });

      set({
        currentRoom: room,
        roomCode: room.code,
        role: 'host',
        myMark: 'X',
        connectionStatus: 'connected',
      });
      return room.code;
    } catch {
      set({ connectionStatus: 'error', errorMessage: 'Failed to create room' });
      return null;
    }
  },

  joinRoomByCode: async (code, player) => {
    const cleanCode = code.trim();
    set({ connectionStatus: 'connecting', errorMessage: null });
    try {
      const room = await RoomService.fetchRoomByCode(cleanCode);
      if (!room) {
        set({ connectionStatus: 'error', errorMessage: 'Invalid room code' });
        return false;
      }

      await RoomService.joinRoom(cleanCode, player.id);
      const presence: PlayerPresence = {
        playerId: player.id,
        displayName: player.displayName,
        avatar: player.avatar || '🕹️',
        role: 'guest',
      };

      await transport.connect(cleanCode, presence);
      transport.onPresence((players) => {
        const other = players.find((p) => p.playerId !== player.id) || null;
        set({ opponent: other });
      });

      set({
        currentRoom: room,
        roomCode: cleanCode,
        role: 'guest',
        myMark: 'O',
        connectionStatus: 'connected',
        isLobbyOpen: false,
      });
      return true;
    } catch {
      set({ connectionStatus: 'error', errorMessage: 'Failed to join room' });
      return false;
    }
  },

  leaveRoom: () => {
    const code = get().roomCode;
    if (code) RoomService.closeRoom(code);
    transport.disconnect();
    set({
      currentRoom: null,
      roomCode: null,
      role: null,
      myMark: null,
      opponent: null,
      connectionStatus: 'disconnected',
      isLobbyOpen: false,
    });
  },

  sendGameAction: (type, payload, senderId) => {
    transport.send(type, payload, senderId);
  },

  onActionReceived: (callback) => {
    return transport.onAction(callback);
  },
}));
