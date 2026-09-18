'use client';

import { Bot, Target, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import {
  MAX_SEATS,
  NERVE_BALANCED,
  NERVE_CAUTIOUS,
  NERVE_RECKLESS,
  TARGET_SCORE_OPTIONS,
} from '../engine/push-your-luck-constants';
import type { BotNerve } from '../types/push-your-luck.types';

export interface PushYourLuckTableConfig {
  humanSeats: number;
  botSeats: number;
  nerve: BotNerve;
  targetScore: number;
}

export interface PushYourLuckSetupModalProps {
  isOpen: boolean;
  current: PushYourLuckTableConfig;
  onClose: () => void;
  onStartMatch: (config: PushYourLuckTableConfig) => void;
}

const NERVES: Array<{ id: BotNerve; label: string; desc: string }> = [
  { id: NERVE_CAUTIOUS, label: 'Cautious', desc: 'Banks early' },
  { id: NERVE_BALANCED, label: 'Balanced', desc: 'Plays the odds' },
  { id: NERVE_RECKLESS, label: 'Reckless', desc: 'Pushes hard' },
];

const CHIP_BASE =
  'py-2 rounded-lg border text-center text-xs font-bold transition-all tabular-nums';
const CHIP_ON = 'border-amber-500 bg-amber-500/15 text-amber-400';
const CHIP_OFF = 'border-surface-border text-deck-400 hover:text-white hover:bg-surface-overlay';

interface CounterProps {
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  options: number[];
  onChange: (value: number) => void;
}

function SeatCounter({ label, hint, icon: Icon, value, options, onChange }: CounterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
        <span className="font-normal normal-case tracking-normal text-deck-600">· {hint}</span>
      </label>
      <div className="grid grid-cols-8 gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(CHIP_BASE, value === option ? CHIP_ON : CHIP_OFF)}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PushYourLuckSetupModal({
  isOpen,
  current,
  onClose,
  onStartMatch,
}: PushYourLuckSetupModalProps) {
  const [humanSeats, setHumanSeats] = useState(current.humanSeats);
  const [botSeats, setBotSeats] = useState(current.botSeats);
  const [nerve, setNerve] = useState<BotNerve>(current.nerve);
  const [targetScore, setTargetScore] = useState(current.targetScore);

  const total = Math.min(MAX_SEATS, humanSeats + botSeats);
  const humanOptions = Array.from({ length: MAX_SEATS }, (_, index) => index + 1);
  const botOptions = Array.from({ length: MAX_SEATS }, (_, index) => index);

  const handleHumans = (value: number) => {
    setHumanSeats(value);
    setBotSeats((bots) => Math.min(bots, MAX_SEATS - value));
  };

  const handleBots = (value: number) => {
    setBotSeats(Math.min(value, MAX_SEATS - humanSeats));
  };

  const handleStart = () => {
    onStartMatch({
      humanSeats,
      botSeats: Math.min(botSeats, MAX_SEATS - humanSeats),
      nerve,
      targetScore,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Push Your Luck — Table Setup"
      description="Seat the table, pick how hard the bots push, and set the score that wins."
      size="md"
    >
      <div className="flex flex-col gap-4 py-1">
        <SeatCounter
          label="Local players"
          hint="pass & play"
          icon={Users}
          value={humanSeats}
          options={humanOptions}
          onChange={handleHumans}
        />

        <SeatCounter
          label="Deck bots"
          hint={`table of ${total}`}
          icon={Bot}
          value={Math.min(botSeats, MAX_SEATS - humanSeats)}
          options={botOptions}
          onChange={handleBots}
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
            Bot nerve
          </label>
          <div className="grid grid-cols-3 gap-2">
            {NERVES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setNerve(option.id)}
                className={cn(
                  'py-2 px-2 rounded-lg border text-center transition-all',
                  nerve === option.id ? CHIP_ON : CHIP_OFF,
                )}
                aria-pressed={nerve === option.id}
              >
                <div className="text-xs font-bold">{option.label}</div>
                <div className="text-[10px] font-normal text-deck-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
            <Target className="w-3.5 h-3.5" />
            <span>Target score</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TARGET_SCORE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTargetScore(option)}
                className={cn(CHIP_BASE, targetScore === option ? CHIP_ON : CHIP_OFF)}
                aria-pressed={targetScore === option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleStart}>
            Deal in
          </Button>
        </div>
      </div>
    </Modal>
  );
}
