'use client';

import { ChevronDown, MessageSquare } from 'lucide-react';
import React, { useEffect } from 'react';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { useRoomChatStore } from '@/stores/room-chat.store';
import { RoomChatInput } from './RoomChatInput';
import { RoomChatMessageList } from './RoomChatMessageList';

interface RoomChatBoxProps {
  roomCode: string;
}

export function RoomChatBox({ roomCode }: RoomChatBoxProps) {
  const { player } = usePlayerStore();
  const { onChatMessage } = useMultiplayerStore();
  const {
    messages,
    unreadCount,
    isChatOpen,
    toggleChat,
    addMessage,
    sendMessage,
    loadRoomMessages,
  } = useRoomChatStore();

  useEffect(() => {
    if (!roomCode) return;
    loadRoomMessages(roomCode);

    const unsubscribe = onChatMessage((msg) => {
      addMessage(msg);
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, onChatMessage, addMessage, loadRoomMessages]);

  const handleSend = (text: string) => {
    if (!player) return;
    const sender = {
      id: player.id,
      name: player.displayName,
      avatar: player.avatar || '🕹️',
    };
    sendMessage(roomCode, sender, text);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 shadow-2xl rounded-2xl overflow-hidden border border-surface-border bg-surface-base flex flex-col transition-all">
      {/* Header / Toggle bar */}
      <button
        type="button"
        onClick={toggleChat}
        className="w-full flex items-center justify-between p-3 bg-surface-raised border-b border-surface-border hover:bg-surface-overlay transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-deck-100 uppercase tracking-wider font-mono">
            Room Chat
          </span>
          {unreadCount > 0 && !isChatOpen && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-deck-950 font-black text-[9px] animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-deck-400 transition-transform ${isChatOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* Body */}
      {isChatOpen && (
        <div className="flex flex-col h-72 bg-surface-base">
          <RoomChatMessageList messages={messages} />
          <RoomChatInput onSendMessage={handleSend} />
        </div>
      )}
    </div>
  );
}
