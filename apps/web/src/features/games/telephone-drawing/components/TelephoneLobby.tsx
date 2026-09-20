'use client';

import { Bot, Copy, HelpCircle, Palette, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { TelephonePlayer } from '../types/telephone-drawing.types';

export interface TelephoneLobbyProps {
  roomCode: string | null;
  players: TelephonePlayer[];
  localPlayerId: string | null;
  isHost: boolean;
  minPlayers: number;
  maxPlayers: number;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
}

export const TelephoneLobby: React.FC<TelephoneLobbyProps> = ({
  roomCode,
  players,
  localPlayerId,
  isHost,
  minPlayers,
  maxPlayers,
  onAddBot,
  onRemoveBot,
  onStartGame,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  const canStart = players.length >= minPlayers && isHost;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    void navigator.clipboard.writeText(url).then(() => {
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
              <Palette className="w-7 h-7 text-amber-400" />
              Telephone Drawing
            </h1>
            <Badge variant="arcade" className="bg-amber-500/20 text-amber-300 border-amber-500/40">
              Chain Party
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Draw a phrase, describe a drawing, and watch the chain mutate into pure comedic chaos!
          </p>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors py-1 px-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showRules ? 'Hide Rules' : 'How to Play'}</span>
        </button>
      </div>

      {/* Rules Accordion */}
      {showRules && (
        <div className="bg-slate-900/80 border border-amber-900/30 p-4 rounded-xl text-xs sm:text-sm text-slate-300 space-y-2.5 animate-fadeIn">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <span>🎨 Chain Rules & Hilarious Mutations</span>
          </div>
          <p>
            1. <strong>Phrase Start</strong>: Player 1 gets a secret phrase and has 45 seconds to
            sketch it.
          </p>
          <p>
            2. <strong>Describe</strong>: Player 2 sees ONLY the drawing and guesses what it is in
            one short sentence.
          </p>
          <p>
            3. <strong>Draw Again</strong>: Player 3 sees ONLY that description and must draw it!
          </p>
          <p>
            4. <strong>The Reveal</strong>: Step through the entire slideshow together over voice
            chat and witness where the chain went off the rails.
          </p>
          <p>
            5. <strong>Vote</strong>: Award points for the Funniest Mutation (+200 pts) and
            accuracy!
          </p>
        </div>
      )}

      {/* Room Code & Share */}
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      </div>

      {/* Players Grid */}
      <div className="flex flex-col gap-3">
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
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
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
                          <Bot className="w-3 h-3" /> Bot ({p.botStyle ?? 'doodler'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Bot button (host only) */}
                {isHost && p.isBot && (
                  <button
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

      {/* Bot Controls & Start Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-900/30">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isHost && players.length < maxPlayers && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddBot}
              className="w-full sm:w-auto border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-amber-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add AI Sketcher
            </Button>
          )}
        </div>

        <div className="w-full sm:w-auto">
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
                : 'Start Chain'}
            </Button>
          ) : (
            <div className="text-center sm:text-right text-xs text-slate-400 py-2">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
