'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button } from '@playdeck/ui';
import { StorageService } from '@/lib/storage/storage';
import { usePlayerStore } from '@/stores/player.store';
import {
  ARENA_WIDTH,
  type Guard,
  type NinjaGameState,
  type NinjaInputs,
  type NinjaPlayer,
  type Shuriken,
  createInitialNinjaState,
  stepNinjaEngine,
} from '../engine/stickman-ninja-engine';

const STORAGE_HIGH_SCORE_KEY = 'stickman_ninja_high_score';

export function StickmanNinjaGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordGamePlayed = usePlayerStore((s) => s.recordGamePlayed);

  const [state, setState] = useState<NinjaGameState>(() => createInitialNinjaState(1, 0));
  const stateRef = useRef<NinjaGameState>(state);
  stateRef.current = state;

  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const keysRef = useRef<Record<string, boolean>>({});
  const pendingThrowRef = useRef<{ targetX: number; targetY: number } | null>(null);
  const pendingSmokeRef = useRef(false);
  const pendingTakedownRef = useRef(false);

  // Sound generator
  const playSound = useCallback((event: string) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (event === 'shuriken_throw') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (event === 'shuriken_hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (event === 'takedown') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (event === 'smoke_bomb') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (event === 'alert') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (event === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (event === 'level_clear') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.36); // C6
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch {
      // Audio playback suspended
    }
  }, []);

  // Load high score
  useEffect(() => {
    async function loadScore() {
      const saved = await StorageService.get<number>(STORAGE_HIGH_SCORE_KEY);
      if (typeof saved === 'number') {
        setHighScore(saved);
      }
    }
    loadScore();
  }, []);

  // Keyboard events
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;
      keysRef.current[e.key.toLowerCase()] = true;

      if (e.code === 'KeyE' || e.key.toLowerCase() === 'e') {
        pendingSmokeRef.current = true;
      }
      if (e.code === 'KeyF' || e.key.toLowerCase() === 'f') {
        pendingTakedownRef.current = true;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current[e.code] = false;
      keysRef.current[e.key.toLowerCase()] = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse aim for shuriken
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = 480 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    pendingThrowRef.current = { targetX: clickX, targetY: clickY };
  };

  const handleRestart = useCallback(() => {
    setState(createInitialNinjaState(1, 0));
    setIsPaused(false);
  }, []);

  const handleNextLevel = useCallback(() => {
    const nextLevel = state.level < 3 ? state.level + 1 : 1;
    setState(createInitialNinjaState(nextLevel, state.score));
  }, [state.level, state.score]);

  // Main game loop
  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const keys = keysRef.current;
      const inputs: NinjaInputs = {
        moveLeft: keys['ArrowLeft'] || keys['KeyA'] || keys['a'],
        moveRight: keys['ArrowRight'] || keys['KeyD'] || keys['d'],
        crouch: keys['ArrowDown'] || keys['KeyS'] || keys['s'],
        jump: keys['ArrowUp'] || keys['KeyW'] || keys['w'],
        throwShuriken: pendingThrowRef.current,
        deploySmoke: pendingSmokeRef.current,
        takedown: pendingTakedownRef.current,
      };

      pendingThrowRef.current = null;
      pendingSmokeRef.current = false;
      pendingTakedownRef.current = false;

      const next = stepNinjaEngine(stateRef.current, inputs, dt);

      for (const evt of next.soundEvents) {
        playSound(evt);
      }

      if (next.status === 'game_over' && stateRef.current.status !== 'game_over') {
        const finalScore = next.score;
        recordGamePlayed(false, 'arcade', 'stickman-ninja', finalScore);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          StorageService.set(STORAGE_HIGH_SCORE_KEY, finalScore);
        }
      } else if (next.status === 'level_clear' && stateRef.current.status !== 'level_clear') {
        const finalScore = next.score;
        recordGamePlayed(true, 'arcade', 'stickman-ninja', finalScore);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          StorageService.set(STORAGE_HIGH_SCORE_KEY, finalScore);
        }
      }

      setState(next);
      renderCanvas(next);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, highScore, recordGamePlayed, playSound]);

  const renderCanvas = (st: NinjaGameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = ARENA_WIDTH;
    const height = 480;

    // 1. Sky & Japanese Fortress Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#050814');
    bgGrad.addColorStop(0.65, '#0b1122');
    bgGrad.addColorStop(1, '#04070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Moon in background
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(680, 100, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pagoda rafter silhouettes
    ctx.fillStyle = '#070b16';
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.lineTo(240, 90);
    ctx.lineTo(480, 150);
    ctx.lineTo(800, 80);
    ctx.lineTo(800, 480);
    ctx.lineTo(0, 480);
    ctx.fill();

    // 2. Platforms & Rafters
    for (const plat of st.platforms) {
      if (plat.isShadow) {
        // Shadow concealment alcove
        ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      } else {
        // Wooden rafter beams
        ctx.fillStyle = '#1c1511';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      }
    }

    // 3. Smoke Clouds
    for (const sc of st.smokeClouds) {
      ctx.save();
      const alpha = Math.max(0, sc.life / sc.maxLife) * 0.45;
      const smokeGrad = ctx.createRadialGradient(sc.x, sc.y, 10, sc.x, sc.y, sc.radius);
      smokeGrad.addColorStop(0, `rgba(148, 163, 184, ${alpha})`);
      smokeGrad.addColorStop(0.7, `rgba(71, 85, 105, ${alpha * 0.5})`);
      smokeGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(sc.x, sc.y, sc.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Sacred Scroll Goal
    if (!st.scrollCollected) {
      ctx.save();
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(st.scrollX - 8, st.scrollY - 18, 16, 18);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(st.scrollX - 9, st.scrollY - 10, 18, 4); // ribbon
      ctx.restore();
    }

    // 5. Vision Cones & Guards
    for (const g of st.guards) {
      renderGuard(ctx, g);
    }

    // 6. Flying / Embedded Shurikens
    for (const s of st.shurikens) {
      renderShuriken(ctx, s);
    }

    // 7. Player Ninja
    renderNinjaPlayer(ctx, st.player);
  };

  const renderGuard = (ctx: CanvasRenderingContext2D, g: Guard) => {
    if (g.state === 'eliminated') {
      // Fallen guard on ground
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(g.x - 15, g.y);
      ctx.lineTo(g.x + 15, g.y);
      ctx.stroke();
      return;
    }

    // Vision cone
    if (g.state !== 'stunned') {
      ctx.save();
      const coneDist = 200;
      const coneY1 = g.y - 45;
      const coneY2 = g.y + 15;
      const tipX = g.x + g.facing * 10;
      const farX = g.x + g.facing * coneDist;

      const coneColor =
        g.state === 'alerted'
          ? 'rgba(239, 68, 68, 0.22)'
          : g.state === 'suspicious'
            ? 'rgba(245, 158, 11, 0.18)'
            : 'rgba(251, 191, 36, 0.1)';

      ctx.fillStyle = coneColor;
      ctx.beginPath();
      ctx.moveTo(tipX, g.y - 25);
      ctx.lineTo(farX, coneY1);
      ctx.lineTo(farX, coneY2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Alert meter indicator above head
    if (g.alertMeter > 0) {
      const meterW = 28;
      const meterH = 4;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(g.x - meterW / 2, g.y - 58, meterW, meterH);
      ctx.fillStyle = g.alertMeter >= 100 ? '#ef4444' : '#f59e0b';
      ctx.fillRect(g.x - meterW / 2, g.y - 58, (meterW * g.alertMeter) / 100, meterH);
    }

    // Stunned indicator (spinning stars)
    if (g.state === 'stunned') {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('💫', g.x - 8, g.y - 50);
    }

    // Guard Body (Red/Crimson Samurai)
    ctx.strokeStyle = g.state === 'alerted' ? '#ef4444' : '#f43f5e';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Head / Helmet
    ctx.beginPath();
    ctx.arc(g.x, g.y - 36, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Torso
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - 28);
    ctx.lineTo(g.x, g.y - 14);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - 14);
    ctx.lineTo(g.x - 7, g.y);
    ctx.moveTo(g.x, g.y - 14);
    ctx.lineTo(g.x + 7, g.y);
    ctx.stroke();

    // Spear / Naginata
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    const spearX = g.x + g.facing * 10;
    ctx.beginPath();
    ctx.moveTo(spearX, g.y - 48);
    ctx.lineTo(spearX, g.y);
    ctx.stroke();
  };

  const renderShuriken = (ctx: CanvasRenderingContext2D, s: Shuriken) => {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;

    // 4-pointed star
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(2, -2);
    ctx.lineTo(6, 0);
    ctx.lineTo(2, 2);
    ctx.lineTo(0, 6);
    ctx.lineTo(-2, 2);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-2, -2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const renderNinjaPlayer = (ctx: CanvasRenderingContext2D, p: NinjaPlayer) => {
    ctx.save();
    const x = p.x;
    const y = p.y;
    const facing = p.facing;

    // Noise radius ring (if moving)
    if (p.noiseRadius > 0) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y - 18, p.noiseRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shadow hiding aura
    if (p.isHiding) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.beginPath();
      ctx.arc(x, y - 20, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stickman Ninja
    ctx.strokeStyle = p.isHiding ? '#38bdf8' : '#f8fafc';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    const headY = p.isCrouched ? y - 28 : y - 44;

    // Head
    ctx.beginPath();
    ctx.arc(x, headY, 7.5, 0, Math.PI * 2);
    ctx.stroke();

    // Red Headband trailing
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - facing * 6, headY);
    ctx.lineTo(x - facing * 18, headY + 3);
    ctx.stroke();

    // Glowing cyan visor eye
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + facing * 4, headY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Torso
    ctx.strokeStyle = p.isHiding ? '#38bdf8' : '#f8fafc';
    ctx.lineWidth = 3.5;
    const pelvisY = p.isCrouched ? y - 12 : y - 18;
    ctx.beginPath();
    ctx.moveTo(x, headY + 7.5);
    ctx.lineTo(x, pelvisY);
    ctx.stroke();

    // Legs
    if (p.isCrouched) {
      ctx.beginPath();
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x - 8, y);
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x + 8, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x - 6, y);
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x + 6, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 rounded-xl max-w-5xl mx-auto shadow-2xl border border-slate-800">
      {/* HUD Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 font-mono">
            SECTOR {state.level} / 3
          </Badge>
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 font-mono">
            SCORE: {state.score}
          </Badge>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 font-mono">
            SHURIKENS: {'✦ '.repeat(state.player.shurikens)}
          </Badge>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 font-mono">
            SMOKE: {'💨 '.repeat(state.player.smokeBombs)}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono">
            BEST: {highScore}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart} className="text-xs">
            Restart
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative border border-slate-800 rounded-lg overflow-hidden shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={480}
          onClick={handleCanvasClick}
          className="w-full max-w-[800px] h-auto block bg-slate-950"
        />

        {/* Level Clear Overlay */}
        {state.status === 'level_clear' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-6 bg-slate-900/90 rounded-2xl border border-cyan-500/40 shadow-2xl max-w-sm">
              <h2 className="text-3xl font-black text-cyan-400 font-mono mb-2">
                SECTOR INFILTRATED
              </h2>
              <p className="text-sm text-slate-300 mb-4 font-mono">
                Sacred scroll retrieved without triggering high alert!
              </p>
              <div className="text-xs text-slate-400 font-mono mb-4">
                SCORE: <span className="text-cyan-400 font-bold">{state.score}</span>
              </div>
              <Button
                onClick={handleNextLevel}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold"
              >
                {state.level < 3 ? 'Proceed to Next Sector' : 'Conquer Castle (Restart)'}
              </Button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {state.status === 'game_over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-6 bg-slate-900/90 rounded-2xl border border-rose-500/40 shadow-2xl max-w-sm">
              <h2 className="text-3xl font-black text-rose-400 font-mono mb-2">
                SPOTTED & DEFEATED
              </h2>
              <p className="text-sm text-slate-300 mb-4 font-mono">
                The guards sounded the fortress alarm and cut off your escape.
              </p>
              <div className="text-xs text-slate-400 font-mono mb-4">
                FINAL SCORE: <span className="text-amber-400 font-bold">{state.score}</span>
              </div>
              <Button
                onClick={handleRestart}
                className="w-full bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Onscreen Tactile Controls */}
      <div className="w-full mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['ArrowLeft'] = true;
            }}
            onPointerUp={() => {
              keysRef.current['ArrowLeft'] = false;
            }}
            className="text-xs"
          >
            ◀ Sneak Left (A)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['ArrowRight'] = true;
            }}
            onPointerUp={() => {
              keysRef.current['ArrowRight'] = false;
            }}
            className="text-xs"
          >
            ▶ Sneak Right (D)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['ArrowDown'] = true;
            }}
            onPointerUp={() => {
              keysRef.current['ArrowDown'] = false;
            }}
            className="text-xs"
          >
            ▼ Crouch / Hide (S)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['ArrowUp'] = true;
            }}
            onPointerUp={() => {
              keysRef.current['ArrowUp'] = false;
            }}
            className="text-xs"
          >
            ▲ Vault / Jump (W)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              pendingSmokeRef.current = true;
            }}
            className="bg-emerald-950/60 border-emerald-600/50 hover:bg-emerald-900/80 text-emerald-200 text-xs font-mono"
          >
            💨 Smoke Bomb (E)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              pendingTakedownRef.current = true;
            }}
            className="bg-rose-950/60 border-rose-600/50 hover:bg-rose-900/80 text-rose-200 text-xs font-mono"
          >
            🗡 Takedown (F)
          </Button>
        </div>
      </div>
    </div>
  );
}
