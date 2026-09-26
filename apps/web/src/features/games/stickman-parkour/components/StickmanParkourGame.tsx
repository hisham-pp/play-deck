'use client';

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FastForward,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import {
  createInitialParkourState,
  jumpPlayer,
  slidePlayer,
  STANDING_HEIGHT,
  startParkourGame,
  stepParkourEngine,
  StickmanParkourState,
} from '../engine/stickman-parkour-engine';

class ParkourAudioSynth {
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
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playWallKick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  playSlide() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.2);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playBoost() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t);
    osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playStumble() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(40, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }
}

const parkourAudio = new ParkourAudioSynth();

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export function StickmanParkourGame() {
  const { recordGamePlayed } = usePlayerStore();
  const savedHighScore = usePlayerStore((s) => s.stats.bestScores?.['stickman-parkour'] ?? 0);

  const [state, setState] = useState<StickmanParkourState>(() =>
    createInitialParkourState(savedHighScore),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync mute setting
  useEffect(() => {
    parkourAudio.enabled = !isMuted;
  }, [isMuted]);

  // Actions
  const handleStart = useCallback(() => {
    setState((prev) => startParkourGame(prev));
    setIsPaused(false);
  }, []);

  const handleJump = useCallback(() => {
    setState((prev) => {
      const next = jumpPlayer(prev);
      if (next.player.state === 'wall_kick') {
        parkourAudio.playWallKick();
      } else if (next.player.state === 'jumping') {
        parkourAudio.playJump();
      }
      return next;
    });
  }, []);

  const handleSlide = useCallback(() => {
    setState((prev) => {
      const next = slidePlayer(prev);
      if (next.player.state === 'sliding' && prev.player.state !== 'sliding') {
        parkourAudio.playSlide();
      }
      return next;
    });
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleSlide();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, handleSlide]);

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
          if (prev.status === 'game_over') return prev;

          const updated = stepParkourEngine(prev, deltaSec);

          // Audio triggers
          if (updated.stats.boostersHit > prev.stats.boostersHit) {
            parkourAudio.playBoost();
          } else if (updated.player.stumbleTimer > 0 && prev.player.stumbleTimer <= 0) {
            parkourAudio.playStumble();
          }

          // Persistence on Game Over
          if (updated.status === 'game_over' && prev.status === 'playing') {
            recordGamePlayed(updated.score > 0, 'arcade', 'stickman-parkour', updated.score);
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

    const { player, cameraX, platforms } = state;

    // 1. Sky Gradient & Cityscape Parallax
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#0B132B');
    skyGrad.addColorStop(0.65, '#090D16');
    skyGrad.addColorStop(1, '#050811');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Far Skyline (Slow parallax 0.1x)
    ctx.fillStyle = '#0f182c';
    for (let i = 0; i < 15; i++) {
      const bX = i * 140 - ((cameraX * 0.1) % 1400) - 200;
      ctx.fillRect(bX, 220 + (i % 4) * 30, 90, 320);
    }

    // Midground Skyline (0.3x)
    ctx.fillStyle = '#141d33';
    for (let i = 0; i < 12; i++) {
      const bX = i * 180 - ((cameraX * 0.3) % 2160) - 200;
      ctx.fillRect(bX, 160 + (i % 3) * 45, 120, 380);

      // Neon roof top antenna light
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(bX + 58, 140 + (i % 3) * 45, 4, 20);
      ctx.fillStyle = '#141d33';
    }

    // 2. Rooftop Platforms & Obstacles
    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const plat of platforms) {
      // Rooftop Building Base
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3;
      ctx.fillRect(plat.x, plat.y, plat.width, CANVAS_HEIGHT - plat.y + 100);
      ctx.strokeRect(plat.x, plat.y, plat.width, CANVAS_HEIGHT - plat.y + 100);

      // Rooftop Top Trim (Neon border)
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(plat.x, plat.y, plat.width, 6);

      // Obstacles on platform
      for (const obs of plat.obstacles) {
        if (obs.type === 'pipe') {
          // Low steel pipe (Slide under)
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 2;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Support legs
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x + 2, obs.y + obs.height, 6, plat.y - (obs.y + obs.height));
          ctx.fillRect(obs.x + obs.width - 8, obs.y + obs.height, 6, plat.y - (obs.y + obs.height));
        } else if (obs.type === 'vent') {
          // Rooftop air vent (Jump over)
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 2;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Vent grill lines
          ctx.fillStyle = '#06B6D4';
          ctx.fillRect(obs.x + 4, obs.y + 8, obs.width - 8, 3);
          ctx.fillRect(obs.x + 4, obs.y + 16, obs.width - 8, 3);
        } else if (obs.type === 'wall') {
          // Vertical Wall facade (Wall Jump)
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 3;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Wall kick glyph
          ctx.fillStyle = '#A855F7';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('VAULT', obs.x - 6, obs.y - 6);
        } else if (obs.type === 'booster') {
          // Turbo Boost Pad on ground
          ctx.fillStyle = '#F59E0B';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          // Glowing arrow
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(obs.x + 10, obs.y + 4);
          ctx.lineTo(obs.x + 25, obs.y + 4);
          ctx.stroke();
        }
      }
    }

    // 3. Render Runner Stickman
    ctx.strokeStyle = player.invincibleTimer > 0 ? '#F59E0B' : '#F8FAFC';
    ctx.fillStyle = player.invincibleTimer > 0 ? '#F59E0B' : '#F8FAFC';
    ctx.lineWidth = 4.5;

    const pX = player.x + player.width / 2;
    const pY = player.y;

    if (player.state === 'sliding') {
      // Sliding Tucked Posture
      ctx.beginPath();
      ctx.arc(pX + 10, pY + 8, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pX + 4, pY + 12);
      ctx.lineTo(pX - 16, pY + 20);
      ctx.stroke();

      // Extended slide legs
      ctx.beginPath();
      ctx.moveTo(pX - 16, pY + 20);
      ctx.lineTo(pX + 16, pY + 24);
      ctx.stroke();

      // Slide sparks
      ctx.fillStyle = '#06B6D4';
      ctx.beginPath();
      ctx.arc(pX - 8, pY + 24, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Upright or Airborne Posture
      const headRadius = 11;
      const headCenterY = pY + headRadius;

      // Head
      ctx.beginPath();
      ctx.arc(pX, headCenterY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(pX, headCenterY + headRadius);
      ctx.lineTo(pX, pY + 34);
      ctx.stroke();

      if (player.state === 'jumping' || player.state === 'wall_kick') {
        // Leaping Arms & Tucked Legs
        ctx.beginPath();
        ctx.moveTo(pX, headCenterY + headRadius + 4);
        ctx.lineTo(pX + 14, pY + 22);
        ctx.lineTo(pX + 22, pY + 16);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX, pY + 34);
        ctx.lineTo(pX + 12, pY + 44);
        ctx.lineTo(pX + 20, pY + 38);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX, pY + 34);
        ctx.lineTo(pX - 8, pY + 46);
        ctx.lineTo(pX - 16, pY + 40);
        ctx.stroke();
      } else {
        // Sprinting Stride animation based on distance
        const animCycle = (state.distanceMeters * 0.4) % (Math.PI * 2);
        const legSwing = Math.sin(animCycle) * 14;

        // Arms
        ctx.beginPath();
        ctx.moveTo(pX, headCenterY + headRadius + 4);
        ctx.lineTo(pX - legSwing, pY + 28);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX, headCenterY + headRadius + 4);
        ctx.lineTo(pX + legSwing, pY + 28);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(pX, pY + 34);
        ctx.lineTo(pX + legSwing, pY + STANDING_HEIGHT);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pX, pY + 34);
        ctx.lineTo(pX - legSwing, pY + STANDING_HEIGHT);
        ctx.stroke();
      }
    }

    // 4. Floating Score / Bonus Texts
    for (const b of state.floatingBonuses) {
      ctx.fillStyle = b.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(b.text, b.x, b.y);
    }

    ctx.restore();
  }, [state]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/games/stickman-parkour"
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-base px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Overview
          </Link>
          <span className="text-sm font-bold tracking-wider text-cyan-400">STICKMAN PARKOUR</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Distance */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">DISTANCE:</span>
            <span className="font-bold text-cyan-400 text-sm">{state.distanceMeters}m</span>
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
              <Volume2 className="h-4 w-4 text-cyan-400" />
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

      {/* Main Canvas Stage */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-surface-border bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-full w-full object-contain"
        />

        {/* Tactical Momentum HUD (Top) */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Momentum Multiplier Gauge */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <Flame className="h-4 w-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">MOMENTUM GAUGE</span>
              <div className="h-2 w-32 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-200"
                  style={{ width: `${state.momentumGauge}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">{state.momentum}x</span>
          </div>

          {/* Current Run Score */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-base font-black text-slate-100">{state.score} PTS</span>
          </div>
        </div>

        {/* Start Game Modal */}
        {state.status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
            <h2 className="text-3xl font-black text-cyan-400 tracking-wider">STICKMAN PARKOUR</h2>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              High-speed rooftop freerunning across a neon skyline. Leap chasms, kick off walls, and
              slide under ventilation pipes!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⬆️ Space / W: Jump &amp; Wall Vault
              </span>
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⬇️ S / Down: Slide &amp; Roll
              </span>
            </div>
            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95"
            >
              <Play className="h-5 w-5 fill-slate-950" />
              START SPEEDRUN
            </button>
          </div>
        )}

        {/* Game Over Summary Modal */}
        {state.status === 'game_over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <Sparkles className="h-12 w-12 text-cyan-400 animate-bounce" />
            <h2 className="mt-2 text-3xl font-black text-slate-100 tracking-wider">
              RUN TERMINATED
            </h2>
            <p className="text-sm text-slate-300">
              Fell from the skyline after {state.distanceMeters} meters.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-xs text-left text-xs">
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">DISTANCE</span>
                <p className="text-lg font-bold text-cyan-400">{state.distanceMeters}m</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">FINAL SCORE</span>
                <p className="text-lg font-bold text-amber-400">{state.score}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">WALL VAULTS</span>
                <p className="text-lg font-bold text-purple-400">{state.stats.wallJumps}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">SLIDES</span>
                <p className="text-lg font-bold text-emerald-400">{state.stats.slides}</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-cyan-400 transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              RUN AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Tactile Bottom Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-3">
          {/* Jump Button */}
          <button
            onClick={handleJump}
            disabled={state.status !== 'playing'}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 text-sm font-bold shadow-md transition active:scale-95"
          >
            <ChevronUp className="h-5 w-5" />
            JUMP / WALL VAULT (SPACE)
          </button>

          {/* Slide Button */}
          <button
            onClick={handleSlide}
            disabled={state.status !== 'playing'}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-surface-border text-white px-5 py-3 text-sm font-bold shadow-md transition active:scale-95"
          >
            <ChevronDown className="h-5 w-5" />
            SLIDE (S)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FastForward className="h-4 w-4 text-cyan-400" />
          <span>Speed auto-accelerates with momentum</span>
        </div>
      </div>
    </div>
  );
}
