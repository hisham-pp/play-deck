'use client';

import { Keyboard, RotateCcw, Settings2 } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';

export interface PushYourLuckControlsCardProps {
  onNewMatch: () => void;
  onOpenSetup: () => void;
}

const SHORTCUTS = [
  { key: 'P / Space / ↑', action: 'Push — draw again' },
  { key: 'B / Enter / ↓', action: 'Bank the pot' },
  { key: 'R', action: 'New match' },
];

export function PushYourLuckControlsCard({
  onNewMatch,
  onOpenSetup,
}: PushYourLuckControlsCardProps) {
  return (
    <section className="w-full rounded-xl border border-surface-border bg-surface-overlay/60 p-3 flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Controls</span>
        </h2>
        <dl className="flex flex-col gap-1">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between gap-2 text-[11px]">
              <dt className="font-mono text-deck-400">{shortcut.key}</dt>
              <dd className="text-deck-500 text-right">{shortcut.action}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewMatch}
          className="flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rematch</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSetup}
          className="flex items-center justify-center gap-1.5"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Table</span>
        </Button>
      </div>
    </section>
  );
}
