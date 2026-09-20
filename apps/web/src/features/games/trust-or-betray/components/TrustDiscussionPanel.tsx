'use client';

import React, { useState } from 'react';

import type { ChatMessage, TrustPlayer } from '../types/trust-or-betray.types';

export interface TrustDiscussionPanelProps {
  chat: ChatMessage[];
  players: TrustPlayer[];
  timeRemaining: number;
  onSendMessage: (text: string) => void;
}

const QUICK_PHRASES = [
  'I cooperated! Who backstabbed us?',
  'Let’s swear to cooperate next round!',
  'Watch out for the score leader!',
  'I vote we exile the serial saboteur!',
  'Trust is broken. Prepare for consequences.',
];

export function TrustDiscussionPanel({
  chat,
  players,
  timeRemaining,
  onSendMessage,
}: TrustDiscussionPanelProps) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const getPlayer = (senderId: string) => {
    return players.find((p) => p.id === senderId);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Discussion Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <div>
            <h3 className="text-base font-black text-slate-100">Discussion & Accusations</h3>
            <p className="text-[11px] text-slate-400">
              Bluff, negotiate, defend your choices, or form alliances before the next phase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-300">
          <span>⏱️</span>
          <span>{timeRemaining}s remaining</span>
        </div>
      </div>

      {/* Quick Accusation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {QUICK_PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => onSendMessage(phrase)}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 whitespace-nowrap transition-all cursor-pointer hover:border-amber-500/40"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="h-48 overflow-y-auto rounded-xl bg-slate-950/70 p-3.5 border border-slate-800/80 flex flex-col gap-2.5">
        {chat.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            No transmissions yet. Break the silence or accuse a saboteur!
          </div>
        ) : (
          chat.map((msg) => {
            const sender = getPlayer(msg.senderId);
            return (
              <div key={msg.id} className="flex items-start gap-2.5 text-xs animate-fadeIn">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 border border-slate-700/50"
                  style={{ backgroundColor: `${sender?.color ?? '#64748b'}30` }}
                >
                  {sender?.avatar ?? '👤'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{msg.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5 break-words">{msg.text}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an accusation, promise, or defense..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
