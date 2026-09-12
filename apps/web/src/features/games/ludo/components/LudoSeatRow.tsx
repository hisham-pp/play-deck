'use client';

import { Bot, Trash2, User } from 'lucide-react';
import React from 'react';
import { Badge, Button, Input } from '@playdeck/ui';
import type { LudoBotDifficulty, LudoBotPersonality, LudoPlayer } from '../types/ludo.types';
import { ludoColorTheme } from '../utils/ludo-colors';

const DIFFICULTIES: LudoBotDifficulty[] = ['easy', 'normal', 'hard'];
const PERSONALITIES: LudoBotPersonality[] = ['balanced', 'aggressive', 'defensive', 'rusher'];
const TYPE_HUMAN = 'human';
const ICON_SM = 'w-4 h-4';
const ICON_XS = 'w-3.5 h-3.5';

export interface SeatRowProps {
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

export function SeatRow({
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
              <User className={ICON_XS} /> Human
            </Button>
            <Button variant="outline" size="sm" onClick={onAddBot}>
              <Bot className={ICON_XS} /> Bot
            </Button>
          </div>
        </div>
      )}

      {seat && seat.type === TYPE_HUMAN && (
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
                <Trash2 className={ICON_SM} />
              </Button>
            </>
          )}
        </div>
      )}

      {seat && seat.type === 'bot' && seat.botConfig && (
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-deck-900 dark:text-white flex items-center gap-1">
            <Bot className={ICON_XS} /> {seat.displayName}
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
            <Trash2 className={ICON_SM} />
          </Button>
        </div>
      )}
    </div>
  );
}
