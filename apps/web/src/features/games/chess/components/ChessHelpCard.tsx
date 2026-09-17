'use client';

import { Keyboard } from 'lucide-react';

const KEYS: { keys: string; action: string }[] = [
  { keys: 'Tab', action: 'Move focus onto the board' },
  { keys: '← ↑ → ↓', action: 'Move around the board' },
  { keys: 'Ctrl + arrow', action: 'Jump to the edge' },
  { keys: 'Enter or Space', action: 'Pick up, then place a piece' },
  { keys: 'Esc', action: 'Put the piece back down' },
  { keys: 'F', action: 'Flip the board' },
  { keys: 'U', action: 'Take back a move' },
];

/**
 * The keyboard is a first-class way to play here, not a fallback, so the keys
 * are documented on screen rather than left to be discovered.
 */
export function ChessHelpCard() {
  return (
    <section
      aria-label="Keyboard controls"
      className="rounded-xl border border-surface-border bg-surface-raised p-3"
    >
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deck-400 font-display">
        <Keyboard className="h-3.5 w-3.5" />
        Keyboard
      </h3>

      <dl className="flex flex-col gap-1">
        {KEYS.map(({ keys, action }) => (
          <div key={keys} className="flex items-center justify-between gap-3">
            <dt>
              <kbd className="rounded border border-surface-border bg-surface-overlay px-1.5 py-0.5 font-mono text-[10px] font-semibold text-deck-300">
                {keys}
              </kbd>
            </dt>
            <dd className="text-right text-[11px] text-deck-500">{action}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
