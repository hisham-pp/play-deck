import { useEffect, useMemo, useRef, useState } from 'react';
import { RunicMemoryEngine } from '../engine/runic-memory-engine';
import { runicSound } from '../services/runic-sound.service';
import { runicSpeech } from '../services/runic-speech.service';
import type {
  ActivePlayer,
  AIDifficulty,
  DifficultyLevel,
  GameMode,
  RunicCard,
  RunicGameState,
} from '../types/runic-memory.types';

export function useRunicEngine(
  onGameOver?: (finalState: RunicGameState) => void,
  initialDifficulty: DifficultyLevel = 'apprentice',
  initialMode: GameMode = 'solo',
  initialAiDifficulty: AIDifficulty = 'medium',
) {
  const engineRef = useRef<RunicMemoryEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new RunicMemoryEngine(
      {
        mode: initialMode,
        difficulty: initialDifficulty,
        aiDifficulty: initialAiDifficulty,
      },
      {
        onCardFlipped: (card: RunicCard) => {
          runicSound.playCardFlip();
          runicSpeech.speakRune(card.rune);
        },
        onMatchFound: (_cards: [RunicCard, RunicCard], _player: ActivePlayer, combo: number) => {
          runicSound.playMatch();
          if (combo > 1) {
            runicSpeech.speakEvent(`Streak combo times ${combo}`);
          }
        },
        onMismatch: () => {
          runicSound.playMismatch();
        },
        onGameOver: (state: RunicGameState) => {
          runicSound.playVictory();
          runicSpeech.speakEvent('Runes cleared! Match victory.');
          onGameOver?.(state);
        },
      },
    );
  }

  const engine = engineRef.current;
  const [state, setState] = useState<RunicGameState>(() => engine.getState());

  useEffect(() => {
    return engine.subscribe((nextState) => {
      setState(nextState);
    });
  }, [engine]);

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  const flipCard = useMemo(
    () => (index: number, requestedPlayer?: ActivePlayer) => {
      return engine.flipCard(index, requestedPlayer);
    },
    [engine],
  );

  const resetRound = useMemo(
    () => (seed?: number) => {
      engine.resetRound(seed);
    },
    [engine],
  );

  const resetMatch = useMemo(
    () =>
      (
        difficulty?: DifficultyLevel,
        mode?: GameMode,
        aiDifficulty?: AIDifficulty,
        seed?: number,
      ) => {
        engine.resetMatch(difficulty, mode, aiDifficulty, seed);
      },
    [engine],
  );

  const setDifficulty = useMemo(
    () => (diff: DifficultyLevel) => {
      engine.resetMatch(diff);
    },
    [engine],
  );

  const setMode = useMemo(
    () => (mode: GameMode) => {
      engine.resetMatch(undefined, mode);
    },
    [engine],
  );

  const setAiDifficulty = useMemo(
    () => (aiDiff: AIDifficulty) => {
      engine.resetMatch(undefined, undefined, aiDiff);
    },
    [engine],
  );

  return {
    engine,
    state,
    flipCard,
    resetRound,
    resetMatch,
    setDifficulty,
    setMode,
    setAiDifficulty,
  };
}
