'use client';

import { Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type {
  SubmittedWrongAnswer,
  WrongAnswersPlayer,
  WrongAnswersQuestion,
} from '../types/wrong-answers.types';

export interface WrongAnswersVotingProps {
  question: WrongAnswersQuestion;
  answers: SubmittedWrongAnswer[];
  localPlayerId: string | null;
  players: WrongAnswersPlayer[];
  myVotedAnswerId: string | null;
  isHost: boolean;
  onCastVote: (answerId: string) => void;
  onFinalize: () => void;
}

export const WrongAnswersVoting: React.FC<WrongAnswersVotingProps> = ({
  question,
  answers,
  localPlayerId,
  players,
  myVotedAnswerId,
  isHost,
  onCastVote,
  onFinalize,
}) => {
  const votedCount = players.filter((p) => p.votedAnswerId !== null).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">
              Vote on the Best Lie!
            </h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Secret Ballot
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick your favorite fake answer! ({votedCount}/{players.length} votes locked)
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onFinalize}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950 text-xs sm:text-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Tally Votes & Reveal</span>
          </Button>
        )}
      </div>

      {/* Pinned Question Banner */}
      <div className="p-4 rounded-xl bg-[#11192d] border border-amber-800/40 text-center">
        <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
          The Prompt
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white">"{question.prompt}"</h3>
      </div>

      {/* Voting Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer, index) => {
          const isMyAnswer = answer.authorId === localPlayerId;
          const isSelected = myVotedAnswerId === answer.id;

          return (
            <button
              key={answer.id}
              disabled={isMyAnswer}
              onClick={() => onCastVote(answer.id)}
              className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-4 ${
                isSelected
                  ? 'bg-amber-950/50 border-amber-400 shadow-xl shadow-amber-950/60 ring-2 ring-amber-400'
                  : isMyAnswer
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                    : 'bg-[#11192d]/80 border-slate-800 hover:border-amber-600/60 hover:bg-[#15203a]'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Candidate #{index + 1}
                  </span>

                  {isMyAnswer && (
                    <Badge variant="neutral" className="text-[10px] py-0 px-1.5 border-slate-700">
                      Your Answer
                    </Badge>
                  )}

                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Your Vote</span>
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg font-bold text-white italic leading-snug">
                  "{answer.text}"
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>{isMyAnswer ? 'Cannot vote for your own lie' : 'Click to cast vote'}</span>
                {!isMyAnswer && (
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'bg-amber-400 border-amber-400 text-slate-950'
                        : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
