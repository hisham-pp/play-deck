'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import { worldWidthForViewport } from '../engine/ball-bounce-constants';
import { stepGame } from '../engine/ball-bounce-engine';
import { toHud } from '../engine/ball-bounce-hud';
import {
  createInitialState,
  pauseGame,
  resizeWorld,
  resumeGame,
  startGame,
} from '../engine/ball-bounce-state';
import { BallBounceEffects } from '../render/ball-bounce-effects';
import { BallBounceRenderer } from '../render/ball-bounce-renderer';
import { ballBounceSound } from '../services/ball-bounce-sound.service';
import { ballBounceStatsRepository } from '../services/ball-bounce-stats-repository';
import type {
  BallBounceHud,
  BallBounceInput,
  BallBounceState,
  BallBounceStats,
  BallBounceStatus,
} from '../types/ball-bounce.types';
import { useBallBounceInput } from './use-ball-bounce-input';
import type { BallBounceKeyAction } from './use-ball-bounce-input';

function sameHud(a: BallBounceHud, b: BallBounceHud): boolean {
  return (Object.keys(a) as (keyof BallBounceHud)[]).every((key) => a[key] === b[key]);
}

interface Options {
  onGameOver?: (hud: BallBounceHud) => void;
}

/** Keeps the renderer sized to the stage and the world shaped like the viewport. */
function useStageSizing(
  stageRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  rendererRef: RefObject<BallBounceRenderer | null>,
  stateRef: RefObject<BallBounceState>,
) {
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const renderer = new BallBounceRenderer(canvas);
    rendererRef.current = renderer;

    const apply = () => {
      const { width, height } = stage.getBoundingClientRect();
      renderer.resize(width, height, window.devicePixelRatio || 1);
      const worldW = worldWidthForViewport(width, height);
      const state = stateRef.current;
      if (state.status === 'idle') {
        // Nothing in play yet, so rebuild with a column count that suits the new shape.
        stateRef.current = createInitialState(state.score.highScore, worldW);
      } else {
        resizeWorld(state, worldW);
      }
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(stage);
    return () => {
      observer.disconnect();
      rendererRef.current = null;
    };
  }, [stageRef, canvasRef, rendererRef, stateRef]);
}

/** Beeps on each new countdown number, ending with a higher "go" tone. */
function makeCountdownTicker() {
  let last = -1;
  return (state: BallBounceState) => {
    if (state.status !== 'countdown') {
      last = -1;
      return;
    }
    const count = Math.ceil(state.countdown);
    if (last !== -1 && count !== last) ballBounceSound.countdownTick(count === 0);
    last = count;
  };
}

interface KeyHandlers {
  start: () => void;
  pause: () => void;
  resume: () => void;
  launch: () => void;
}

/** Space/Enter means "do the obvious thing"; P/Escape toggles pause. */
function routeKeyAction(action: BallBounceKeyAction, status: BallBounceStatus, h: KeyHandlers) {
  if (action === 'pause') {
    if (status === 'paused') h.resume();
    else h.pause();
  } else if (status === 'idle' || status === 'over') {
    h.start();
  } else if (status === 'paused') {
    h.resume();
  } else {
    h.launch();
  }
}

/** One frame: simulate, add juice, play sounds, draw. Returns true if the run just ended. */
function runFrame(
  state: BallBounceState,
  input: BallBounceInput,
  effects: BallBounceEffects,
  renderer: BallBounceRenderer | null,
  dt: number,
): boolean {
  const events = stepGame(state, input, dt);
  input.launch = false;
  if (state.status !== 'paused') {
    effects.consume(events);
    effects.update(Math.min(dt, 0.05));
  }
  ballBounceSound.play(events);
  renderer?.draw(state, effects);
  return events.some((e) => e.type === 'game-over');
}

/** Auto-pause when the tab is hidden or the window loses focus. */
function useAutoPause(pause: () => void) {
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('blur', pause);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('blur', pause);
    };
  }, [pause]);
}

export function useBallBounceGame({ onGameOver }: Options = {}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<BallBounceRenderer | null>(null);
  const [initial] = useState(() => ({
    state: createInitialState(),
    effects: new BallBounceEffects(),
  }));
  const effectsRef = useRef(initial.effects);
  const stateRef = useRef<BallBounceState>(initial.state);
  const inputRef = useRef<BallBounceInput>({
    left: false,
    right: false,
    pointerX: null,
    launch: false,
  });
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  const [hud, setHud] = useState<BallBounceHud>(() => toHud(initial.state));
  const [stats, setStats] = useState<BallBounceStats | null>(null);
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);
  useEffect(() => {
    effectsRef.current.reducedMotion = reducedMotion;
  }, [reducedMotion]);

  const syncHud = useCallback(() => {
    const next = toHud(stateRef.current);
    setHud((prev) => (sameHud(prev, next) ? prev : next));
  }, []);

  // Load the persisted high score.
  useEffect(() => {
    let alive = true;
    void ballBounceStatsRepository.getStats().then((loaded) => {
      if (!alive) return;
      setStats(loaded);
      const { score, status } = stateRef.current;
      score.highScore = Math.max(score.highScore, loaded.highScore);
      if (status === 'idle') score.startingHighScore = score.highScore;
      syncHud();
    });
    return () => {
      alive = false;
    };
  }, [syncHud]);

  const start = useCallback(() => {
    ballBounceSound.unlock();
    stateRef.current = startGame(stateRef.current);
    effectsRef.current.reset();
    ballBounceSound.countdownTick(false);
    syncHud();
  }, [syncHud]);

  const pause = useCallback(() => {
    pauseGame(stateRef.current);
    syncHud();
  }, [syncHud]);

  const resume = useCallback(() => {
    ballBounceSound.unlock();
    resumeGame(stateRef.current);
    syncHud();
  }, [syncHud]);

  const onKeyAction = useCallback(
    (action: BallBounceKeyAction) =>
      routeKeyAction(action, stateRef.current.status, {
        start,
        pause,
        resume,
        launch: () => {
          inputRef.current.launch = true;
        },
      }),
    [pause, resume, start],
  );

  const onTap = useCallback(() => {
    ballBounceSound.unlock();
    if (stateRef.current.status === 'playing') inputRef.current.launch = true;
  }, []);

  useBallBounceInput({ inputRef, stageRef, rendererRef, onKeyAction, onTap });
  useStageSizing(stageRef, canvasRef, rendererRef, stateRef);
  useAutoPause(pause);

  const finishRun = useCallback((state: BallBounceState) => {
    const summary = toHud(state);
    void ballBounceStatsRepository
      .recordRun({
        score: summary.score,
        level: summary.level,
        bestCombo: summary.bestCombo,
        blocksBroken: summary.blocksBroken,
      })
      .then(({ stats: saved }) => setStats(saved));
    onGameOverRef.current?.(summary);
  }, []);

  // Main requestAnimationFrame loop: simulate, add juice, draw, then sync the HUD.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tickCountdown = makeCountdownTicker();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (now - last) / 1000;
      last = now;
      const state = stateRef.current;
      const gameOver = runFrame(
        state,
        inputRef.current,
        effectsRef.current,
        rendererRef.current,
        dt,
      );
      tickCountdown(state);
      if (gameOver) finishRun(state);
      syncHud();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [syncHud, finishRun]);

  return {
    stageRef,
    canvasRef,
    hud,
    stats,
    controls: { start, pause, resume, restart: start },
  };
}
