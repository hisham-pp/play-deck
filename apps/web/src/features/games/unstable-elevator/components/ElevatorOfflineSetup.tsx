'use client';

import { ArrowLeft, Play } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import type { BotSkill } from '../engine/elevator-bot';
import { DEFAULT_SLIPS, MAX_SEATS, MIN_SEATS } from '../engine/elevator-constants';
import { buildLocalCrew, defaultCrewNames } from '../engine/elevator-seats';
import type { ElevatorSeat } from '../types/unstable-elevator.types';
import { ElevatorOptionRow } from './ElevatorOptionRow';

export interface OfflineCrewSettings {
  seats: ElevatorSeat[];
  slips: number;
  botSkill: BotSkill;
}

interface ElevatorOfflineSetupProps {
  onStart: (settings: OfflineCrewSettings) => void;
  onBack: () => void;
}

const SLIP_OPTIONS = [
  { value: 3, label: '3 — Tense' },
  { value: DEFAULT_SLIPS, label: '5 — Standard' },
  { value: 8, label: '8 — Forgiving' },
];

const SKILL_OPTIONS: { value: BotSkill; label: string }[] = [
  { value: 'clumsy', label: 'Clumsy' },
  { value: 'steady', label: 'Steady' },
  { value: 'expert', label: 'Expert' },
];

export function ElevatorOfflineSetup({ onStart, onBack }: ElevatorOfflineSetupProps) {
  const player = usePlayerStore((state) => state.player);
  const [humans, setHumans] = useState(1);
  const [bots, setBots] = useState(1);
  const [slips, setSlips] = useState(DEFAULT_SLIPS);
  const [botSkill, setBotSkill] = useState<BotSkill>('steady');

  const crewSize = humans + bots;
  const tooSmall = crewSize < MIN_SEATS;

  const handleHumans = (next: number) => {
    setHumans(next);
    if (next + bots > MAX_SEATS) setBots(MAX_SEATS - next);
  };

  const handleBots = (next: number) => {
    setBots(Math.min(next, MAX_SEATS - humans));
  };

  const handleStart = () => {
    const seats = buildLocalCrew({
      humanNames: defaultCrewNames(player?.displayName, humans),
      botCount: bots,
    });
    onStart({ seats, slips, botSkill });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-deck-400">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card className="border-amber-500/20 bg-slate-900/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-100">Crew the lift</CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            Everyone shares one screen and takes the claw in turn, one object per floor.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <ElevatorOptionRow
            label="Players on this device"
            options={[1, 2, 3, 4].map((value) => ({ value, label: String(value) }))}
            value={humans}
            onChange={handleHumans}
          />

          <ElevatorOptionRow
            label="Bots"
            hint={`A crew is ${MIN_SEATS} to ${MAX_SEATS} seats in total.`}
            options={[0, 1, 2, 3].map((value) => ({ value, label: String(value) }))}
            value={bots}
            onChange={handleBots}
          />

          <ElevatorOptionRow
            label="Bot nerve"
            options={SKILL_OPTIONS}
            value={botSkill}
            onChange={setBotSkill}
          />

          <ElevatorOptionRow
            label="Slips before the lift gives out"
            hint="One slip is spent every time a piece of cargo goes over the edge."
            options={SLIP_OPTIONS}
            value={slips}
            onChange={setSlips}
          />

          <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500">
              {tooSmall ? `Add another seat — ${MIN_SEATS} minimum.` : `${crewSize} aboard.`}
            </p>
            <Button
              onClick={handleStart}
              disabled={tooSmall}
              className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-600"
            >
              <Play className="mr-1.5 h-4 w-4" /> Start the run
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
