'use client';

import { Bot, Copy, HelpCircle, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { IdentityCategory, WhoAmIPlayer } from '../types/who-am-i.types';

export interface WhoAmILobbyProps {
  roomCode: string | null;
  players: WhoAmIPlayer[];
  localPlayerId: string | null;
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  selectedCategory: IdentityCategory;
  onSelectCategory: (cat: IdentityCategory) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
}

const CATEGORIES: Array<{ id: IdentityCategory; label: string; icon: string }> = [
  { id: 'all', label: 'All Mixed Up', icon: '🎲' },
  { id: 'animals', label: 'Wild Animals', icon: '🦁' },
  { id: 'movie-characters', label: 'Movie Heroes & Villains', icon: '🎬' },
  { id: 'famous-people', label: 'Famous Celebrities', icon: '⭐' },
  { id: 'professions', label: 'Professions', icon: '🚀' },
  { id: 'historical-figures', label: 'Historical Icons', icon: '📜' },
  { id: 'objects', label: 'Everyday Objects', icon: '🍕' },
];

export const WhoAmILobby: React.FC<WhoAmILobbyProps> = ({
  roomCode,
  players,
  localPlayerId,
  isHost,
  minPlayers,
  maxPlayers,
  selectedCategory,
  onSelectCategory,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const canStart = players.length >= minPlayers && isHost;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight flex items-center gap-2">
              <span>❓ Who Am I?</span>
            </h1>
            <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
              Headband Party
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everyone sees your secret identity except you! Ask Yes/No questions to deduce who you
            are.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showRules ? 'Hide Rules' : 'How to Play'}</span>
        </button>
      </div>

      {/* Rules Accordion */}
      {showRules && (
        <div className="bg-slate-900/80 border border-amber-900/30 p-4 rounded-xl text-xs sm:text-sm text-slate-300 space-y-2 animate-fadeIn">
          <div className="font-semibold text-amber-300">
            <span>🎭 Headband Q&A Rules:</span>
          </div>
          <p>
            1. <strong>Secret Headband</strong>: A mystery identity is placed on your forehead. All
            other players can see it, but you only see "???".
          </p>
          <p>
            2. <strong>Ask Yes/No Questions</strong>: On your turn, ask a question (e.g. "Am I
            alive?", "Am I fictional?", "Can I fly?").
          </p>
          <p>
            3. <strong>Group Answers</strong>: Other players click Yes, No, or Maybe (or answer over
            voice chat).
          </p>
          <p>
            4. <strong>Guess or Pass</strong>: Take a guess or pass. Correct guess earns massive
            points and solves your identity!
          </p>
          <p>
            5. <strong>Detective Award</strong>: The player who solves their identity with the
            fewest questions wins Master Detective!
          </p>
        </div>
      )}

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Identity Deck Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              disabled={!isHost}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
              } ${!isHost ? 'cursor-default' : ''}`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-bold truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Room Code & Invite */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-amber-950/50 rounded-lg text-amber-400 border border-amber-900/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">ROOM CODE</div>
            <div className="text-xl font-mono font-bold tracking-widest text-amber-300">
              {roomCode ?? 'CONNECTING...'}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="w-full sm:w-auto border-amber-900/40 hover:bg-amber-950/30 text-amber-300"
        >
          <Copy className="w-3.5 h-3.5 mr-1.5" />
          {copied ? 'Copied Link!' : 'Invite Friends'}
        </Button>
      </div>

      {/* Players List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>
            Players in Room ({players.length} / {maxPlayers})
          </span>
          <span>Min {minPlayers} required</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p) => {
            const isLocal = p.id === localPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isLocal
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{p.avatar}</span>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate flex items-center gap-2">
                      {p.displayName}
                      {isLocal && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      {p.isHost && <span className="text-amber-400 font-semibold">Host</span>}
                      {p.isBot && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Bot className="w-3 h-3" /> Bot
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isHost && p.isBot && (
                  <button
                    type="button"
                    onClick={() => onRemoveBot(p.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
                    title="Remove bot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-900/30">
        <div>
          {isHost && players.length < maxPlayers && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddBot}
              className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-amber-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add AI Guesser
            </Button>
          )}
        </div>

        <div>
          {isHost ? (
            <Button
              variant="primary"
              size="lg"
              disabled={!canStart}
              onClick={onStartGame}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 shadow-lg shadow-amber-500/20"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              {players.length < minPlayers
                ? `Need ${minPlayers - players.length} more player(s)`
                : 'Deal Headbands'}
            </Button>
          ) : (
            <span className="text-xs text-slate-400">Waiting for host to deal identities...</span>
          )}
        </div>
      </div>
    </div>
  );
};
