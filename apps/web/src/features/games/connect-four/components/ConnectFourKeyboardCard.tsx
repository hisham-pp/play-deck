'use client';

import { Keyboard } from 'lucide-react';
import React from 'react';

const KBD_BADGE_CLASS =
  'px-1.5 py-0.5 rounded bg-deck-800/60 border border-surface-border font-mono text-[10px] text-deck-300';
const ROW_BETWEEN = 'flex items-center justify-between';

export function ConnectFourKeyboardCard() {
  return (
    <div className="w-full bg-surface-raised border border-surface-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-deck-400">
        <Keyboard className="w-3.5 h-3.5" />
        <span className="text-xs font-bold uppercase tracking-wider font-display">
          Keyboard Controls
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-surface-border/50 text-xs text-deck-400 font-mono">
        <div className={ROW_BETWEEN}>
          <span>Select Column</span>
          <div className="flex items-center gap-1">
            <kbd className={KBD_BADGE_CLASS}>←</kbd>
            <kbd className={KBD_BADGE_CLASS}>→</kbd>
          </div>
        </div>

        <div className={ROW_BETWEEN}>
          <span>Drop Piece</span>
          <div className="flex items-center gap-1">
            <kbd className={KBD_BADGE_CLASS}>Space</kbd>
            <span className="text-deck-600">/</span>
            <kbd className={KBD_BADGE_CLASS}>↓</kbd>
          </div>
        </div>

        <div className={ROW_BETWEEN}>
          <span>Direct Drop</span>
          <kbd className={KBD_BADGE_CLASS}>1 – 7</kbd>
        </div>

        <div className={ROW_BETWEEN}>
          <span>Next Round</span>
          <kbd className={KBD_BADGE_CLASS}>R</kbd>
        </div>
      </div>
    </div>
  );
}
