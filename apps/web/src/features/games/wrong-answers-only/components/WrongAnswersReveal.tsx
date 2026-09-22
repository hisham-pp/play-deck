'use client';

import { ArrowRight, Flame, Trophy } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type {
  SubmittedWrongAnswer,
  WrongAnswersPlayer,
  WrongAnswersQuestion,
  WrongAnswersRoundResult,
} from '../types/wrong-answers.types';

export interface WrongAnswersRevealProps {
  question: WrongAnswersQuestion;
  answers: SubmittedWrongAnswer[];
  roundResult: WrongAnswersRoundResult | null;
  players: WrongAnswersPlayer[];
  currentRound: number;
  totalRounds: number;
  isHost: boolean;
  onProceedNext: () => void;
}

export const WrongAnswersReveal: React.FC<WrongAnswersRevealProps> = ({
  question,
  answers,
  roundResult,
  players,
  currentRound,
  totalRounds,
  isHost,
  onProceedNext,
}) => {
  const isFinalRound = currentRound >= totalRounds;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">The Reveal!</h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Round {currentRound} Results
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prompt: <span className="text-amber-300 italic font-medium">"{question.prompt}"</span>
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onProceedNext}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950 text-xs sm:text-sm"
          >
            <span>{isFinalRound ? 'View Final Results' : 'Next Round'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Answer Cards with Author & Votes Revealed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer) => {
          const isWinner = roundResult?.winningAnswerIds.includes(answer.id);
          const author = players.find((p) => p.id === answer.authorId);
          const scoreInfo = roundResult?.roundLeaderboard.find(
            (s) => s.playerId === answer.authorId,
          );
          const voters = answer.voterIds
            .map((vid) => players.find((p) => p.id === vid))
            .filter(Boolean);

          return (
            <div
              key={answer.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isWinner
                  ? 'bg-amber-950/40 border-amber-400 shadow-xl shadow-amber-950/50 ring-1 ring-amber-400/50'
                  : 'bg-[#11192d]/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-1 rounded-lg bg-black/40 border border-slate-700/60">
                      {author?.avatar ?? '👤'}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-white block">
                        {author?.displayName ?? 'Anonymous'}
                      </span>
                      {isWinner && (
                        <Badge
                          variant="warning"
                          className="text-[10px] py-0 px-1.5 flex items-center gap-1"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Crowd Favorite (+3)</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {scoreInfo && scoreInfo.totalRoundPoints > 0 && (
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400 block">
                        +{scoreInfo.totalRoundPoints} pts
                      </span>
                      {scoreInfo.streakBonus > 0 && (
                        <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5 justify-end">
                          <Flame className="w-3 h-3" />
                          <span>Streak Bonus!</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-base font-bold text-slate-100 italic leading-snug my-3">
                  "{answer.text}"
                </p>
              </div>

              {/* Voters List */}
              <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  {answer.voteCount} {answer.voteCount === 1 ? 'vote' : 'votes'}
                </span>

                <div className="flex items-center gap-1">
                  {voters.map((voter) => (
                    <span
                      key={voter?.id}
                      className="text-base"
                      title={`Voted by ${voter?.displayName}`}
                    >
                      {voter?.avatar}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
