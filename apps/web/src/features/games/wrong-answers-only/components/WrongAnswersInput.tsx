'use client';

import { CheckCircle2, Clock, FastForward, HelpCircle, Send } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button, Input } from '@playdeck/ui';

import type { WrongAnswersPlayer, WrongAnswersQuestion } from '../types/wrong-answers.types';

export interface WrongAnswersInputProps {
  question: WrongAnswersQuestion;
  roundNumber: number;
  totalRounds: number;
  timeRemaining: number;
  players: WrongAnswersPlayer[];
  localPlayerId: string | null;
  hasSubmitted: boolean;
  isHost: boolean;
  onSubmit: (text: string) => void;
  onSkipToDiscussion: () => void;
}

export const WrongAnswersInput: React.FC<WrongAnswersInputProps> = ({
  question,
  roundNumber,
  totalRounds,
  timeRemaining,
  players,
  localPlayerId,
  hasSubmitted,
  isHost,
  onSubmit,
  onSkipToDiscussion,
}) => {
  const [text, setText] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
  };

  const submittedCount = players.filter((p) => p.hasSubmitted).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Top Bar */}
      <div className="flex justify-between items-center border-b border-amber-900/30 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="arcade" className="text-xs border-amber-500/50 text-amber-300">
            Round {roundNumber} of {totalRounds}
          </Badge>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
            Category: {question.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{timeRemaining}s</span>
          </div>

          {isHost && (
            <Button
              onClick={onSkipToDiscussion}
              variant="outline"
              className="text-xs py-1 px-2.5 border-slate-700 hover:border-amber-500 flex items-center gap-1"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reveal Answers</span>
            </Button>
          )}
        </div>
      </div>

      {/* The Question Spotlight Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#11192e] to-[#0d1424] border border-amber-600/40 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-2 right-3 text-[10px] font-mono tracking-wider uppercase text-amber-500/60 font-bold">
          Wrong Answers Only
        </div>
        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
          The Prompt
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
          "{question.prompt}"
        </h2>
        {question.subtext && (
          <p className="text-xs sm:text-sm text-slate-400 italic mt-2.5">{question.subtext}</p>
        )}
      </div>

      {/* Answer Submission Form */}
      <div className="p-4 rounded-xl bg-[#11192e] border border-slate-800/80">
        {hasSubmitted ? (
          <div className="text-center py-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold text-sm">Fake Answer Locked In!</span>
            </div>
            <p className="text-xs text-slate-400">
              Waiting for other comedians to finish writing their hilarious lies...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex justify-between items-center">
              <label
                htmlFor="wrong-answer-input"
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Craft Your Falsehood:</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{text.length}/150</span>
            </div>

            <div className="flex gap-2">
              <Input
                id="wrong-answer-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 150))}
                placeholder="Write an outrageous, believable, or punny fake answer..."
                className="bg-black/40 border-slate-700 text-sm focus:border-amber-500 rounded-xl"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!text.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-950 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Submission Progress Footer */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Submissions Received</span>
          <span className="font-mono text-amber-400 font-bold">
            {submittedCount} / {players.length}
          </span>
        </div>

        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(submittedCount / Math.max(1, players.length)) * 100}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {players.map((p) => {
            const isLocal = p.id === localPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                  p.hasSubmitted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{isLocal ? 'You' : p.displayName}</span>
                {p.hasSubmitted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
