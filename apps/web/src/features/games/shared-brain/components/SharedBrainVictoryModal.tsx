'use client';

import { ArrowRight, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import React from 'react';
import { Button, Modal } from '@playdeck/ui';

interface SharedBrainVictoryModalProps {
  isOpen: boolean;
  timeSeconds: number;
  tokensCollected: number;
  totalTokens: number;
  hasNextCourse: boolean;
  onNextCourse: () => void;
  onReplay: () => void;
  onLobby: () => void;
}

export function SharedBrainVictoryModal({
  isOpen,
  timeSeconds,
  tokensCollected,
  totalTokens,
  hasNextCourse,
  onNextCourse,
  onReplay,
  onLobby,
}: SharedBrainVictoryModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onReplay} title="Course Completed!" size="md">
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10">
          <Trophy className="h-8 w-8" />
        </div>

        <div>
          <h3 className="text-xl font-black text-deck-50">SYNAPTIC HARMONY!</h3>
          <p className="mt-1 text-sm text-deck-300">
            Both hemispheres worked in flawless synchrony to reach the goal.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-deck-border bg-deck-900/60 p-4">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase text-deck-400">Clear Time</div>
            <div className="mt-1 font-mono text-2xl font-black text-amber-400">
              {timeSeconds.toFixed(2)}s
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold uppercase text-deck-400">Brain Tokens</div>
            <div className="mt-1 flex items-center justify-center gap-1 font-mono text-2xl font-black text-sky-400">
              <Sparkles className="h-5 w-5" />
              <span>
                {tokensCollected} / {totalTokens}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {hasNextCourse && (
            <Button variant="arcade" onClick={onNextCourse}>
              Next Course <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={onReplay}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Replay
          </Button>
          <Button variant="ghost" onClick={onLobby}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </Modal>
  );
}
