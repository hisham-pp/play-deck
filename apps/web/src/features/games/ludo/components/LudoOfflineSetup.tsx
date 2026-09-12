'use client';

import { Bot, Dices } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateId } from '@playdeck/shared';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { addBotToFirstEmptySeat, fillEmptySeatsWithBots } from '../bots/bot-fill';
import { LUDO_BOT_DEFINITIONS } from '../bots/bot-registry';
import { MAX_PLAYERS, MIN_PLAYERS } from '../engine/ludo-constants';
import { ludoPreferencesRepository } from '../services/ludo-preferences-repository';
import type { LudoBotDifficulty, LudoBotPersonality, LudoPlayer } from '../types/ludo.types';
import { finalizeSeats } from '../utils/finalize-seats';
import { SeatRow } from './LudoSeatRow';

const TYPE_HUMAN = 'human';
const ICON_SM = 'w-4 h-4';

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
          type: TYPE_HUMAN,
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
      id: generateId(TYPE_HUMAN),
      displayName: `Player ${index + 1}`,
      type: TYPE_HUMAN,
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
          type: TYPE_HUMAN,
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
                onDifficultyChange={(difficulty: LudoBotDifficulty) =>
                  seat?.botConfig &&
                  updateSeat(index, {
                    ...seat,
                    botConfig: { ...seat.botConfig, difficulty },
                  })
                }
                onPersonalityChange={(personality: LudoBotPersonality) =>
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
              <Bot className={ICON_SM} /> Fill with Bots
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="arcade" size="lg" disabled={!canStart} onClick={handleStart}>
          <Dices className={ICON_SM} /> Start Game
        </Button>
      </div>
    </div>
  );
}
