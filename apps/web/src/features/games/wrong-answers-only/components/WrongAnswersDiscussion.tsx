'use client';

import { ArrowRight, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import React from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { SubmittedWrongAnswer, WrongAnswersQuestion } from '../types/wrong-answers.types';

export interface WrongAnswersDiscussionProps {
  question: WrongAnswersQuestion;
  answers: SubmittedWrongAnswer[];
  activeSpeechAnswerId: string | null;
  isHost: boolean;
  onReadAloud: (answer: SubmittedWrongAnswer) => void;
  onStopReading: () => void;
  onProceedToVoting: () => void;
}

export const WrongAnswersDiscussion: React.FC<WrongAnswersDiscussionProps> = ({
  question,
  answers,
  activeSpeechAnswerId,
  isHost,
  onReadAloud,
  onStopReading,
  onProceedToVoting,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0c1322]/95 border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400">The Fake Answers</h2>
            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
              Discussion Stage
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Read every answer aloud, listen to the narrator, and laugh before casting your vote!
          </p>
        </div>

        {isHost && (
          <Button
            onClick={onProceedToVoting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950 text-xs sm:text-sm"
          >
            <span>Proceed to Voting</span>
            <ArrowRight className="w-4 h-4" />
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

      {/* Anonymous Answers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {answers.map((answer, index) => {
          const isSpeaking = activeSpeechAnswerId === answer.id;

          return (
            <div
              key={answer.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isSpeaking
                  ? 'bg-amber-950/40 border-amber-400 shadow-xl shadow-amber-950/50 scale-[1.02]'
                  : 'bg-[#11192d]/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Fake Option #{index + 1}
                  </span>
                  <button
                    onClick={() => (isSpeaking ? onStopReading() : onReadAloud(answer))}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                        : 'bg-black/30 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/50'
                    }`}
                    title={isSpeaking ? 'Stop narration' : 'Read answer aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Read</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-base sm:text-lg font-bold text-slate-100 italic leading-snug">
                  "{answer.text}"
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
                <MessageSquare className="w-3 h-3 text-amber-400" />
                <span>Author remains anonymous until voting ends</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
