'use client';

import React from 'react';
import { LOCATIONS } from '../engine/locations-database';
import type { SpyNetworkPlayer, SpyNetworkState } from '../types/spy-network.types';
import { SpyNetworkQAPanel } from './SpyNetworkQAPanel';
import { SpyNetworkReveal } from './SpyNetworkReveal';
import { SpyNetworkVoting } from './SpyNetworkVoting';

interface Props {
  gameState: SpyNetworkState;
  localPlayer: SpyNetworkPlayer | undefined;
  localId: string;
  isHost: boolean;
  spyGuess: string;
  onSubmitQA: (q: string, a: string) => void;
  onStartVoting: () => void;
  onVote: (suspectId: string) => void;
  onSpyGuessChange: (v: string) => void;
  onSpyGuessSubmit: () => void;
  onTally: () => void;
}

function SpyNetworkLocationCard({ isSpy, location }: { isSpy: boolean; location: string | null }) {
  return (
    <div className="w-full max-w-lg rounded-xl border border-surface-border bg-surface-raised p-4 text-center">
      {isSpy ? (
        <p className="text-lg font-bold text-rose-400">
          🔍 You are the SPY — you don&apos;t know the location!
        </p>
      ) : (
        <p className="text-lg font-bold text-emerald-400">
          📍 Location: <span className="text-white">{location}</span>
        </p>
      )}
    </div>
  );
}

function SpyNetworkGameOver({ players }: { players: SpyNetworkPlayer[] }) {
  return (
    <div className="w-full max-w-lg rounded-xl border border-amber-500/40 bg-surface-raised p-6 space-y-4">
      <h2 className="text-xl font-black text-white text-center font-display">
        🔓 Debrief Complete
      </h2>
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
                {p.isSpy && <span className="text-xs text-rose-400 font-bold">(Spy)</span>}
              </div>
              <span className="text-amber-400 font-bold text-sm">{p.score} pts</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function SpyNetworkPlayingView({
  gameState,
  localPlayer,
  localId,
  isHost,
  spyGuess,
  onSubmitQA,
  onStartVoting,
  onVote,
  onSpyGuessChange,
  onSpyGuessSubmit,
  onTally,
}: Props) {
  const { phase, players, location } = gameState;
  const isSpy = localPlayer?.isSpy ?? false;

  return (
    <>
      <SpyNetworkLocationCard isSpy={isSpy} location={location} />

      {(phase === 'qa' || phase === 'discussion') && (
        <SpyNetworkQAPanel
          gameState={gameState}
          localPlayerId={localId}
          isHost={isHost}
          onSubmitQA={onSubmitQA}
          onStartVoting={onStartVoting}
        />
      )}

      {phase === 'voting' && (
        <SpyNetworkVoting
          players={players}
          localPlayerId={localId}
          localVote={localPlayer?.votedForId ?? null}
          onVote={onVote}
        />
      )}

      {phase === 'reveal' && (
        <SpyNetworkReveal
          gameState={gameState}
          localPlayer={localPlayer}
          spyGuess={spyGuess}
          locations={LOCATIONS}
          onSpyGuessChange={onSpyGuessChange}
          onSpyGuessSubmit={onSpyGuessSubmit}
          onTally={onTally}
          isHost={isHost}
        />
      )}

      {phase === 'game-over' && <SpyNetworkGameOver players={players} />}
    </>
  );
}
