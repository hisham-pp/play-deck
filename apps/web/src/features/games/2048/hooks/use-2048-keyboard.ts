import { useEffect } from 'react';
import type { Direction } from '../types/2048.types';

interface Use2048KeyboardProps {
  onMove: (direction: Direction) => void;
  onUndo?: () => void;
  onRestart?: () => void;
  enabled?: boolean;
}

function isTextInput(target: HTMLElement | null): boolean {
  if (!target) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

const DIRECTION_KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'UP',
  KeyW: 'UP',
  ArrowDown: 'DOWN',
  KeyS: 'DOWN',
  ArrowLeft: 'LEFT',
  KeyA: 'LEFT',
  ArrowRight: 'RIGHT',
  KeyD: 'RIGHT',
};

function getDirectionFromKey(e: KeyboardEvent): Direction | null {
  return DIRECTION_KEY_MAP[e.code] ?? DIRECTION_KEY_MAP[e.key] ?? null;
}

function isUndoTrigger(e: KeyboardEvent): boolean {
  if (e.key === 'u' || e.key === 'U') return true;
  return (e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey);
}

function isRestartTrigger(e: KeyboardEvent): boolean {
  return (e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey;
}

export function use2048Keyboard({
  onMove,
  onUndo,
  onRestart,
  enabled = true,
}: Use2048KeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextInput(e.target as HTMLElement | null)) {
        return;
      }

      const direction = getDirectionFromKey(e);
      if (direction) {
        onMove(direction);
        e.preventDefault();
        return;
      }

      if (onUndo && isUndoTrigger(e)) {
        onUndo();
        e.preventDefault();
        return;
      }

      if (onRestart && isRestartTrigger(e)) {
        onRestart();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, onUndo, onRestart, enabled]);
}
