import { useEffect } from 'react';

export interface PushYourLuckKeyboardOptions {
  onPush: () => void;
  onBank: () => void;
  onNewMatch: () => void;
  isEnabled: boolean;
}

const PUSH_KEYS = new Set(['p', 'arrowup', ' ', 'spacebar']);
const BANK_KEYS = new Set(['b', 'arrowdown', 'enter']);

/**
 * Two-key interface: push and bank. Handled at the document level so the game
 * responds without the player first having to focus a control.
 */
export function usePushYourLuckKeyboard({
  onPush,
  onBank,
  onNewMatch,
  isEnabled,
}: PushYourLuckKeyboardOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      const key = event.key.toLowerCase();

      if (key === 'r') {
        event.preventDefault();
        onNewMatch();
        return;
      }

      if (!isEnabled) return;

      if (PUSH_KEYS.has(key)) {
        event.preventDefault();
        onPush();
        return;
      }

      if (BANK_KEYS.has(key)) {
        event.preventDefault();
        onBank();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPush, onBank, onNewMatch, isEnabled]);
}
