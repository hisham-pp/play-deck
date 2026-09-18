'use client';

import { ArrowLeft, Bot, Play, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateId } from '@playdeck/shared';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import {
  DEFAULT_RULE_SETTINGS,
  MAX_SEATS,
  MIN_SEATS,
  SEAT_COLORS,
} from '../engine/snake-ladder-constants';
import { snakeLadderPreferencesRepository } from '../services/snake-ladder-preferences-repository';
import type { SnakeLadderPlayer, SnakeLadderRuleSettings } from '../types/snake-and-ladder.types';
import { seatColorTheme } from '../utils/snake-ladder-colors';

const KIND_HUMAN = 'human';
const KIND_BOT = 'bot';

type SeatKind = typeof KIND_HUMAN | typeof KIND_BOT;

interface SnakeLadderOfflineSetupProps {
  onStart: (players: SnakeLadderPlayer[], settings: SnakeLadderRuleSettings) => void;
  onBack: () => void;
}

const RULE_TOGGLES: { key: keyof SnakeLadderRuleSettings; label: string; hint: string }[] = [
  {
    key: 'requireExactRollToFinish',
    label: 'Exact roll to finish',
    hint: 'An overshoot past 100 forfeits the move instead of bouncing back.',
  },
  {
    key: 'sixGrantsExtraTurn',
    label: 'Six rolls again',
    hint: 'A six keeps the dice, up to three in a row.',
  },
  {
    key: 'requireSixToStart',
    label: 'Six to leave the start',
    hint: 'Tokens wait off the board until their first six.',
  },
];

export function SnakeLadderOfflineSetup({ onStart, onBack }: SnakeLadderOfflineSetupProps) {
  const player = usePlayerStore((s) => s.player);
  const [kinds, setKinds] = useState<SeatKind[]>([KIND_HUMAN, KIND_BOT]);
  const [settings, setSettings] = useState<SnakeLadderRuleSettings>(DEFAULT_RULE_SETTINGS);

  useEffect(() => {
    void snakeLadderPreferencesRepository.getPreferences().then((prefs) => {
      const total = Math.min(MAX_SEATS, Math.max(MIN_SEATS, prefs.lastSeatCount));
      const bots = Math.min(prefs.lastBotCount, total - 1);
      setKinds(
        Array.from({ length: total }, (_, index) =>
          index >= total - bots ? KIND_BOT : KIND_HUMAN,
        ),
      );
    });
  }, []);

  const setSeatCount = (count: number) => {
    setKinds((prev) =>
      Array.from(
        { length: count },
        (_, index) => prev[index] ?? (index === 0 ? KIND_HUMAN : KIND_BOT),
      ),
    );
  };

  const toggleKind = (index: number) => {
    // Seat 1 is always the local player, so it never becomes a bot.
    if (index === 0) return;
    setKinds((prev) =>
      prev.map((k, i) => (i === index ? (k === KIND_BOT ? KIND_HUMAN : KIND_BOT) : k)),
    );
  };

  const handleStart = () => {
    const seats: SnakeLadderPlayer[] = kinds.map((kind, index) => ({
      id: index === 0 && player ? player.id : generateId(kind),
      displayName:
        index === 0 && player
          ? player.displayName
          : kind === KIND_BOT
            ? `Bot ${index}`
            : `Player ${index + 1}`,
      avatar: index === 0 ? (player?.avatar ?? '🕹️') : kind === KIND_BOT ? '🤖' : '👤',
      type: kind,
      color: SEAT_COLORS[index % SEAT_COLORS.length],
      seatIndex: index,
      status: 'connected',
      ready: true,
    }));

    void snakeLadderPreferencesRepository.savePreferences({
      lastSeatCount: seats.length,
      lastBotCount: kinds.filter((k) => k === KIND_BOT).length,
    });

    onStart(seats, settings);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <Card className="border-amber-500/20 bg-slate-900/80">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-100">Offline match</CardTitle>
          <p className="mt-1 text-xs text-slate-400">
            Pass the device between human seats, or fill them with bots.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Players
            </legend>
            <div className="flex gap-2">
              {Array.from({ length: MAX_SEATS - MIN_SEATS + 1 }, (_, i) => MIN_SEATS + i).map(
                (count) => (
                  <Button
                    key={count}
                    size="sm"
                    variant={kinds.length === count ? 'primary' : 'outline'}
                    onClick={() => setSeatCount(count)}
                    aria-pressed={kinds.length === count}
                    className="min-w-[56px]"
                  >
                    {count}
                  </Button>
                ),
              )}
            </div>
          </fieldset>

          <ul className="space-y-2">
            {kinds.map((kind, index) => {
              const theme = seatColorTheme(SEAT_COLORS[index % SEAT_COLORS.length]);
              return (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black"
                      style={{
                        background: theme.hex,
                        borderColor: theme.rimHex,
                        color: theme.rimHex,
                      }}
                      aria-hidden="true"
                    >
                      {theme.symbol}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {index === 0
                        ? (player?.displayName ?? 'You')
                        : kind === KIND_BOT
                          ? `Bot ${index}`
                          : `Player ${index + 1}`}
                      <span className="ml-2 text-xs font-normal text-slate-500">{theme.label}</span>
                    </span>
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleKind(index)}
                    disabled={index === 0}
                    aria-label={`Seat ${index + 1} is ${kind === KIND_BOT ? 'a bot' : 'a human'}`}
                  >
                    {kind === KIND_BOT ? (
                      <>
                        <Bot className="mr-1.5 h-4 w-4" /> Bot
                      </>
                    ) : (
                      <>
                        <User className="mr-1.5 h-4 w-4" /> Human
                      </>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rules
            </legend>
            {RULE_TOGGLES.map(({ key, label, hint }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
              >
                <input
                  type="checkbox"
                  checked={Boolean(settings[key])}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, [key]: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 accent-amber-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-200">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <Button
            onClick={handleStart}
            className="w-full bg-amber-500 py-6 font-black text-slate-950 hover:bg-amber-600"
          >
            <Play className="mr-2 h-5 w-5" /> Start match
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
