'use client';

import { Check, CheckCircle2, Clock, HelpCircle, Send } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button, Input } from '@playdeck/ui';

import type { LiePlayer, LiePrompt } from '../types/guess-the-lie.types';

export interface LieAnswerInputProps {
  prompt: LiePrompt;
  player: LiePlayer;
  allPlayers: LiePlayer[];
  submittedCount: number;
  timeLeft: number;
  onSubmitAnswer: (text: string) => void;
  hasSubmitted: boolean;
}

export const LieAnswerInput: React.FC<LieAnswerInputProps> = ({
  prompt,
  player,
  allPlayers,
  submittedCount,
  timeLeft,
  onSubmitAnswer,
  hasSubmitted,
}) => {
  const [answerText, setAnswerText] = useState<string>('');
  const isLiar = player.role === 'liar';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answerText.trim() || hasSubmitted) return;
    onSubmitAnswer(answerText.trim());
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-indigo-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Top Banner: Category & Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/30 pb-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="uppercase font-mono text-xs border-indigo-400 text-indigo-300 px-2.5 py-0.5"
          >
            {prompt.category}
          </Badge>
          <span className="text-xs text-slate-400 font-mono">
            {submittedCount} of {allPlayers.length} Submitted
          </span>
        </div>

        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
            timeLeft <= 10
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-[#141e33] border-indigo-500/40 text-indigo-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Main Question Box */}
      <div className="p-6 rounded-2xl bg-[#11192d] border border-indigo-800/40 shadow-xl text-center">
        <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 block mb-2 font-bold">
          The Question
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
          {prompt.question}
        </h2>
        {prompt.hint && (
          <p className="text-xs text-slate-400 mt-2 italic flex items-center justify-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hint: {prompt.hint}</span>
          </p>
        )}
      </div>

      {/* Role Reminder */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
          isLiar
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{isLiar ? '🤫' : '😇'}</span>
          <span>
            {isLiar
              ? 'You are the Liar! Enter a plausible, believable fake answer.'
              : 'You are a Truth-teller! Enter a genuine, truthful answer.'}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-mono ${
            isLiar ? 'border-rose-400 text-rose-300' : 'border-emerald-400 text-emerald-300'
          }`}
        >
          {isLiar ? 'Lie' : 'Truth'}
        </Badge>
      </div>

      {/* Input Area */}
      {hasSubmitted ? (
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-center flex flex-col items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
          <h3 className="text-lg font-bold text-white">Answer Submitted!</h3>
          <p className="text-xs text-slate-400">
            Waiting for remaining players or timer to transition to the Discussion stage...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder={
                isLiar ? 'Type your clever bluff here...' : 'Type your truthful answer here...'
              }
              className="bg-[#121929] border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl py-3 px-4 flex-1 text-sm focus:border-indigo-400"
              maxLength={120}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!answerText.trim()}
              className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Submit</span>
            </Button>
          </div>
          <span className="text-[11px] text-slate-500 text-right font-mono">
            {answerText.length} / 120 characters
          </span>
        </form>
      )}

      {/* Player Progress Indicators */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2 justify-center">
        {allPlayers.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
              p.hasSubmitted
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-[#121929] border-slate-800 text-slate-400'
            }`}
          >
            <span>{p.avatar}</span>
            <span className="truncate max-w-[90px]">{p.displayName}</span>
            {p.hasSubmitted && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};
