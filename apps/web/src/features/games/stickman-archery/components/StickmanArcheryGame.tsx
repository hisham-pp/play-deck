'use client';

import { ArrowLeft, ArrowRight, Play, RotateCcw, Target, Trophy, Wind } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceToNextRound,
  ARCHERY_ROUNDS,
  calculateTrajectoryPreview,
  createInitialArcheryState,
  releaseBow,
  resetForNextShot,
  startAiming,
  stepArcheryGame,
  StickmanArcheryState,
  updateAiming,
} from '../engine/stickman-archery-engine';

const STAGE_HEIGHT = 440;
const STAGE_WIDTH = 960;

export function StickmanArcheryGame() {
  const [state, setState] = useState<StickmanArcheryState>(() => createInitialArcheryState(0, 0));
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const handleNextRound = useCallback(() => {
    setState((prev) => advanceToNextRound(prev));
  }, []);

  const handleRestart = useCallback(() => {
    setState((prev) => createInitialArcheryState(prev.highScore, 0));
  }, []);

  const handleNextShot = useCallback(() => {
    setState((prev) => resetForNextShot(prev));
  }, []);

  // Pointer drag for aiming
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.status !== 'aiming') return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setState((prev) => startAiming(prev, x, y));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.dragStart) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setState((prev) => updateAiming(prev, x, y));
  };

  const handlePointerUp = () => {
    if (state.dragStart) {
      setState((prev) => releaseBow(prev));
    }
  };

  // Main animation tick
  useEffect(() => {
    const tick = (time: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = time;
      }
      const dt = Math.min(0.032, (time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;

      setState((prev) => stepArcheryGame(prev, dt));
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Trajectory dots preview
  const trajectoryDots = useMemo(() => {
    if (state.status !== 'aiming' || !state.dragStart || !state.currentDrag) return [];
    return calculateTrajectoryPreview(state.bow, state.dragStart, state.currentDrag, state.wind);
  }, [state.status, state.bow, state.dragStart, state.currentDrag, state.wind]);

  const windFormatted = useMemo(() => {
    if (state.wind === 0) return 'Calm (0.0)';
    const dir = state.wind > 0 ? '→' : '←';
    return `${dir} ${Math.abs(state.wind).toFixed(1)} m/s`;
  }, [state.wind]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-deck-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Catalog</span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em]">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Wind className="h-4 w-4" />
            <span>Wind {windFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300">
            <Trophy className="h-4 w-4" />
            <span>High {state.highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Arcade Frame */}
      <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
        {/* HUD Bar */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">
                Round {state.roundIndex + 1}/{ARCHERY_ROUNDS.length}
              </div>
              <div className="text-sm font-bold text-white">
                {ARCHERY_ROUNDS[state.roundIndex].name}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Score</div>
              <div className="text-xl font-black text-amber-400">{state.score}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-deck-500">Arrows</div>
              <div className="flex items-center gap-1 text-base font-bold text-emerald-400">
                <span>{state.arrowsLeft}</span>
                <span className="text-xs text-deck-400">/{state.maxArrows}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(state.status === 'hit' || state.status === 'miss') && state.arrowsLeft > 0 && (
              <button
                onClick={handleNextShot}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-amber-400"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Next Shot</span>
              </button>
            )}
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:border-amber-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Archery Shooting Stage */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#09111d] touch-none select-none cursor-crosshair"
          style={{ height: `${STAGE_HEIGHT}px`, width: '100%', maxWidth: `${STAGE_WIDTH}px` }}
        >
          {/* Background atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.1),_transparent_35%),linear-gradient(180deg,_rgba(17,24,39,0.7),_rgba(2,6,23,0.95))]" />

          {/* Ground level */}
          <div className="absolute inset-x-0 bottom-0 h-16 border-t border-surface-border bg-gradient-to-t from-emerald-950 to-slate-900" />

          {/* Archer Stickman figure */}
          <div
            className="absolute"
            style={{ left: `${state.bow.x - 30}px`, top: `${state.bow.y - 48}px` }}
          >
            <div className="relative h-16 w-12">
              <div className="absolute left-3 top-0 h-4 w-4 rounded-full border-2 border-slate-100 bg-slate-900" />
              <div className="absolute left-5 top-4 h-7 w-1 bg-slate-100" />
              <div className="absolute left-1 top-6 h-5 w-1 rotate-45 bg-slate-100" />
              <div className="absolute left-6 top-6 h-5 w-1 -rotate-45 bg-amber-400" />
              <div className="absolute left-4 top-11 h-6 w-1 rotate-[15deg] bg-slate-100" />
              <div className="absolute left-6 top-11 h-6 w-1 -rotate-[15deg] bg-slate-100" />
              {/* Bow arc */}
              <div className="absolute left-8 top-3 h-10 w-3 rounded-r-full border-r-2 border-amber-500" />
            </div>
          </div>

          {/* Trajectory Guide Dots */}
          {trajectoryDots.map((pt, i) => (
            <div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-amber-400/80 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
              style={{ left: `${pt.x}px`, top: `${pt.y}px` }}
            />
          ))}

          {/* Archery Targets */}
          {state.targets.map((tgt) => (
            <div
              key={tgt.id}
              className="absolute flex flex-col items-center"
              style={{
                left: `${tgt.x - tgt.width / 2}px`,
                top: `${tgt.y}px`,
                width: `${tgt.width}px`,
                height: `${tgt.height}px`,
              }}
            >
              {/* Target Board */}
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md border border-slate-700 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <div
                  className="absolute inset-y-0 w-full bg-blue-600/70"
                  style={{ top: `${(tgt.height - tgt.outerRadius * 2) / 2}px` }}
                />
                <div
                  className="absolute inset-y-0 w-full bg-yellow-400"
                  style={{ top: `${(tgt.height - tgt.innerRadius * 2) / 2}px` }}
                />
                <div
                  className="absolute inset-y-0 w-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  style={{ top: `${(tgt.height - tgt.bullseyeRadius * 2) / 2}px` }}
                />
              </div>
              {/* Target Post */}
              <div className="h-10 w-2 bg-slate-600" />
            </div>
          ))}

          {/* Flying / Stuck Arrow */}
          {(state.status === 'flying' ||
            state.arrow.isStuck ||
            (state.dragStart && state.currentDrag)) && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${state.arrow.x}px`,
                top: `${state.arrow.y}px`,
                transformOrigin: 'left center',
                transform: `rotate(${state.arrow.angle}rad)`,
              }}
            >
              <div className="relative flex items-center">
                <div className="h-0.5 w-10 bg-amber-200" />
                <div className="h-0 w-0 border-y-[3px] border-y-transparent border-l-[8px] border-l-red-500" />
              </div>
            </div>
          )}

          {/* Score Hit Notification Banner */}
          {state.lastHitText && (
            <div className="absolute left-1/2 top-10 -translate-x-1/2 rounded-full border border-amber-500/60 bg-slate-900/90 px-5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              {state.lastHitText}
            </div>
          )}

          {/* Overlays */}
          {state.status === 'round-cleared' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
              <div className="rounded-2xl border border-emerald-500/50 bg-slate-900/90 p-6 text-center shadow-[0_0_35px_rgba(16,185,129,0.25)]">
                <div className="text-xs uppercase tracking-[0.25em] text-emerald-400">
                  Target Cleared!
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">Round Completed</h3>
                <p className="mt-1 text-sm text-deck-300">Total Score: {state.score}</p>
                <button
                  onClick={handleNextRound}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 transition hover:bg-emerald-400"
                >
                  <span>Next Round</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {state.status === 'game-over' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
              <div className="rounded-2xl border border-rose-500/50 bg-slate-900/90 p-6 text-center shadow-[0_0_35px_rgba(244,63,94,0.25)]">
                <div className="text-xs uppercase tracking-[0.25em] text-rose-400">
                  Out of Arrows
                </div>
                <h3 className="mt-2 text-2xl font-black text-white">Challenge Ended</h3>
                <p className="mt-1 text-sm text-deck-300">Final Score: {state.score}</p>
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
                <div className="text-xs uppercase tracking-[0.25em] text-amber-300">
                  Master Archer!
                </div>
                <h3 className="mt-2 text-3xl font-black text-white">All Rounds Conquered</h3>
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

        {/* Interaction Guide */}
        <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2 text-xs text-deck-400">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            <span>
              Click/touch and drag away from the bow to aim and adjust power, then release to shoot.
            </span>
          </div>
          <div>Bullseye: 50 pts • Inner: 25 pts • Outer: 10 pts</div>
        </div>
      </div>
    </div>
  );
}
