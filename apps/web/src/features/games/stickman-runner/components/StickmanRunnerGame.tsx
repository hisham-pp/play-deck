'use client';

import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialStickmanRunnerState,
  stepStickmanRunnerGame,
  triggerJump,
} from '../engine/stickman-runner-engine';

const STAGE_HEIGHT = 420;

export function StickmanRunnerGame() {
  const [state, setState] = useState(() => createInitialStickmanRunnerState(0));
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const handleJump = useCallback(() => {
    setState((previous) => {
      if (previous.status === 'game-over') {
        return { ...createInitialStickmanRunnerState(previous.highScore), status: 'running' };
      }

      const jumped = triggerJump(previous);
      if (jumped !== previous) {
        return jumped;
      }

      return stepStickmanRunnerGame(previous, 0.016, true);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
        event.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  useEffect(() => {
    const tick = (time: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = time;
      }

      const dt = Math.min(0.032, (time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;

      setState((previous) => stepStickmanRunnerGame(previous, dt, false));
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const restart = () => {
    setState((previous) => createInitialStickmanRunnerState(previous.highScore));
  };

  const playerStyle = {
    left: `${state.player.x}px`,
    top: `${state.player.y}px`,
    width: `${state.player.width}px`,
    height: `${state.player.height}px`,
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-deck-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Catalog</span>
        </Link>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
          <Trophy className="h-4 w-4" />
          <span>High Score {state.highScore}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Score</div>
            <div className="text-2xl font-black text-white">{state.score}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleJump}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{state.status === 'running' ? 'Jump' : 'Start'}</span>
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-amber-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#09111d]"
          aria-label="Stickman runner game board"
          style={{ height: `${STAGE_HEIGHT}px`, width: '100%' }}
          onPointerDown={handleJump}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,_rgba(17,24,39,0.8),_rgba(2,6,23,1))]" />

          <div className="absolute inset-x-0 bottom-0 h-14 border-t border-amber-500/40 bg-gradient-to-t from-emerald-950 to-slate-950" />

          {state.obstacles.map((obstacle) => (
            <div
              key={obstacle.id}
              className="absolute rounded-md border border-amber-500/70 bg-gradient-to-b from-amber-300 via-orange-500 to-amber-700 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
              style={{
                left: `${obstacle.x}px`,
                top: `${obstacle.y}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
              }}
            />
          ))}

          {state.pickups.map((pickup) => (
            <div
              key={pickup.id}
              className="absolute rounded-full border border-cyan-300 bg-gradient-to-br from-cyan-200 to-sky-500 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
              style={{
                left: `${pickup.x}px`,
                top: `${pickup.y}px`,
                width: `${pickup.radius * 2}px`,
                height: `${pickup.radius * 2}px`,
              }}
            />
          ))}

          <div
            className="absolute"
            style={playerStyle}
          >
            <div className="relative h-full w-full">
              <div className="absolute left-1/2 top-1 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-100 bg-slate-950" />
              <div className="absolute left-1/2 top-5 h-8 w-1 -translate-x-1/2 bg-slate-100" />
              <div className="absolute left-[18%] top-8 h-6 w-1 rotate-45 bg-slate-100" />
              <div className="absolute right-[18%] top-8 h-6 w-1 -rotate-45 bg-slate-100" />
              <div className="absolute left-[38%] top-12 h-7 w-1 rotate-[26deg] bg-slate-100" />
              <div className="absolute right-[38%] top-12 h-7 w-1 -rotate-[26deg] bg-slate-100" />
            </div>
          </div>

          {state.status !== 'running' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 backdrop-blur-[2px]">
              <div className="rounded-2xl border border-amber-500/35 bg-slate-900/80 px-6 py-5 text-center shadow-[0_0_35px_rgba(245,158,11,0.18)]">
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300">
                  {state.status === 'game-over' ? 'Run ended' : 'Ready'}
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {state.status === 'game-over' ? 'Try again' : 'Stickman Runner'}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-deck-300">
                  {state.status === 'game-over'
                    ? `You scored ${state.score}. Jump back in and beat your best.`
                    : 'Press [SPACE], tap, or hit jump to sprint and dodge the hazards.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-surface-border bg-surface-raised p-3 text-sm text-deck-300 md:grid-cols-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Status</div>
          <div className="mt-1 font-semibold text-white capitalize">{state.status}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Distance</div>
          <div className="mt-1 font-semibold text-white">{Math.floor(state.distance)}m</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Speed</div>
          <div className="mt-1 font-semibold text-white">{Math.round(state.speed)} px/s</div>
        </div>
      </div>
    </div>
  );
}
