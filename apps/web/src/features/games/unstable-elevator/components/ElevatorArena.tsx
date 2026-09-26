'use client';

import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RotateCcw,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { usePreferencesStore } from '@/stores/preferences.store';
import { PHASE_COLLAPSE, PHASE_PLACING } from '../engine/elevator-constants';
import { SEAT_HEX } from '../render/elevator-palette';
import type { ElevatorGameState } from '../types/unstable-elevator.types';

interface ElevatorArenaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  state: ElevatorGameState;
  localPlayerId: string | null;
  isMyTurn: boolean;
  canDrop: boolean;
  onNudge: (dir: -1 | 1, fine?: boolean) => void;
  onTurn: (dir: -1 | 1) => void;
  onDrop: () => void;
  onRestart: () => void;
  onLeave: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
}

export function ElevatorArena({
  canvasRef,
  state,
  localPlayerId: _localPlayerId,
  isMyTurn,
  canDrop,
  onNudge,
  onTurn,
  onDrop,
  onRestart,
  onLeave,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ElevatorArenaProps) {
  const activeSeat = state.seats.find((s) => s.id === state.activeSeatId);
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const toggleSound = usePreferencesStore((s) => s.toggleSound);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4 py-2">
      {/* Top HUD Card */}
      <Card className="w-full border-amber-500/20 bg-slate-900/90 backdrop-blur">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Floor
              </span>
              <p className="font-mono text-2xl font-black text-amber-400">{state.floor}</p>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Slips Left
              </span>
              <p className="font-mono text-xl font-bold text-slate-200">{state.slipsRemaining}</p>
            </div>

            <div className="h-8 w-px bg-slate-800" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Phase
              </span>
              <p className="text-xs font-bold capitalize text-slate-300">{state.phase}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeSeat && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full border text-xs"
                  style={{ borderColor: SEAT_HEX[activeSeat.color] }}
                >
                  {activeSeat.avatar}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{activeSeat.displayName}</span>
                  <span className="text-[10px] text-amber-400">
                    {isMyTurn ? 'Your Turn (Claw)' : 'Operating Claw'}
                  </span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => void toggleSound()}
              className="gap-1 text-xs text-slate-400 hover:text-white"
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              aria-label={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            >
              {soundEnabled ? (
                <Volume2 className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-slate-500" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="gap-1.5 text-xs text-slate-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Leave</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Canvas */}
      <div className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="h-full w-full touch-none cursor-crosshair"
        />

        {/* Finished / Game Over Overlay */}
        {state.finished && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center backdrop-blur-sm">
            <Trophy className="h-12 w-12 text-amber-400" />
            <h2 className="mt-2 font-display text-2xl font-black text-white">
              {state.phase === PHASE_COLLAPSE ? 'Lift Collapsed!' : 'Run Completed!'}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              The crew ascended {Math.max(0, state.floor - 1)} floors before giving out.
            </p>

            <div className="my-4 flex flex-col gap-1 text-xs text-slate-400">
              {state.scores.map((score) => {
                const s = state.seats.find((entry) => entry.id === score.seatId);
                return (
                  <div
                    key={score.seatId}
                    className="flex items-center justify-between gap-6 rounded bg-slate-900 px-3 py-1 font-mono"
                  >
                    <span>{s?.displayName || score.seatId}</span>
                    <span className="font-bold text-amber-400">{score.points} pts</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={onRestart} className="gap-1.5 font-bold">
                <RotateCcw className="h-4 w-4" /> Play Again
              </Button>
              <Button variant="outline" onClick={onLeave}>
                Leave Arena
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tactile Control Bar */}
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!isMyTurn || state.phase !== PHASE_PLACING}
            onClick={() => onNudge(-1)}
            aria-label="Nudge Left"
          >
            <ChevronLeft className="h-4 w-4" /> Left
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isMyTurn || state.phase !== PHASE_PLACING}
            onClick={() => onNudge(1)}
            aria-label="Nudge Right"
          >
            Right <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isMyTurn || state.phase !== PHASE_PLACING}
            onClick={() => onTurn(-1)}
            aria-label="Rotate Left"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isMyTurn || state.phase !== PHASE_PLACING}
            onClick={() => onTurn(1)}
            aria-label="Rotate Right"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          disabled={!isMyTurn || !canDrop || state.phase !== PHASE_PLACING}
          onClick={onDrop}
          className="gap-2 bg-amber-500 font-bold text-slate-950 hover:bg-amber-600 disabled:opacity-50"
        >
          <ArrowDown className="h-4 w-4" />
          <span>Release Cargo</span>
        </Button>
      </div>
    </div>
  );
}
