'use client';

import {
  ArrowLeft,
  Crosshair,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/stores/player.store';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  createInitialShooterState,
  Enemy,
  firePlayerWeapon,
  startReload,
  startShooterGame,
  stepShooterEngine,
  StickmanShooterState,
  togglePlayerPosture,
} from '../engine/stickman-shooter-engine';

class TacticalAudioSynth {
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

  playShot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  playHeadshot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  playEmpty() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  playReload() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(650, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playBlock() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }
}

const audioSynth = new TacticalAudioSynth();

export function StickmanShooterGame() {
  const { recordGamePlayed } = usePlayerStore();
  const savedHighScore = usePlayerStore((s) => s.stats.bestScores?.['stickman-shooter'] ?? 0);

  const [state, setState] = useState<StickmanShooterState>(() =>
    createInitialShooterState(savedHighScore),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aimPos, setAimPos] = useState({ x: 500, y: 300 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sync mute
  useEffect(() => {
    audioSynth.enabled = !isMuted;
  }, [isMuted]);

  // Handle Game Start
  const handleStart = useCallback(() => {
    setState((prev) => startShooterGame(prev));
    setIsPaused(false);
  }, []);

  // Handle Posture Toggle
  const handleToggleCover = useCallback(() => {
    setState((prev) => togglePlayerPosture(prev));
    audioSynth.playReload();
  }, []);

  // Handle Reload
  const handleReload = useCallback(() => {
    setState((prev) => {
      const next = startReload(prev);
      if (next.player.isReloading && !prev.player.isReloading) {
        audioSynth.playReload();
      }
      return next;
    });
  }, []);

  // Handle Player Firing
  const handleFire = useCallback(
    (clientX: number, clientY: number) => {
      if (isPaused || state.status !== 'playing') return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const targetX = (clientX - rect.left) * scaleX;
      const targetY = (clientY - rect.top) * scaleY;

      setAimPos({ x: targetX, y: targetY });

      setState((prev) => {
        const { state: nextState, outcome } = firePlayerWeapon(prev, targetX, targetY);

        if (outcome === 'headshot') {
          audioSynth.playShot();
          audioSynth.playHeadshot();
        } else if (outcome === 'hit' || outcome === 'miss') {
          audioSynth.playShot();
        } else if (outcome === 'empty') {
          audioSynth.playEmpty();
        }

        return nextState;
      });
    },
    [isPaused, state.status],
  );

  // Canvas Mouse Movement (Aim Tracking)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    setAimPos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.code === 'KeyS' || e.code === 'ArrowDown') {
        e.preventDefault();
        handleToggleCover();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReload();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleCover, handleReload]);

  // Main Animation Loop
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

          const updated = stepShooterEngine(prev, deltaSec);

          // Audio triggers on damage
          if (updated.player.health < prev.player.health) {
            audioSynth.playHit();
          }

          // Game over persistence
          if (updated.status === 'game_over' && prev.status === 'playing') {
            recordGamePlayed(updated.score > 0, 'arcade', 'stickman-shooter', updated.score);
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

  // Canvas Drawing Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Tactical Sky & Warzone Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#090D16');
    bgGradient.addColorStop(0.55, '#111827');
    bgGradient.addColorStop(1, '#060A12');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Distant mountain / ruined structures silhouettes
    ctx.fillStyle = '#0d1524';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(120, 240);
    ctx.lineTo(260, 290);
    ctx.lineTo(440, 210);
    ctx.lineTo(580, 270);
    ctx.lineTo(760, 220);
    ctx.lineTo(960, 310);
    ctx.lineTo(960, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.fill();

    // Warzone Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let y = 300; y < CANVAS_HEIGHT; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Midground Ground Plane
    ctx.fillStyle = '#0b111e';
    ctx.fillRect(0, 380, CANVAS_WIDTH, CANVAS_HEIGHT - 380);

    // 2. Render Enemy Bunkers & Enemies
    state.enemies.forEach((enemy: Enemy) => {
      // Enemy Bunker Cover
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(enemy.x - 35, enemy.y - 10, 70, 35);
      ctx.strokeRect(enemy.x - 35, enemy.y - 10, 70, 35);

      if (enemy.state === 'dead') {
        // Collapsed stickman
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(enemy.x - 20, enemy.y);
        ctx.lineTo(enemy.x + 20, enemy.y + 10);
        ctx.stroke();
        return;
      }

      // Height offset when hiding vs emerging vs aiming
      let verticalOffset = 0;
      if (enemy.state === 'hiding') {
        verticalOffset = 25; // Ducked behind sandbag
      } else if (enemy.state === 'emerging') {
        verticalOffset = (enemy.stateTimer / 0.4) * 25;
      }

      const drawY = enemy.y + verticalOffset;
      const headY = drawY - enemy.bodyHeight - enemy.headRadius;

      // Enemy Colors
      let color = '#EF4444'; // rifleman
      if (enemy.type === 'sniper') color = '#A855F7';
      if (enemy.type === 'heavy') color = '#F59E0B';
      if (enemy.type === 'boss') color = '#DC2626';

      // Stickman Body & Head
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      // Head
      ctx.beginPath();
      ctx.arc(enemy.x, headY, enemy.headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.beginPath();
      ctx.moveTo(enemy.x, headY + enemy.headRadius);
      ctx.lineTo(enemy.x, drawY);
      ctx.stroke();

      // Arms & Weapon Aiming at Player
      ctx.beginPath();
      ctx.moveTo(enemy.x, headY + enemy.headRadius + 8);
      ctx.lineTo(enemy.x - 22, drawY - 14);
      ctx.stroke();

      // Gun Barrel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(enemy.x - 32, drawY - 17, 16, 6);

      // Aim Telegraph Laser (Warning)
      if (enemy.isTelegraphing) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(enemy.x - 32, drawY - 14);
        ctx.lineTo(state.player.x, state.player.y - 20);
        ctx.stroke();
        ctx.setLineDash([]);

        // Danger exclamation badge
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('!', enemy.x - 4, headY - 10);
      }

      // Health Bar
      const barWidth = 36;
      const hpPercent = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = '#334155';
      ctx.fillRect(enemy.x - barWidth / 2, headY - 8, barWidth, 4);
      ctx.fillStyle = color;
      ctx.fillRect(enemy.x - barWidth / 2, headY - 8, barWidth * hpPercent, 4);
    });

    // 3. Render Bullet Tracers
    state.tracers.forEach((tracer) => {
      ctx.strokeStyle = tracer.color;
      ctx.lineWidth = tracer.isHeadshot ? 4 : 2.5;
      ctx.beginPath();
      ctx.moveTo(tracer.startX, tracer.startY);
      ctx.lineTo(tracer.endX, tracer.endY);
      ctx.stroke();

      // Muzzle spark
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(tracer.startX, tracer.startY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Render Player & Foreground Cover
    const p = state.player;
    const isCover = p.posture === 'cover';

    // Player Stickman
    const playerHeadY = isCover ? p.y - 25 : p.y - 65;
    const playerTorsoBottom = isCover ? p.y + 10 : p.y;

    ctx.fillStyle = '#F8FAFC';
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 5;

    // Player Head
    ctx.beginPath();
    ctx.arc(p.x, playerHeadY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Player Torso
    ctx.beginPath();
    ctx.moveTo(p.x, playerHeadY + 15);
    ctx.lineTo(p.x, playerTorsoBottom);
    ctx.stroke();

    // Player Weapon
    if (!isCover) {
      // Standing to aim
      const aimAngle = Math.atan2(aimPos.y - (playerHeadY + 20), aimPos.x - p.x);
      const gunLength = 34;
      const gunEndX = p.x + Math.cos(aimAngle) * gunLength;
      const gunEndY = playerHeadY + 20 + Math.sin(aimAngle) * gunLength;

      // Arms
      ctx.beginPath();
      ctx.moveTo(p.x, playerHeadY + 20);
      ctx.lineTo(gunEndX, gunEndY);
      ctx.stroke();

      // Rifle
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x + Math.cos(aimAngle) * 8, playerHeadY + 20 + Math.sin(aimAngle) * 8);
      ctx.lineTo(gunEndX + Math.cos(aimAngle) * 8, gunEndY + Math.sin(aimAngle) * 8);
      ctx.stroke();
    } else {
      // Ducked behind cover
      ctx.beginPath();
      ctx.moveTo(p.x, playerHeadY + 20);
      ctx.lineTo(p.x + 18, playerHeadY + 30);
      ctx.stroke();
    }

    // Player Reinforced Sandbag Bunker (Foreground)
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;

    // Layer 1 Sandbags
    ctx.beginPath();
    ctx.roundRect(p.x - 30, p.y - 12, 110, 48, 12);
    ctx.fill();
    ctx.stroke();

    // Layer 2 Sandbags
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(p.x - 20, p.y + 16, 95, 36, 8);
    ctx.fill();
    ctx.stroke();

    // Cover Shield Indicator Icon on sandbag
    ctx.fillStyle = isCover ? '#10B981' : '#64748B';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(isCover ? '🛡️ PROTECTED' : '⚠️ EXPOSED', p.x - 15, p.y + 12);

    // 5. Render Floating Texts
    state.floatingTexts.forEach((txt) => {
      ctx.fillStyle = txt.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(txt.text, txt.x, txt.y);
    });

    // 6. Tactical Crosshairs (following aimPos)
    if (state.status === 'playing' && !isCover) {
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;

      // Outer ring
      ctx.beginPath();
      ctx.arc(aimPos.x, aimPos.y, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(aimPos.x - 24, aimPos.y);
      ctx.lineTo(aimPos.x - 8, aimPos.y);
      ctx.moveTo(aimPos.x + 8, aimPos.y);
      ctx.lineTo(aimPos.x + 24, aimPos.y);
      ctx.moveTo(aimPos.x, aimPos.y - 24);
      ctx.lineTo(aimPos.x, aimPos.y - 8);
      ctx.moveTo(aimPos.x, aimPos.y + 8);
      ctx.lineTo(aimPos.x, aimPos.y + 24);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(aimPos.x, aimPos.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [state, aimPos]);

  return (
    <div
      ref={stageRef}
      className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-white select-none"
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/games/stickman-shooter"
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-base px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Overview
          </Link>
          <span className="text-sm font-bold tracking-wider text-amber-400">STICKMAN SHOOTER</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Wave */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">WAVE:</span>
            <span className="font-bold text-amber-400 text-sm">{state.wave}</span>
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

      {/* Main Canvas Battlefield Stage */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-surface-border bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseDown={(e) => handleFire(e.clientX, e.clientY)}
          className="h-full w-full cursor-crosshair object-contain"
        />

        {/* Tactical HUD Overlay (Top) */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Health Gauge */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <Shield
              className={`h-4 w-4 ${state.player.health <= 30 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400">OPERATIVE HEALTH</span>
              <div className="h-2 w-32 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    state.player.health > 50
                      ? 'bg-emerald-500'
                      : state.player.health > 25
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${state.player.health}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-200">{state.player.health} HP</span>
          </div>

          {/* Combo Multiplier */}
          {state.comboMultiplier > 1 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-1.5 border border-amber-500/40 animate-bounce">
              <Flame className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300">
                {state.comboMultiplier}x COMBO ({state.combo})
              </span>
            </div>
          )}

          {/* Tactical Ammo Magazine */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 backdrop-blur-md px-3 py-2 border border-surface-border">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-slate-400">MAGAZINE</span>
              <span
                className={`text-base font-black tracking-wider ${state.player.ammo === 0 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}
              >
                {state.player.isReloading
                  ? 'RELOADING...'
                  : `${state.player.ammo} / ${state.player.maxAmmo}`}
              </span>
            </div>
            <Zap
              className={`h-4 w-4 ${state.player.ammo === 0 ? 'text-red-500' : 'text-amber-400'}`}
            />
          </div>
        </div>

        {/* Start Game Modal / Overlay */}
        {state.status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
            <h2 className="text-3xl font-black text-amber-400 tracking-wider">STICKMAN SHOOTER</h2>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              Duck behind cover, time your breaches, dodge enemy sniper fire, and eliminate hostiles
              with precision headshots.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                🎯 Mouse: Aim &amp; Fire
              </span>
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                🛡️ S / Space: Duck / Peek
              </span>
              <span className="rounded bg-surface-raised px-2 py-1 border border-surface-border">
                ⚡ R: Reload
              </span>
            </div>
            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition active:scale-95"
            >
              <Play className="h-5 w-5 fill-slate-950" />
              DEPLOY OPERATIVE
            </button>
          </div>
        )}

        {/* Game Over Summary Modal */}
        {state.status === 'game_over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <ShieldAlert className="h-12 w-12 text-red-500 animate-bounce" />
            <h2 className="mt-2 text-3xl font-black text-red-400 tracking-wider">OPERATIVE DOWN</h2>
            <p className="text-sm text-slate-300">
              Overrun by hostile marksmen on Wave {state.wave}.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 w-full max-w-xs text-left text-xs">
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">FINAL SCORE</span>
                <p className="text-lg font-bold text-amber-400">{state.score}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">HOSTILES ELIMINATED</span>
                <p className="text-lg font-bold text-emerald-400">{state.stats.enemiesKilled}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">HEADSHOTS</span>
                <p className="text-lg font-bold text-amber-300">{state.stats.headshots}</p>
              </div>
              <div className="rounded-lg bg-surface-base p-2.5 border border-surface-border">
                <span className="text-slate-400">ACCURACY</span>
                <p className="text-lg font-bold text-sky-400">
                  {state.stats.shotsFired > 0
                    ? `${Math.round((state.stats.shotsHit / state.stats.shotsFired) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 hover:bg-amber-400 transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              DEPLOY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Tactile Mobile & Desktop Bottom Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-raised p-3 shadow-md">
        <div className="flex items-center gap-2">
          {/* Cover Stance Toggle */}
          <button
            onClick={handleToggleCover}
            disabled={state.status !== 'playing'}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-md ${
              state.player.posture === 'cover'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            {state.player.posture === 'cover' ? 'IN COVER (SPACE / S)' : 'AIMING (SPACE / S)'}
          </button>

          {/* Reload Action */}
          <button
            onClick={handleReload}
            disabled={state.status !== 'playing' || state.player.isReloading}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface-base px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:text-white transition"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            RELOAD (R)
          </button>
        </div>

        {/* Tactical Crosshair / Touch instruction */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Crosshair className="h-4 w-4 text-sky-400" />
          <span>Click/Tap canvas to aim &amp; fire</span>
        </div>
      </div>
    </div>
  );
}
