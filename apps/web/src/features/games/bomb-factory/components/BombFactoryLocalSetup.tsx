'use client';

import { ArrowLeft, PlayCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@playdeck/ui';
import { DEFAULT_DIFFICULTY, MAX_SEATS, MIN_SEATS } from '../engine/bomb-factory-constants';
import type { BombFactoryDifficulty, BombFactorySeat } from '../types/bomb-factory.types';
import { BombFactoryDifficultyPicker } from './BombFactoryDifficultyPicker';

interface BombFactoryLocalSetupProps {
  hostName: string;
  hostAvatar: string;
  onStart: (seats: BombFactorySeat[], difficulty: BombFactoryDifficulty) => void;
  onBack: () => void;
}

const SEAT_AVATARS = ['🛠️', '🧰', '🔩', '⚙️', '🔌', '🧪'];

function buildSeats(count: number, hostName: string, hostAvatar: string): BombFactorySeat[] {
  return Array.from({ length: count }, (_, seatIndex) => ({
    id: `local-${seatIndex}`,
    displayName: seatIndex === 0 ? hostName : `Operator ${seatIndex + 1}`,
    avatar: seatIndex === 0 ? hostAvatar : SEAT_AVATARS[seatIndex % SEAT_AVATARS.length],
    seatIndex,
    status: 'connected' as const,
  }));
}

export function BombFactoryLocalSetup({
  hostName,
  hostAvatar,
  onStart,
  onBack,
}: BombFactoryLocalSetupProps) {
  const [crewSize, setCrewSize] = useState(MIN_SEATS);
  const [difficulty, setDifficulty] = useState<BombFactoryDifficulty>(DEFAULT_DIFFICULTY);

  const sizes = Array.from({ length: MAX_SEATS - MIN_SEATS + 1 }, (_, i) => MIN_SEATS + i);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <header>
        <h2 className="font-display text-xl font-black tracking-tight text-deck-950 dark:text-white">
          Local drill
        </h2>
        <p className="mt-1 text-sm text-deck-400">
          One device, passed round the table. Each sheet stays covered until the person holding it
          reveals it.
        </p>
      </header>

      <fieldset>
        <legend className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deck-500">
          Crew size
        </legend>
        <div role="radiogroup" aria-label="Crew size" className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={size === crewSize}
              onClick={() => setCrewSize(size)}
              className={`h-10 w-10 rounded-lg border font-mono text-sm font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                size === crewSize
                  ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                  : 'border-surface-border bg-surface-overlay text-deck-300 hover:border-surface-border-hover'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      <BombFactoryDifficultyPicker value={difficulty} onChange={setDifficulty} />

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Back
        </Button>
        <Button
          variant="primary"
          onClick={() => onStart(buildSeats(crewSize, hostName, hostAvatar), difficulty)}
          className="font-black uppercase"
        >
          <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> Deal the sheets
        </Button>
      </div>
    </div>
  );
}
