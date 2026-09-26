'use client';

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FastForward,
  Flag,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import {
  createInitialRacingState,
  jumpHurdle,
  setBoost,
  shiftLane,
  startRacingGame,
  stepRacingEngine,
  StickmanRacingState,
} from '../engine/stickman-racing-engine';

class RacingAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.14);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  playBoost() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(750, t + 0.2);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playStumble() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playFinish() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + 0.6);
    });
  }
}

const racingAudio = new RacingAudioSynth();

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export function StickmanRacingGame() {
  const { recordGamePlayed } = usePlayerStore();
  const savedHighScore = usePlayerStore((s) => s.stats.bestScores?.['stickman-racing'] ?? 0);

  const [state, setState] = useState<StickmanRacingState>(() =>
    createInitialRacingState(savedHighScore),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync mute
  useEffect(() => {
    racingAudio.enabled = !isMuted;
  }, [isMuted]);

  // Actions
  const handleStart = useCallback(() => {
    setState((prev) => startRacingGame(prev));
    setIsPaused(false);
  }, []);

  const handleShiftLane = useCallback((dir: -1 | 1) => {
    setState((prev) => shiftLane(prev, dir));
  }, []);

  const handleJump = useCallback(() => {
    setState((prev) => {
      const next = jumpHurdle(prev);
      if (next.player.isJumping && !prev.player.isJumping) {
        racingAudio.playJump();
      }
      return next;
    });
  }, []);

  const handleBoostToggle = useCallback((active: boolean) => {
    setState((prev) => {
      const next = setBoost(prev, active);
      if (next.player.isBoosting && !prev.player.isBoosting) {
        racingAudio.playBoost();
      }
      return next;
    });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleShiftLane(-1);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleShiftLane(1);
      } else if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleBoostToggle(true);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        handleBoostToggle(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleShiftLane, handleJump, handleBoostToggle]);

  // Main Loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (!isPaused) {
        setState((prev) => {
          if (prev.status === 'finished') return prev;

          const updated = stepRacingEngine(prev, deltaSec);

          if (updated.stats.stumbles > prev.stats.stumbles) {
            racingAudio.playStumble();
          }

          if (updated.status === 'finished' && prev.status === 'racing') {
            racingAudio.playFinish();
            recordGamePlayed(updated.score > 0, 'arcade', 'stickman-racing', updated.score);
          }

          return updated;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, recordGamePlayed]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { player, rivals, hurdles, raceDistance } = state;

    // 1. Stadium Night Arena Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#090D16');
    bgGrad.addColorStop(0.4, '#111827');
    bgGrad.addColorStop(1, '#060911');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stadium Light Beams
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(350, CANVAS_HEIGHT);
    ctx.lineTo(250, CANVAS_HEIGHT);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.beginPath();
    ctx.moveTo(810, 0);
    ctx.lineTo(610, CANVAS_HEIGHT);
    ctx.lineTo(710, CANVAS_HEIGHT);
    ctx.fill();

    // 2. 3-Lane Track Surface
    const trackLeft = 180;
    const trackWidth = 600;
    const laneWidth = trackWidth / 3;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(trackLeft, 0, trackWidth, CANVAS_HEIGHT);

    // Track Outer Curb Stripes (Red & White)
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      const isRed = Math.floor((y + state.player.distanceMeters * 8) / 40) % 2 === 0;
      ctx.fillStyle = isRed ? '#EF4444' : '#F8FAFC';
      ctx.fillRect(trackLeft - 14, y, 14, 40);
      ctx.fillRect(trackLeft + trackWidth, y, 14, 40);
    }

    // Lane Divider Dashed Lines
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.setLineDash([25, 20]);
    ctx.lineDashOffset = -(state.player.distanceMeters * 15);

    // Divider between lane 0 and 1
    ctx.beginPath();
    ctx.moveTo(trackLeft + laneWidth, 0);
    ctx.lineTo(trackLeft + laneWidth, CANVAS_HEIGHT);
    ctx.stroke();

    // Divider between lane 1 and 2
    ctx.beginPath();
    ctx.moveTo(trackLeft + laneWidth * 2, 0);
    ctx.lineTo(trackLeft + laneWidth * 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Render Hurdles
    // Player is drawn at screen Y = 380.
    // Hurdles ahead/behind are placed relative to player distance:
    // hurdleScreenY = 380 - (hurdle.distanceMeters - player.distanceMeters) * 12
    for (const hurdle of hurdles) {
      const relDist = hurdle.distanceMeters - player.distanceMeters;
      const screenY = 380 - relDist * 12;

      if (screenY >= -50 && screenY <= CANVAS_HEIGHT + 50) {
        const laneCenterX = trackLeft + hurdle.lane * laneWidth + laneWidth / 2;

        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#F87171';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(laneCenterX - 45, screenY - 8, 90, 16, 4);
        ctx.fill();
        ctx.stroke();

        // Stanchion posts
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(laneCenterX - 40, screenY + 8, 5, 12);
        ctx.fillRect(laneCenterX + 35, screenY + 8, 5, 12);
      }
    }

    // 4. Render Finish Line
    const finishRelDist = raceDistance - player.distanceMeters;
    const finishScreenY = 380 - finishRelDist * 12;
    if (finishScreenY >= -100 && finishScreenY <= CANVAS_HEIGHT + 100) {
      // Checkered bar
      const checkSize = 20;
      for (let x = trackLeft; x < trackLeft + trackWidth; x += checkSize) {
        const isWhite = Math.floor(x / checkSize) % 2 === 0;
        ctx.fillStyle = isWhite ? '#F8FAFC' : '#0F172A';
        ctx.fillRect(x, finishScreenY - 12, checkSize, 24);
      }
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🏁 FINISH LINE 🏁', trackLeft + trackWidth / 2 - 75, finishScreenY - 20);
    }

    // 5. Render Rivals
    for (const rival of rivals) {
      const relDist = rival.distanceMeters - player.distanceMeters;
      const rivalScreenY = 380 - relDist * 12 - rival.jumpY * 18;

      if (rivalScreenY >= -60 && rivalScreenY <= CANVAS_HEIGHT + 60) {
        const rivalX = trackLeft + rival.lane * laneWidth + laneWidth / 2;

        // Stickman figure
        ctx.fillStyle = rival.color;
        ctx.strokeStyle = rival.color;
        ctx.lineWidth = 4;

        // Head
        ctx.beginPath();
        ctx.arc(rivalX, rivalScreenY - 32, 11, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.beginPath();
        ctx.moveTo(rivalX, rivalScreenY - 21);
        ctx.lineTo(rivalX, rivalScreenY);
        ctx.stroke();

        // Stride legs
        const rCycle = (rival.distanceMeters * 0.5) % (Math.PI * 2);
        const rSwing = Math.sin(rCycle) * 12;
        ctx.beginPath();
        ctx.moveTo(rivalX, rivalScreenY);
        ctx.lineTo(rivalX - 8, rivalScreenY + 18 + rSwing);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rivalX, rivalScreenY);
        ctx.lineTo(rivalX + 8, rivalScreenY + 18 - rSwing);
        ctx.stroke();

        // Name tag
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px sans-serif';
        ctx.fillText(rival.name, rivalX - 25, rivalScreenY - 48);
      }
    }

    // 6. Render Player Stickman
    // Interpolate lane X
    const currentLaneX = trackLeft + player.lane * laneWidth + laneWidth / 2;
    const targetLaneX = trackLeft + player.targetLane * laneWidth + laneWidth / 2;
    const pX = currentLaneX + (targetLaneX - currentLaneX) * player.laneProgress;
    const pY = 380 - player.jumpY * 26;

    // Nitro Jet Flame
    if (player.isBoosting) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(pX - 10, pY + 18);
      ctx.lineTo(pX, pY + 45);
      ctx.lineTo(pX + 10, pY + 18);
      ctx.fill();
    }

    // Drafting Halo
    if (player.isDrafting) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pX, pY - 10, 32, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = player.stumbleTimer > 0 ? '#EF4444' : '#06B6D4';
    ctx.fillStyle = player.stumbleTimer > 0 ? '#EF4444' : '#06B6D4';
    ctx.lineWidth = 5;

    // Head
    ctx.beginPath();
    ctx.arc(pX, pY - 32, 12, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.beginPath();
    ctx.moveTo(pX, pY - 20);
    ctx.lineTo(pX, pY + 4);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(pX, pY - 14);
    ctx.lineTo(pX - 14, pY - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pX, pY - 14);
    ctx.lineTo(pX + 14, pY - 4);
    ctx.stroke();

    // Legs
    if (player.isJumping) {
      // Hurdle Leap Form
      ctx.beginPath();
      ctx.moveTo(pX, pY + 4);
      ctx.lineTo(pX + 16, pY + 10);
      ctx.lineTo(pX + 24, pY + 16);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pX, pY + 4);
      ctx.lineTo(pX - 12, pY + 18);
      ctx.stroke();
    } else {
      // Sprinting Leg cycle
      const pCycle = (player.distanceMeters * 0.5) % (Math.PI * 2);
      const pSwing = Math.sin(pCycle) * 14;

      ctx.beginPath();
      ctx.moveTo(pX, pY + 4);
      ctx.lineTo(pX - 10, pY + 24 + pSwing);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pX, pY + 4);
      ctx.lineTo(pX + 10, pY + 24 - pSwing);
      ctx.stroke();
    }
  }, [state]);

  const speedKmh = Math.round(state.player.speed * 3.6);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/games/stickman-racing"
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-base px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Overview
          </Link>
          <span className="text-sm font-bold tracking-wider text-amber-400">STICKMAN RACING</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Distance */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">DISTANCE:</span>
            <span className="font-bold text-amber-400 text-sm">
              {Math.round(state.player.distanceMeters)}m / {state.raceDistance}m
            </span>
          </div>

          {/* High Score */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-slate-200">{state.highScore}</span>
          </div>

          {/* Audio & Pause Buttons */}
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="rounded-lg border border-surface-border bg-surface-base p-1.5 text-slate-400 hover:text-white transition"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4 text-amber-400" />
            )}
          </button>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="rounded-lg border border-surface-border bg-surface-base p-1.5 text-slate-400 hover:text-white transition"
            aria-label="Pause"
          >
            {isPaused ? (
              <Play className="h-4 w-4 text-emerald-400" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Track */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-surface-border bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-full w-full object-contain"
        />

        {/* Live Race HUD Overlay (Top) */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Current Rank Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <Flag className="h-4 w-4 text-amber-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">POSITION</span>
              <span className="text-sm font-black text-amber-400">
                {state.player.rank === 1
                  ? '1ST PLACE'
                  : state.player.rank === 2
                    ? '2ND PLACE'
                    : '3RD PLACE'}
              </span>
            </div>
          </div>

          {/* Speedometer */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-4 py-2 border border-surface-border">
            <Zap
              className={`h-4 w-4 ${state.player.isBoosting ? 'text-amber-400 animate-bounce' : 'text-sky-400'}`}
            />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-semibold text-slate-400">SPEED</span>
              <span className="text-base font-black text-slate-100">{speedKmh} KM/H</span>
            </div>
          </div>

          {/* Nitro Tank Gauge */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <Flame
              className={`h-4 w-4 ${state.player.nitroGauge > 25 ? 'text-amber-400' : 'text-slate-500'}`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">NITRO TANK</span>
              <div className="h-2 w-28 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-200"
                  style={{ width: `${state.player.nitroGauge}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">
              {Math.round(state.player.nitroGauge)}%
            </span>
          </div>
        </div>

        {/* Start Game Modal */}
        {state.status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
            <h2 className="text-3xl font-black text-amber-400 tracking-wider">STICKMAN RACING</h2>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              Shift between 3 lanes, leap high hurdles, and draft rival runners to charge supersonic
              nitro boosts!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⬅️ ➡️ A / D: Shift Lanes
              </span>
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⬆️ Space: Hurdle Jump
              </span>
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⚡ Shift: Nitro Boost
              </span>
            </div>
            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition active:scale-95"
            >
              <Play className="h-5 w-5 fill-slate-950" />
              START SPRINT
            </button>
          </div>
        )}

        {/* Race Concluded Modal */}
        {state.status === 'finished' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <Trophy
              className={`h-12 w-12 ${state.player.rank === 1 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`}
            />
            <h2 className="mt-2 text-3xl font-black text-slate-100 tracking-wider">
              {state.player.rank === 1 ? 'VICTORY! 1ST PLACE' : `${state.player.rank}ND PLACE`}
            </h2>
            <p className="text-sm text-slate-300">
              Finished {state.raceDistance}m in {state.player.finishTime} seconds.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-xs text-left text-xs">
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">FINISH TIME</span>
                <p className="text-lg font-bold text-amber-400">{state.player.finishTime}s</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">FINAL SCORE</span>
                <p className="text-lg font-bold text-emerald-400">{state.score}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">HURDLES CLEARED</span>
                <p className="text-lg font-bold text-sky-400">{state.stats.hurdlesCleared}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">DRAFT TIME</span>
                <p className="text-lg font-bold text-purple-400">
                  {state.stats.draftSeconds.toFixed(1)}s
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-amber-400 transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              RACE AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Tactile Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-2">
          {/* Lane Left */}
          <button
            onClick={() => handleShiftLane(-1)}
            disabled={state.status !== 'racing'}
            className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-surface-border px-4 py-3 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            LANE LEFT (A)
          </button>

          {/* Lane Right */}
          <button
            onClick={() => handleShiftLane(1)}
            disabled={state.status !== 'racing'}
            className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-surface-border px-4 py-3 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            LANE RIGHT (D)
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Jump */}
          <button
            onClick={handleJump}
            disabled={state.status !== 'racing'}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 text-xs font-bold shadow-md transition active:scale-95"
          >
            <ChevronUp className="h-4 w-4" />
            JUMP (SPACE)
          </button>

          {/* Turbo Boost */}
          <button
            onMouseDown={() => handleBoostToggle(true)}
            onMouseUp={() => handleBoostToggle(false)}
            onTouchStart={() => handleBoostToggle(true)}
            onTouchEnd={() => handleBoostToggle(false)}
            disabled={state.status !== 'racing' || state.player.nitroGauge < 5}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-5 py-3 text-xs font-bold shadow-md transition active:scale-95"
          >
            <FastForward className="h-4 w-4" />
            HOLD TURBO (SHIFT)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Draft rivals to charge nitro!</span>
        </div>
      </div>
    </div>
  );
}
