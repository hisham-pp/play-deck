import React from 'react';

export interface GameControlItem {
  key: string;
  action: string;
}

export function GameControlsTab({ controls }: { controls: GameControlItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {controls.map((ctrl, idx) => (
        <div
          key={idx}
          className="p-3 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-1"
        >
          <kbd className="inline-block px-2 py-1 text-xs font-mono font-bold bg-surface-base border border-surface-border rounded text-amber-500 w-fit">
            {ctrl.key}
          </kbd>
          <span className="text-xs text-deck-600 dark:text-deck-300 font-medium">
            {ctrl.action}
          </span>
        </div>
      ))}
    </div>
  );
}
