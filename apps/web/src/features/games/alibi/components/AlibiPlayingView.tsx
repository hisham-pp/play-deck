'use client';

import React from 'react';

import type { AlibiPlayer, AlibiState } from '../types/alibi.types';
import { AlibiGameOver } from './AlibiGameOver';
import { AlibiReveal } from './AlibiReveal';
import { AlibiStoryCard } from './AlibiStoryCard';
import { AlibiVoting } from './AlibiVoting';

interface Props {
  gameState: AlibiState;
  localPlayer: AlibiPlayer | undefined;
  localId: string;
  isHost: boolean;
  onDiscussion: () => void;
  onVoting: () => void;
  onVote: (suspectId: string) => void;
  onTally: () => void;
}

export function AlibiPlayingView({
  gameState,
  localPlayer,
  localId,
  isHost,
  onDiscussion,
  onVoting,
  onVote,
  onTally,
}: Props) {
  const { phase, players } = gameState;

  if (phase === 'reading' || phase === 'discussion') {
    return (
      <AlibiStoryCard
        localPlayer={localPlayer}
        phase={phase}
        isHost={isHost}
        onStartDiscussion={onDiscussion}
        onStartVoting={onVoting}
      />
    );
  }

  if (phase === 'voting') {
    return (
      <AlibiVoting
        players={players}
        localPlayerId={localId}
        localVote={localPlayer?.votedForId ?? null}
        onVote={onVote}
      />
    );
  }

  if (phase === 'reveal') {
    return <AlibiReveal gameState={gameState} isHost={isHost} onTally={onTally} />;
  }

  if (phase === 'game-over') {
    return <AlibiGameOver players={players} suspectId={undefined} />;
  }

  return null;
}
