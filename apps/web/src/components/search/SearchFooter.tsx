'use client';

import { CornerDownLeft, Sparkles } from 'lucide-react';
import React from 'react';

interface SearchFooterProps {
  count: number;
  isMac: boolean;
}

const KBD_CLASS =
  'px-1.5 py-0.5 rounded bg-surface-overlay border border-surface-border font-mono text-[10px] text-deck-300';
const SHORTCUT_ROW_CLASS = 'flex items-center gap-1';

export function SearchFooter({ count, isMac }: SearchFooterProps) {
  return (
    <div className="px-4 py-2.5 border-t border-surface-border bg-surface-base/90 flex flex-wrap items-center justify-between gap-3 text-xs text-deck-500">
      <div className="flex items-center gap-3">
        <span className={SHORTCUT_ROW_CLASS}>
          <kbd className={KBD_CLASS}>↑</kbd>
          <kbd className={KBD_CLASS}>↓</kbd>
          <span className="ml-1 text-deck-400">Navigate</span>
        </span>

        <span className={SHORTCUT_ROW_CLASS}>
          <kbd className={`${KBD_CLASS} flex items-center gap-0.5`}>
            <CornerDownLeft className="w-2.5 h-2.5" /> Enter
          </kbd>
          <span className="ml-1 text-deck-400">Play</span>
        </span>

        <span className={`hidden sm:${SHORTCUT_ROW_CLASS}`}>
          <kbd className={KBD_CLASS}>Shift + Enter</kbd>
          <span className="ml-1 text-deck-400">Overview</span>
        </span>
      </div>

      <div className="flex items-center gap-2 text-deck-400">
        <span className={SHORTCUT_ROW_CLASS}>
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>
            {count} {count === 1 ? 'game' : 'games'}
          </span>
        </span>
        <span>•</span>
        <span className={SHORTCUT_ROW_CLASS}>
          <kbd className={KBD_CLASS}>{isMac ? '⌘K' : 'Ctrl+K'}</kbd>
          <span className="text-deck-500">to toggle</span>
        </span>
      </div>
    </div>
  );
}
