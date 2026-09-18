'use client';

import { Play } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import {
  CATEGORY_LABELS,
  DEFAULT_RULES,
  MAX_LIVES,
  MAX_TURN_SECONDS,
  MIN_LIVES,
  MIN_TURN_SECONDS,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  MODE_POINTS,
  MODE_SOLO,
  MODE_TEAM,
  TEAM_A,
  TEAM_B,
  VARIANT_CATEGORY_LOCK,
  VARIANT_DESCRIPTIONS,
  VARIANT_LABELS,
} from '../engine/word-chain-constants';
import type {
  WordChainCategory,
  WordChainMode,
  WordChainRules,
  WordChainSetupPlayer,
  WordChainVariant,
} from '../types/word-chain.types';
import { WordChainOptionGrid } from './WordChainOptionGrid';
import { WordChainRoster } from './WordChainRoster';
import { WordChainSlider } from './WordChainSlider';

export interface WordChainSetupModalProps {
  isOpen: boolean;
  isPreparing: boolean;
  onClose?: () => void;
  onStart: (rules: WordChainRules, players: WordChainSetupPlayer[]) => void;
}

const MODE_OPTIONS = (Object.keys(MODE_LABELS) as WordChainMode[]).map((mode) => ({
  value: mode,
  label: MODE_LABELS[mode],
  description: MODE_DESCRIPTIONS[mode],
}));

const VARIANT_OPTIONS = (Object.keys(VARIANT_LABELS) as WordChainVariant[]).map((variant) => ({
  value: variant,
  label: VARIANT_LABELS[variant],
  description: VARIANT_DESCRIPTIONS[variant],
}));

const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as WordChainCategory[]).map((category) => ({
  value: category,
  label: CATEGORY_LABELS[category],
}));

const DEFAULT_ROSTER: WordChainSetupPlayer[] = [
  { name: 'Player 1', team: TEAM_A },
  { name: 'Player 2', team: TEAM_B },
];

export function WordChainSetupModal({
  isOpen,
  isPreparing,
  onClose,
  onStart,
}: WordChainSetupModalProps) {
  const [rules, setRules] = useState<WordChainRules>({ ...DEFAULT_RULES, category: 'animals' });
  const [roster, setRoster] = useState<WordChainSetupPlayer[]>(DEFAULT_ROSTER);

  const players = useMemo(
    () => (rules.mode === MODE_SOLO ? roster.slice(0, 1) : roster),
    [rules.mode, roster],
  );

  const patch = (next: Partial<WordChainRules>) => setRules((current) => ({ ...current, ...next }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose ?? (() => undefined)}
      title="Set Up the Chain"
      description="Pick a mode, a twist and who is playing. Every word has to start where the last one ended."
      size="lg"
    >
      <div className="flex flex-col gap-5">
        <WordChainOptionGrid
          legend="Mode"
          options={MODE_OPTIONS}
          value={rules.mode}
          columns={2}
          onChange={(mode) => patch({ mode })}
        />

        <WordChainOptionGrid
          legend="Rule variant"
          options={VARIANT_OPTIONS}
          value={rules.variant}
          columns={3}
          onChange={(variant) => patch({ variant })}
        />

        {rules.variant === VARIANT_CATEGORY_LOCK && (
          <WordChainOptionGrid
            legend="Category"
            options={CATEGORY_OPTIONS}
            value={rules.category ?? 'animals'}
            columns={4}
            onChange={(category) => patch({ category })}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <WordChainSlider
            label="Seconds per turn"
            value={rules.startingSeconds}
            min={MIN_TURN_SECONDS}
            max={MAX_TURN_SECONDS}
            onChange={(startingSeconds) => patch({ startingSeconds })}
          />

          {rules.mode === MODE_POINTS ? (
            <WordChainSlider
              label="Rounds"
              value={rules.totalRounds}
              min={2}
              max={12}
              onChange={(totalRounds) => patch({ totalRounds })}
            />
          ) : (
            <WordChainSlider
              label="Lives"
              value={rules.lives}
              min={MIN_LIVES}
              max={MAX_LIVES}
              onChange={(lives) => patch({ lives })}
            />
          )}
        </div>

        <WordChainRoster mode={rules.mode} players={roster} onChange={setRoster} />

        {rules.mode === MODE_TEAM && (
          <p className="text-[11px] text-deck-500">
            Teams are seated alternately, so play passes back and forth between the two sides.
          </p>
        )}

        <Button
          size="lg"
          variant="arcade"
          loading={isPreparing}
          onClick={() => onStart(rules, players)}
          className="w-full"
        >
          <Play className="w-4 h-4" />
          Start the chain
        </Button>
      </div>
    </Modal>
  );
}
