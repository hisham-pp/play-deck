'use client';

import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@playdeck/game-types';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';

interface RoomChatMessageListProps {
  messages: ChatMessage[];
}

export function RoomChatMessageList({ messages }: RoomChatMessageListProps) {
  const { player } = usePlayerStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-deck-500">
        <span className="text-2xl mb-1">💬</span>
        <span className="text-xs font-mono">No messages yet. Say hello!</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[220px]">
      {messages.map((msg) => {
        const isMe = player?.id === msg.senderId;

        return (
          <div key={msg.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] text-deck-400 font-semibold">{msg.senderName}</span>
              <span className="text-[9px] text-deck-500 font-mono">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div
              className={cn(
                'px-3 py-1.5 rounded-2xl text-xs max-w-[85%] break-words',
                isMe
                  ? 'bg-amber-500 text-deck-950 font-medium rounded-tr-none'
                  : 'bg-surface-raised border border-surface-border text-deck-100 rounded-tl-none',
              )}
            >
              {msg.message}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
