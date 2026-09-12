'use client';

import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { IconButton } from '@/components/ui';
import { QUICK_CHAT_MESSAGES } from '../chat.constants';

interface RoomChatInputProps {
  onSendMessage: (text: string) => void;
}

export function RoomChatInput({ onSendMessage }: RoomChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <div className="p-2 border-t border-surface-border bg-surface-base flex flex-col gap-2">
      {/* Quick chat pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {QUICK_CHAT_MESSAGES.map((msg) => (
          <button
            key={msg}
            type="button"
            onClick={() => onSendMessage(msg)}
            className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-surface-raised hover:bg-surface-overlay border border-surface-border text-deck-300 hover:text-white transition-colors"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <input
          type="text"
          placeholder="Send a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-surface-raised border border-surface-border focus:outline-none focus:border-amber-500 text-deck-100 placeholder:text-deck-500"
        />
        <IconButton
          type="submit"
          aria-label="Send message"
          variant="primary"
          size="sm"
          disabled={!text.trim()}
          className="shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </IconButton>
      </form>
    </div>
  );
}
