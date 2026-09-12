import { create } from 'zustand';
import type { ChatMessage } from '@playdeck/game-types';
import { RoomChatService } from '@/features/chat/services/room-chat.service';

export interface RoomChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;

  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  addMessage: (msg: ChatMessage) => void;
  sendMessage: (
    roomCode: string,
    sender: { id: string; name: string; avatar: string },
    text: string,
  ) => Promise<void>;
  loadRoomMessages: (roomCode: string) => Promise<void>;
  clearMessages: () => void;
}

export const useRoomChatStore = create<RoomChatState>((set, get) => ({
  messages: [],
  unreadCount: 0,
  isChatOpen: false,

  setChatOpen: (open) => {
    set({ isChatOpen: open, unreadCount: open ? 0 : get().unreadCount });
  },

  toggleChat: () => {
    const next = !get().isChatOpen;
    set({ isChatOpen: next, unreadCount: next ? 0 : get().unreadCount });
  },

  addMessage: (msg) => {
    const exists = get().messages.some((m) => m.id === msg.id);
    if (exists) return;
    const isClosed = !get().isChatOpen;
    set((state) => ({
      messages: [...state.messages, msg],
      unreadCount: isClosed ? state.unreadCount + 1 : 0,
    }));
  },

  sendMessage: async (roomCode, sender, text) => {
    const clean = text.trim();
    if (!clean) return;
    const msg = RoomChatService.createMessage(roomCode, sender, clean);
    get().addMessage(msg);
    await RoomChatService.broadcastMessage(msg);
  },

  loadRoomMessages: async (roomCode) => {
    const msgs = await RoomChatService.fetchMessages(roomCode);
    set({ messages: msgs, unreadCount: 0 });
  },

  clearMessages: () => set({ messages: [], unreadCount: 0, isChatOpen: false }),
}));
