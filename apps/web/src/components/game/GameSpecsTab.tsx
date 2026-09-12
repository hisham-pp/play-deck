import React from 'react';

export function GameSpecsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-1">
        <span className="text-deck-500 font-medium">Session Storage</span>
        <span className="text-sm font-bold text-deck-900 dark:text-white">IndexedDB (Dexie)</span>
        <p className="text-[11px] text-deck-400 mt-1">
          Local saves and match stats persist offline.
        </p>
      </div>
      <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-1">
        <span className="text-deck-500 font-medium">Engine Mode</span>
        <span className="text-sm font-bold text-deck-900 dark:text-white">Framework-Agnostic</span>
        <p className="text-[11px] text-deck-400 mt-1">
          Decoupled state machine plug-and-play architecture.
        </p>
      </div>
      <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border flex flex-col gap-1">
        <span className="text-deck-500 font-medium">Multiplayer Readiness</span>
        <span className="text-sm font-bold text-amber-500">Contract Ready (Phase 2)</span>
        <p className="text-[11px] text-deck-400 mt-1">
          Reserved lobby, room code, and WebRTC transport.
        </p>
      </div>
    </div>
  );
}
