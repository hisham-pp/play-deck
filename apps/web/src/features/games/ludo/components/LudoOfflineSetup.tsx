'use client';

import { generateId } from '@playdeck/shared';
import { Bot, Dices, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { addBotToFirstEmptySeat, fillEmptySeatsWithBots } from '../bots/bot-fill';
import { LUDO_BOT_DEFINITIONS } from '../bots/bot-registry';
import { MAX_PLAYERS, MIN_PLAYERS } from '../engine/ludo-constants';
import { ludoPreferencesRepository } from '../services/ludo-preferences-repository';
import type { LudoBotDifficulty, LudoBotPersonality, LudoPlayer } from '../types/ludo.types';
import { finalizeSeats } from '../utils/finalize-seats';
import { ludoColorTheme } from '../utils/ludo-colors';

const DIFFICULTIES: LudoBotDifficulty[] = ['easy', 'normal', 'hard'];
const PERSONALITIES: LudoBotPersonality[] = ['balanced', 'aggressive', 'defensive', 'rusher'];

interface LudoOfflineSetupProps {
  onStart: (players: LudoPlayer[]) => void;
  onBack: () => void;
}

export function LudoOfflineSetup({ onStart, onBack }: LudoOfflineSetupProps) {
  const { player } = usePlayerStore();
  const [seatCount, setSeatCount] = useState(4);
  const [seats, setSeats] = useState<(LudoPlayer | null)[]>(() => Array(4).fill(null));

  useEffect(() => {
    ludoPreferencesRepository.getPreferences().then((prefs) => {
      setSeatCount(prefs.lastSeatCount);
    });
  }, []);

  useEffect(() => {
    setSeats((prev) => {
      const next = Array.from({ length: seatCount }, (_, i) => prev[i] ?? null);
      if (!next[0] && player) {
        next[0] = {
          id: player.id,
          displayName: player.displayName,
          type: 'human',
          color: 'red',
          avatar: player.avatar,
          seatIndex: 0,
          status: 'ready',
          ready: true,
        };
      }
      return next;
    });
  }, [seatCount, player]);

  const occupiedCount = seats.filter(Boolean).length;
  const canStart = occupiedCount >= MIN_PLAYERS;

  function updateSeat(index: number, seat: LudoPlayer | null) {
    setSeats((prev) => {
      const next = [...prev];
      next[index] = seat;
      return next;
    });
  }

  function addHuman(index: number) {
    updateSeat(index, {
      id: generateId('human'),
      displayName: `Player ${index + 1}`,
      type: 'human',
      color: 'red',
      seatIndex: index,
      status: 'ready',
      ready: true,
    });
  }

  function addBot(index: number) {
    const botDef = LUDO_BOT_DEFINITIONS[index % LUDO_BOT_DEFINITIONS.length];
    setSeats((prev) => {
      const next = [...prev];
      const filled = addBotToFirstEmptySeat(
        next.map((s, i) => (i === index ? null : s)),
        botDef,
      );
      return filled.map((s, i) => (i === index ? s : next[i]));
    });
  }

  function handleFillWithBots() {
    setSeats((prev) => {
      const next = [...prev];
      if (!next[0] && player) {
        next[0] = {
          id: player.id,
          displayName: player.displayName,
          type: 'human',
          color: 'red',
          avatar: player.avatar,
          seatIndex: 0,
          status: 'ready',
          ready: true,
        };
      }
      return fillEmptySeatsWithBots(next);
    });
  }

  function handleStart() {
    void ludoPreferencesRepository.savePreferences({
      lastSeatCount: seatCount,
      autoFillWithBots: false,
    });
    onStart(finalizeSeats(seats));
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <Card elevation="raised">
        <CardHeader>
          <CardTitle>Offline Setup</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-deck-500">
              Players
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map(
                (count) => (
                  <button
                    key={count}
                    onClick={() => setSeatCount(count)}
                    className={`w-8 h-8 rounded-md text-xs font-bold border transition-colors ${
                      seatCount === count
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'border-surface-border text-deck-400 hover:border-amber-500/50'
                    }`}
                  >
                    {count}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {seats.map((seat, index) => (
              <SeatRow
                key={index}
                index={index}
                seat={seat}
                isLocalPlayer={index === 0 && seat?.id === player?.id}
                onAddHuman={() => addHuman(index)}
                onAddBot={() => addBot(index)}
                onRemove={() => updateSeat(index, null)}
                onRename={(name) => seat && updateSeat(index, { ...seat, displayName: name })}
                onDifficultyChange={(difficulty) =>
                  seat?.botConfig &&
                  updateSeat(index, {
                    ...seat,
                    botConfig: { ...seat.botConfig, difficulty },
                  })
                }
                onPersonalityChange={(personality) =>
                  seat?.botConfig &&
                  updateSeat(index, {
                    ...seat,
                    botConfig: { ...seat.botConfig, personality },
                  })
                }
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFillWithBots}>
              <Bot className="w-4 h-4" /> Fill with Bots
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="arcade" size="lg" disabled={!canStart} onClick={handleStart}>
          <Dices className="w-4 h-4" /> Start Game
        </Button>
      </div>
    </div>
  );
}

interface SeatRowProps {
  index: number;
  seat: LudoPlayer | null;
  isLocalPlayer: boolean;
  onAddHuman: () => void;
  onAddBot: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
  onDifficultyChange: (difficulty: LudoBotDifficulty) => void;
  onPersonalityChange: (personality: LudoBotPersonality) => void;
}

function SeatRow({
  index,
  seat,
  isLocalPlayer,
  onAddHuman,
  onAddBot,
  onRemove,
  onRename,
  onDifficultyChange,
  onPersonalityChange,
}: SeatRowProps) {
  const theme = seat ? ludoColorTheme(seat.color) : null;

  return (
    <div className="flex items-center gap-3 rounded-md border border-surface-border bg-surface-overlay/50 px-3 py-2">
      <span className="w-5 text-xs font-mono text-deck-500">{index + 1}</span>

      {theme && (
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${theme.tailwindBg} text-white`}
          aria-hidden
        >
          {theme.symbol}
        </span>
      )}

      {!seat && (
        <div className="flex-1 flex items-center justify-between">
          <span className="text-xs text-deck-500">Empty</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={onAddHuman}>
              <User className="w-3.5 h-3.5" /> Human
            </Button>
            <Button variant="outline" size="sm" onClick={onAddBot}>
              <Bot className="w-3.5 h-3.5" /> Bot
            </Button>
          </div>
        </div>
      )}

      {seat && seat.type === 'human' && (
        <div className="flex-1 flex items-center gap-2">
          {isLocalPlayer ? (
            <span className="text-sm font-semibold text-deck-900 dark:text-white">
              {seat.displayName} <Badge size="sm">You</Badge>
            </span>
          ) : (
            <>
              <Input
                value={seat.displayName}
                onChange={(e) => onRename(e.target.value)}
                className="max-w-[160px]"
              />
              <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove player">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )}

      {seat && seat.type === 'bot' && seat.botConfig && (
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-deck-900 dark:text-white flex items-center gap-1">
            <Bot className="w-3.5 h-3.5" /> {seat.displayName}
          </span>
          <select
            value={seat.botConfig.difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as LudoBotDifficulty)}
            className="text-xs rounded border border-surface-border bg-surface-raised px-2 py-1"
            aria-label={`${seat.displayName} difficulty`}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={seat.botConfig.personality}
            onChange={(e) => onPersonalityChange(e.target.value as LudoBotPersonality)}
            className="text-xs rounded border border-surface-border bg-surface-raised px-2 py-1"
            aria-label={`${seat.displayName} personality`}
          >
            {PERSONALITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remove bot">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
