'use client';

import { ArrowLeft, ArrowRight, Heart, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  advanceToNextLevel,
  createInitialPlatformerState,
  PLATFORMER_LEVELS,
  PlatformerInput,
  stepPlatformerGame,
  StickmanPlatformerState,
} from '../engine/stickman-platformer-engine';

const STAGE_HEIGHT = 440;
const VIEW_WIDTH = 900;

export function StickmanPlatformerGame() {
  const [state, setState] = useState<StickmanPlatformerState>(() =>
    createInitialPlatformerState(0, 0),
  );
  const [input, setInput] = useState<PlatformerInput>({ left: false, right: false, jump: false });
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const inputRef = useRef<PlatformerInput>(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const handleNextLevel = useCallback(() => {
    setState((prev) => advanceToNextLevel(prev));
  }, []);

  const handleRestart = useCallback(() => {
    setState((prev) => createInitialPlatformerState(prev.highScore, 0));
  }, []);

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.status === 'running') return { ...prev, status: 'paused' };
      if (prev.status === 'paused') return { ...prev, status: 'running' };
      return prev;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setInput((p) => ({ ...p, left: true }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setInput((p) => ({ ...p, right: true }));
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        e.preventDefault();
        setInput((p) => ({ ...p, jump: true }));
      } else if (e.code === 'KeyP') {
        togglePause();
      } else if (e.code === 'KeyR') {
        handleRestart();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setInput((p) => ({ ...p, left: false }));
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setInput((p) => ({ ...p, right: false }));
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        setInput((p) => ({ ...p, jump: false }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [togglePause, handleRestart]);

  // Main game loop
  useEffect(() => {
    const tick = (time: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = time;
      }
      const dt = Math.min(0.032, (time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;

      setState((prev) => stepPlatformerGame(prev, dt, inputRef.current));
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Camera offset centered around player
  const cameraX = Math.max(
    0,
    Math.min(state.level.worldWidth - VIEW_WIDTH, state.player.x - VIEW_WIDTH / 2),
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-deck-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Catalog</span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em]">
          <div className="flex items-center gap-1.5 text-rose-400">
            {Array.from({ length: state.maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${i < state.lives ? 'fill-rose-500 text-rose-500' : 'text-slate-700'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy className="h-4 w-4" />
            <span>High {state.highScore}</span>
          </div>
        </div>
      </div>

      {/* Main arcade container */}
      <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
        {/* Controls HUD */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">
                Level {state.level.id}/{PLATFORMER_LEVELS.length}
              </div>
              <div className="text-sm font-bold text-white">{state.level.name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Score</div>
              <div className="text-xl font-black text-amber-400">{state.score}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Coins</div>
              <div className="text-base font-bold text-emerald-400">{state.coinsCollected}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePause}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-amber-500"
            >
              {state.status === 'paused' ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
              <span>{state.status === 'paused' ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-amber-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Playable Stage viewport */}
        <div
          className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#09111d]"
          style={{ height: `${STAGE_HEIGHT}px`, width: '100%' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_35%),linear-gradient(180deg,_rgba(17,24,39,0.7),_rgba(2,6,23,0.95))]" />

          {/* World Canvas Layer with camera transform */}
          <div
            className="absolute inset-0 transition-transform duration-75 ease-out"
            style={{ transform: `translateX(-${cameraX}px)` }}
          >
            {/* Platforms */}
            {state.level.platforms.map((plat, idx) => (
              <div
                key={idx}
                className={`absolute rounded-md border ${
                  plat.type === 'bouncy'
                    ? 'border-purple-400/80 bg-gradient-to-t from-purple-900 to-fuchsia-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : plat.type === 'moving'
                      ? 'border-cyan-400/80 bg-gradient-to-t from-slate-900 to-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'border-emerald-600/60 bg-gradient-to-t from-slate-900 to-emerald-900 shadow-sm'
                }`}
                style={{
                  left: `${plat.x}px`,
                  top: `${plat.y}px`,
                  width: `${plat.width}px`,
                  height: `${plat.height}px`,
                }}
              />
            ))}

            {/* Hazards (Spikes & Pits) */}
            {state.level.hazards.map((hazard) => (
              <div
                key={hazard.id}
                className="absolute flex items-center justify-center bg-gradient-to-t from-rose-950 to-red-800/80"
                style={{
                  left: `${hazard.x}px`,
                  top: `${hazard.y}px`,
                  width: `${hazard.width}px`,
                  height: `${hazard.height}px`,
                }}
              >
                <div className="h-full w-full border-t-2 border-red-500 bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_8px,#7f1d1d_8px,#7f1d1d_16px)] opacity-80" />
              </div>
            ))}

            {/* Checkpoints */}
            {state.level.checkpoints.map((cp) => (
              <div
                key={cp.id}
                className="absolute flex flex-col items-center"
                style={{ left: `${cp.x}px`, top: `${cp.y}px`, width: '30px', height: '40px' }}
              >
                <div
                  className={`h-5 w-6 rounded border transition-colors ${
                    cp.active
                      ? 'border-emerald-400 bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                      : 'border-slate-500 bg-slate-700'
                  }`}
                />
                <div className="h-5 w-1 bg-slate-400" />
              </div>
            ))}

            {/* Coins */}
            {state.level.coins.map(
              (coin) =>
                !coin.collected && (
                  <div
                    key={coin.id}
                    className="absolute animate-pulse rounded-full border border-amber-300 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                    style={{
                      left: `${coin.x - coin.radius}px`,
                      top: `${coin.y - coin.radius}px`,
                      width: `${coin.radius * 2}px`,
                      height: `${coin.radius * 2}px`,
                    }}
                  />
                ),
            )}

            {/* Patrol Enemies */}
            {state.level.enemies.map(
              (enemy) =>
                enemy.alive && (
                  <div
                    key={enemy.id}
                    className="absolute flex items-center justify-center rounded-lg border border-red-500 bg-gradient-to-b from-red-600 to-rose-900 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    style={{
                      left: `${enemy.x}px`,
                      top: `${enemy.y}px`,
                      width: `${enemy.width}px`,
                      height: `${enemy.height}px`,
                    }}
                  >
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  </div>
                ),
            )}

            {/* Exit Portal */}
            <div
              className="absolute flex items-center justify-center rounded-xl border-2 border-emerald-400 bg-gradient-to-t from-emerald-950 via-teal-900 to-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.7)]"
              style={{
                left: `${state.level.exit.x}px`,
                top: `${state.level.exit.y}px`,
                width: `${state.level.exit.width}px`,
                height: `${state.level.exit.height}px`,
              }}
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                EXIT
              </div>
            </div>

            {/* Player Stickman */}
            <div
              className="absolute transition-transform duration-75"
              style={{
                left: `${state.player.x}px`,
                top: `${state.player.y}px`,
                width: `${state.player.width}px`,
                height: `${state.player.height}px`,
                transform: state.player.facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              }}
            >
              <div className="relative h-full w-full">
                <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-slate-100 bg-slate-900 shadow-sm" />
                <div className="absolute left-1/2 top-4 h-7 w-1 -translate-x-1/2 bg-slate-100" />
                <div className="absolute left-[20%] top-6 h-5 w-1 rotate-45 bg-slate-100" />
                <div className="absolute right-[20%] top-6 h-5 w-1 -rotate-45 bg-amber-400" />
                <div className="absolute left-[35%] top-11 h-6 w-1 rotate-[20deg] bg-slate-100" />
                <div className="absolute right-[35%] top-11 h-6 w-1 -rotate-[20deg] bg-slate-100" />
              </div>
            </div>
          </div>

          {/* Overlays */}
          {state.status === 'level-cleared' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
              <div className="rounded-2xl border border-emerald-500/50 bg-slate-900/90 p-6 text-center shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400">
                  Level Complete!
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">Stage Cleared</h3>
                <p className="mt-1 text-sm text-deck-300">Bonus points awarded.</p>
                <button
                  onClick={handleNextLevel}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400"
                >
                  <span>Next Level</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {state.status === 'game-over' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
              <div className="rounded-2xl border border-rose-500/50 bg-slate-900/90 p-6 text-center shadow-[0_0_35px_rgba(244,63,94,0.25)]">
                <div className="text-xs uppercase tracking-[0.25em] text-rose-400">Game Over</div>
                <h3 className="mt-2 text-2xl font-black text-white">All Lives Lost</h3>
                <p className="mt-1 text-sm text-deck-300">Final score: {state.score}</p>
                <button
                  onClick={handleRestart}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {state.status === 'victory' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
              <div className="rounded-2xl border border-amber-500/50 bg-slate-900/90 p-6 text-center shadow-[0_0_35px_rgba(245,158,11,0.25)]">
                <div className="text-xs uppercase tracking-[0.25em] text-amber-300">Victory!</div>
                <h3 className="mt-2 text-3xl font-black text-white">All Stages Conquered</h3>
                <p className="mt-1 text-sm text-deck-300">Grand Total Score: {state.score}</p>
                <button
                  onClick={handleRestart}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-amber-400"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* On-screen touch controls for mobile & tablets */}
        <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-3">
          <div className="flex items-center gap-2">
            <button
              onPointerDown={() => setInput((p) => ({ ...p, left: true }))}
              onPointerUp={() => setInput((p) => ({ ...p, left: false }))}
              onPointerLeave={() => setInput((p) => ({ ...p, left: false }))}
              className="flex h-12 w-14 items-center justify-center rounded-xl border border-surface-border bg-surface-overlay text-white active:bg-amber-500 active:text-black"
              aria-label="Move left"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              onPointerDown={() => setInput((p) => ({ ...p, right: true }))}
              onPointerUp={() => setInput((p) => ({ ...p, right: false }))}
              onPointerLeave={() => setInput((p) => ({ ...p, right: false }))}
              className="flex h-12 w-14 items-center justify-center rounded-xl border border-surface-border bg-surface-overlay text-white active:bg-amber-500 active:text-black"
              aria-label="Move right"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center text-xs text-deck-400 hidden sm:block">
            Use <kbd className="rounded bg-surface-overlay px-1.5 py-0.5 text-white">A</kbd>/
            <kbd className="rounded bg-surface-overlay px-1.5 py-0.5 text-white">D</kbd> or arrows
            to run, <kbd className="rounded bg-surface-overlay px-1.5 py-0.5 text-white">Space</kbd>{' '}
            to jump
          </div>

          <button
            onPointerDown={() => setInput((p) => ({ ...p, jump: true }))}
            onPointerUp={() => setInput((p) => ({ ...p, jump: false }))}
            onPointerLeave={() => setInput((p) => ({ ...p, jump: false }))}
            className="flex h-12 px-6 items-center justify-center rounded-xl bg-amber-500 font-bold uppercase tracking-wider text-slate-950 active:bg-amber-400"
            aria-label="Jump"
          >
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
}
