'use client';

import React, { useRef, useState } from 'react';

import type { ChatMessage, SaboteurPlayer } from '../types/secret-saboteur.types';

export interface SaboteurDiscussionPanelProps {
  players: SaboteurPlayer[];
  chat: ChatMessage[];
  localPlayerId: string;
  timeRemaining: number;
  onSendMessage: (text: string) => void;
  onAddAccusation: (targetId: string) => void;
}

export function SaboteurDiscussionPanel({
  players,
  chat,
  localPlayerId,
  timeRemaining,
  onSendMessage,
  onAddAccusation,
}: SaboteurDiscussionPanelProps) {
  const [msgDraft, setMsgDraft] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activePlayers = players.filter((p) => !p.isDetained && p.id !== localPlayerId);

  const handleSend = () => {
    if (!msgDraft.trim()) return;
    onSendMessage(msgDraft.trim());
    setMsgDraft('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-100">🔍 Discussion Phase</h2>
        <span
          className="text-sm font-mono font-bold"
          style={{ color: timeRemaining <= 5 ? '#ef4444' : '#f59e0b' }}
        >
          {timeRemaining}s
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Discuss, accuse, and convince the crew before the Trial Vote.
      </p>

      {/* Accusation pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center">Accuse:</span>
        {activePlayers.map((p) => (
          <button
            key={p.id}
            id={`accuse-${p.id}-btn`}
            onClick={() => onAddAccusation(p.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border hover:opacity-80 transition-all"
            style={{ borderColor: p.color + '60', color: p.color, background: p.color + '12' }}
          >
            {p.avatar} {p.name.split(' ')[0]}
            {p.suspicionScore > 50 && <span className="text-red-400 ml-1">🔴</span>}
          </button>
        ))}
      </div>

      {/* Suspicion bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players
          .filter((p) => !p.isDetained)
          .map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <span className="text-base leading-none">{p.avatar}</span>
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${p.suspicionScore}%`,
                    background:
                      p.suspicionScore > 70
                        ? '#ef4444'
                        : p.suspicionScore > 40
                          ? '#f59e0b'
                          : '#10b981',
                  }}
                />
              </div>
              <span className="text-slate-500 w-6 text-right font-mono">{p.suspicionScore}</span>
            </div>
          ))}
      </div>

      {/* Chat */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 h-36 overflow-y-auto flex flex-col gap-2">
        {chat.length === 0 && (
          <p className="text-xs text-slate-600 m-auto">No messages yet. Break the silence.</p>
        )}
        {chat.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-0.5 max-w-[80%] ${msg.senderId === localPlayerId ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <span className="text-[10px] text-slate-500 font-mono">{msg.senderName}</span>
            <div
              className={`px-3 py-1.5 rounded-xl text-xs text-slate-100 ${
                msg.senderId === localPlayerId
                  ? 'bg-amber-500/20 border border-amber-500/30'
                  : 'bg-slate-800/80'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-slate-600">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          id="discussion-chat-input"
          type="text"
          placeholder="Say something..."
          value={msgDraft}
          onChange={(e) => setMsgDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          maxLength={200}
          className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60"
        />
        <button
          id="discussion-send-btn"
          onClick={handleSend}
          disabled={!msgDraft.trim()}
          className="px-4 py-2 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-40 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
