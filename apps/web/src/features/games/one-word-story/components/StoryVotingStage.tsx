'use client';

import { Award, Check, Sparkles, Trophy } from 'lucide-react';
import React, { useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import type { OneWordStoryState, StoryAwardType, StoryPlayer } from '../types/one-word-story.types';

export interface StoryVotingStageProps {
  gameState: OneWordStoryState;
  players: StoryPlayer[];
  localPlayerId: string;
  onCastVote: (wordId: string, awardType: StoryAwardType) => void;
  onFinalize: () => void;
}

const AWARD_CATEGORIES: Array<{
  id: StoryAwardType;
  title: string;
  icon: string;
  desc: string;
}> = [
  {
    id: 'funniest',
    title: 'Funniest Word',
    icon: '😂',
    desc: 'The word that made everyone laugh hardest',
  },
  {
    id: 'best_twist',
    title: 'Best Plot Twist',
    icon: '🌀',
    desc: 'Changed the direction of the tale brilliantly',
  },
  { id: 'wildest', title: 'Wildest Chaos', icon: '💥', desc: 'Pure unhinged unpredictability' },
];

export const StoryVotingStage: React.FC<StoryVotingStageProps> = ({
  gameState,
  localPlayerId,
  onCastVote,
  onFinalize,
}) => {
  const [selectedAward, setSelectedAward] = useState<StoryAwardType>('funniest');
  const currentAward = AWARD_CATEGORIES.find((a) => a.id === selectedAward)!;

  // Find local player's current vote for each award
  const myVotes = new Map<StoryAwardType, string>();
  for (const v of gameState.votes) {
    if (v.voterId === localPlayerId) {
      myVotes.set(v.awardType, v.wordId);
    }
  }

  const currentVotedWordId = myVotes.get(selectedAward);
  const totalVotesCast = myVotes.size;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-[#0f172a]/95 backdrop-blur border border-amber-900/40 rounded-2xl shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black text-amber-400">Award Nominations</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Cast your ballots! Vote for the words that defined this story.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-mono">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Your Ballots: {totalVotesCast} / 3 Cast</span>
        </div>
      </div>

      {/* Award Category Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {AWARD_CATEGORIES.map((cat) => {
          const isSelected = selectedAward === cat.id;
          const hasVoted = myVotes.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedAward(cat.id)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/40'
                  : 'bg-[#1e293b]/60 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg">{cat.icon}</span>
                {hasVoted && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1 border-emerald-500 text-emerald-400"
                  >
                    <Check className="w-3 h-3 inline mr-0.5" /> Voted
                  </Badge>
                )}
              </div>
              <span className="font-bold text-sm text-slate-200">{cat.title}</span>
              <span className="text-[11px] text-slate-400">{cat.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Words Grid for Selected Award */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Click any word to cast your vote for &ldquo;{currentAward.title}&rdquo;:</span>
          <span className="italic">Starter phrase excluded from voting</span>
        </div>

        <div className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700 max-h-[320px] overflow-y-auto flex flex-wrap gap-2">
          {gameState.words.map((item, idx) => {
            const isVoted = currentVotedWordId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onCastVote(item.id, selectedAward)}
                className={`group px-3 py-1.5 rounded-lg border text-sm transition-all flex items-center gap-1.5 font-serif ${
                  isVoted
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md scale-105'
                    : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-amber-500/60 hover:bg-slate-800'
                }`}
              >
                <span>{item.word}</span>
                <span
                  className={`text-[10px] font-sans px-1 rounded ${
                    isVoted ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{idx + 1} {item.authorName}
                </span>
                {isVoted && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action to finalize */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-amber-900/30">
        <span className="text-xs text-slate-400">
          Once all votes are in, finalize to reveal the award winners and grand storyteller podium!
        </span>

        <Button
          size="lg"
          onClick={onFinalize}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Award className="w-5 h-5" />
          Reveal Awards &amp; Scores
        </Button>
      </div>
    </div>
  );
};
