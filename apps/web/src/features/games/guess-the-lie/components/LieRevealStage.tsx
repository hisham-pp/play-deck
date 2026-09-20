'use client';

import { ArrowRight, CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type {
  GuessTheLieRoundResult,
  LiePlayer,
  LiePrompt,
  SubmittedAnswer,
} from '../types/guess-the-lie.types';

export interface LieRevealStageProps {
  prompt: LiePrompt;
  answers: SubmittedAnswer[];
  roundResult: GuessTheLieRoundResult | null;
  players: LiePlayer[];
  isHost: boolean;
  onProceedToSummary: () => void;
}

export const LieRevealStage: React.FC<LieRevealStageProps> = ({
  prompt,
  answers,
  roundResult,
  players,
  isHost,
  onProceedToSummary,
}) => {
  const liar = players.find((p) => p.id === roundResult?.liarId);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-indigo-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Top Banner: The Liar Revealed */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-rose-400">The Truth Unmasked!</h2>
            <Badge variant="outline" className="border-rose-500/40 text-rose-300">
              Reveal Stage
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prompt: <span className="text-amber-300 italic font-medium">"{prompt.question}"</span>
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onProceedToSummary}
            className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-950 text-xs sm:text-sm"
          >
            <span>View Round Summary</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Liar Spotlight Card */}
      {liar && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="text-4xl p-2 rounded-2xl bg-rose-500/20 border border-rose-500/40">
              {liar.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                  The Secret Liar Was:
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{liar.displayName}</h3>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-right">
            <Badge className="bg-rose-900 text-rose-200 border-rose-700 text-xs">
              Fooled {roundResult?.fooledGuesserIds.length ?? 0} player(s)
            </Badge>
            {roundResult && roundResult.liarFooledBonus > 0 && (
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+150 Majority Fooled Bonus!</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Answer Cards with Author & Vote Unveils */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer) => {
          const isLie = answer.isLie;
          const author = players.find((p) => p.id === answer.authorId);
          const voters = players.filter((p) => answer.votesReceived.includes(p.id));

          return (
            <div
              key={answer.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-lg ${
                isLie
                  ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/60 shadow-rose-950/50'
                  : 'bg-[#121a2d] border-emerald-900/40'
              }`}
            >
              {/* Card Header: Lie vs Truth badge */}
              <div className="flex items-center justify-between">
                <Badge
                  className={`text-xs uppercase font-black px-2.5 py-0.5 ${
                    isLie
                      ? 'bg-rose-500 text-slate-950 border-rose-400'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  }`}
                >
                  {isLie ? 'THE LIE 🤥' : 'THE TRUTH 😇'}
                </Badge>

                {/* Author attribution */}
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span>{author?.avatar ?? '👤'}</span>
                  <span className="font-bold">{author?.displayName ?? 'Anonymous'}</span>
                </div>
              </div>

              {/* Answer Content */}
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{answer.text}"
              </p>

              {/* Votes received breakdown */}
              <div className="pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>Accused as Lie by:</span>
                  <span className="font-mono font-bold text-white">{voters.length} vote(s)</span>
                </div>

                {voters.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {voters.map((v) => (
                      <span
                        key={v.id}
                        className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isLie
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isLie ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{v.displayName}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    No one voted for this answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
