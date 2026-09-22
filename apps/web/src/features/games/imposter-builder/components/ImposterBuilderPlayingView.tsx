'use client';

import React from 'react';

import type { ImposterBuilderPlayer, ImposterBuilderState } from '../types/imposter-builder.types';
import { ImposterBuilderCanvas } from './ImposterBuilderCanvas';
import { ImposterBuilderReveal } from './ImposterBuilderReveal';
import { ImposterBuilderVoting } from './ImposterBuilderVoting';

interface Props {
  gameState: ImposterBuilderState;
  localPlayer: ImposterBuilderPlayer | undefined;
  localId: string;
  isHost: boolean;
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onCellToggle: (row: number, col: number) => void;
  onReveal: () => void;
  onDiscussion: () => void;
  onVoting: () => void;
  onVote: (suspectId: string) => void;
}

function ImposterBuilderInstruction({
  isImposter,
  normalVersion,
  imposterVersion,
}: {
  isImposter: boolean;
  normalVersion?: string;
  imposterVersion?: string;
}) {
  return (
    <div className="w-full max-w-2xl rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
        Your Building Instructions
      </p>
      <p className="text-base font-bold text-white">
        {isImposter ? imposterVersion : normalVersion}
      </p>
      {isImposter && (
        <p className="text-xs text-rose-400 mt-1 font-semibold">
          ⚠️ You are the Imposter — your instructions differ slightly!
        </p>
      )}
    </div>
  );
}

function ImposterBuilderGameOver({ players }: { players: ImposterBuilderPlayer[] }) {
  const imposter = players.find((p) => p.isImposter);

  return (
    <div className="w-full max-w-lg rounded-xl border border-amber-500/40 bg-surface-raised p-6 space-y-4">
      <h2 className="text-xl font-black text-white text-center font-display">🏗️ Build Complete!</h2>
      <p className="text-sm text-center text-deck-400">
        The Imposter was: <span className="font-bold text-rose-400">{imposter?.displayName}</span>
      </p>
      <div className="space-y-2">
        {[...players]
          .sort((a, b) => b.score - a.score)
          .map((p, i) => (
            <div
              key={p.id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-surface-base border border-surface-border"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">#{i + 1}</span>
                <span>{p.avatar}</span>
                <span className="text-white text-sm font-semibold">{p.displayName}</span>
                {p.isImposter && (
                  <span className="text-xs text-rose-400 font-bold">(Imposter)</span>
                )}
              </div>
              <span className="text-amber-400 font-bold text-sm">{p.score} pts</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function ImposterBuilderPlayingView({
  gameState,
  localPlayer,
  localId,
  isHost,
  colors,
  selectedColor,
  onColorSelect,
  onCellToggle,
  onReveal,
  onDiscussion,
  onVoting,
  onVote,
}: Props) {
  const { phase, players, instruction } = gameState;

  if (phase === 'building' && localPlayer) {
    return (
      <>
        <ImposterBuilderInstruction
          isImposter={localPlayer.isImposter}
          normalVersion={instruction?.normalVersion}
          imposterVersion={instruction?.imposterVersion}
        />
        <ImposterBuilderCanvas
          grid={localPlayer.grid}
          colors={colors}
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          onCellToggle={onCellToggle}
          isHost={isHost}
          onReveal={onReveal}
        />
      </>
    );
  }

  if (phase === 'reveal' || phase === 'discussion') {
    return (
      <ImposterBuilderReveal
        players={players}
        isHost={isHost}
        phase={phase}
        onStartDiscussion={onDiscussion}
        onStartVoting={onVoting}
      />
    );
  }

  if (phase === 'voting') {
    return (
      <ImposterBuilderVoting
        players={players}
        localPlayerId={localId}
        localVote={localPlayer?.votedForId ?? null}
        onVote={onVote}
      />
    );
  }

  if (phase === 'game-over') {
    return <ImposterBuilderGameOver players={players} />;
  }

  return null;
}
