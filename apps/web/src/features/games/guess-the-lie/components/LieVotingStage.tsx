'use client';

import { Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { LiePlayer, LiePrompt, SubmittedAnswer } from '../types/guess-the-lie.types';

export interface LieVotingStageProps {
  prompt: LiePrompt;
  answers: SubmittedAnswer[];
  localPlayerId: string;
  players: LiePlayer[];
  myVotedAnswerId: string | null;
  isHost: boolean;
  onCastVote: (answerId: string) => void;
  onFinalize: () => void;
}

export const LieVotingStage: React.FC<LieVotingStageProps> = ({
  prompt,
  answers,
  localPlayerId,
  players,
  myVotedAnswerId,
  isHost,
  onCastVote,
  onFinalize,
}) => {
  const votedPlayersCount = players.filter((p) => p.votedAnswerId !== null).length;
  const eligibleVoters = players.filter((p) => p.role !== 'liar');

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-indigo-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">Vote on the Lie!</h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Accusation Ballot
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Lock in your guess: which answer is the fabricated falsehood? ({votedPlayersCount}/
            {eligibleVoters.length} votes locked)
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
      <div className="p-4 rounded-xl bg-[#11192d] border border-indigo-800/40 text-center">
        <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold block mb-1">
          The Question
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white">"{prompt.question}"</h3>
      </div>

      {/* Voting Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer, index) => {
          const isMyAnswer = answer.authorId === localPlayerId;
          const isSelectedByMe = myVotedAnswerId === answer.id;

          return (
            <div
              key={answer.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 shadow-lg ${
                isSelectedByMe
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400 shadow-amber-950/50'
                  : 'bg-[#121a2d] border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Option #{index + 1}
                </span>
                {isMyAnswer && (
                  <Badge variant="neutral" className="text-[10px] bg-slate-800 text-slate-400">
                    Your Answer
                  </Badge>
                )}
              </div>

              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                "{answer.text}"
              </p>

              <Button
                onClick={() => onCastVote(answer.id)}
                disabled={isMyAnswer}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isSelectedByMe
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md'
                    : 'bg-[#1a243d] hover:bg-[#233052] text-slate-200 border border-slate-700'
                } ${isMyAnswer ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {isSelectedByMe ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Selected as the Lie</span>
                  </>
                ) : isMyAnswer ? (
                  <span>Cannot Vote for Self</span>
                ) : (
                  <span>Vote This is the Lie</span>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Voter Progress Banner */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>
          Votes Cast: <strong>{votedPlayersCount}</strong> / {players.length}
        </span>
        {myVotedAnswerId && (
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Your vote is locked in!</span>
          </span>
        )}
      </div>
    </div>
  );
};
