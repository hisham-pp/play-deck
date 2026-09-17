'use client';

import { useEffect, useRef, useState } from 'react';
import type { PongInputs } from '../engine/pong-types';

interface UsePongKeyboardProps {
  onTogglePause?: () => void;
  onRestart?: () => void;
  enabled?: boolean;
}

export function usePongKeyboard({
  onTogglePause,
  onRestart,
  enabled = true,
}: UsePongKeyboardProps = {}) {
  const [inputs, setInputs] = useState<PongInputs>({
    player1: { up: false, down: false },
    player2: { up: false, down: false },
  });

  const inputsRef = useRef<PongInputs>(inputs);
  inputsRef.current = inputs;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing inside an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePause?.();
        return;
      }

      if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onRestart?.();
        return;
      }

      let p1Changed = false;
      let p2Changed = false;
      const current = inputsRef.current;
      const nextP1 = { ...current.player1 };
      const nextP2 = { ...current.player2 };

      // Player 1: W / S
      if (e.code === 'KeyW') {
        if (!nextP1.up) {
          nextP1.up = true;
          p1Changed = true;
        }
      } else if (e.code === 'KeyS') {
        if (!nextP1.down) {
          nextP1.down = true;
          p1Changed = true;
        }
      }

      // Player 2: ArrowUp / ArrowDown
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (!nextP2.up) {
          nextP2.up = true;
          p2Changed = true;
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (!nextP2.down) {
          nextP2.down = true;
          p2Changed = true;
        }
      }

      if (p1Changed || p2Changed) {
        setInputs({
          player1: nextP1,
          player2: nextP2,
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let p1Changed = false;
      let p2Changed = false;
      const current = inputsRef.current;
      const nextP1 = { ...current.player1 };
      const nextP2 = { ...current.player2 };

      if (e.code === 'KeyW') {
        if (nextP1.up) {
          nextP1.up = false;
          p1Changed = true;
        }
      } else if (e.code === 'KeyS') {
        if (nextP1.down) {
          nextP1.down = false;
          p1Changed = true;
        }
      }

      if (e.code === 'ArrowUp') {
        if (nextP2.up) {
          nextP2.up = false;
          p2Changed = true;
        }
      } else if (e.code === 'ArrowDown') {
        if (nextP2.down) {
          nextP2.down = false;
          p2Changed = true;
        }
      }

      if (p1Changed || p2Changed) {
        setInputs({
          player1: nextP1,
          player2: nextP2,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, onTogglePause, onRestart]);

  return inputs;
}
