import { create } from 'zustand';
import { Room } from '@playdeck/game-types';

interface MultiplayerState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  currentRoom: Room | null;
  onlineCount: number;
  errorMessage: string | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  createRoomPlaceholder: (gameId: string) => Promise<void>;
  joinRoomPlaceholder: (roomCode: string) => Promise<void>;
  leaveRoom: () => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  connectionStatus: 'disconnected',
  currentRoom: null,
  onlineCount: 0,
  errorMessage: null,

  connect: async () => {
    set({ connectionStatus: 'connecting', errorMessage: null });
    // Reserved for WebSockets / WebRTC transport in Phase 2
    setTimeout(() => {
      set({
        connectionStatus: 'disconnected',
        errorMessage: 'Multiplayer servers launching in Phase 2.',
      });
    }, 400);
  },

  disconnect: () => {
    set({ connectionStatus: 'disconnected', currentRoom: null });
  },

  createRoomPlaceholder: async () => {
    set({ errorMessage: 'Multiplayer room creation is coming soon in Phase 2.' });
  },

  joinRoomPlaceholder: async () => {
    set({ errorMessage: 'Multiplayer room joining is coming soon in Phase 2.' });
  },

  leaveRoom: () => {
    set({ currentRoom: null });
  },
}));
