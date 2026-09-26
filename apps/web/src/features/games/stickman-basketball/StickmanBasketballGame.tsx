'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button } from '@playdeck/ui';
import { StorageService } from '@/lib/storage/storage';
import { usePlayerStore } from '@/stores/player.store';
import {
  COURT_FLOOR_Y,
  COURT_WIDTH,
  HOOPS,
  type Ball,
  type BasketballGameState,
  type BasketballPlayer,
  type PlayerControls,
  createInitialBasketballState,
  stepBasketballEngine,
} from './engine/stickman-basketball-engine';

const STORAGE_HIGH_SCORE_KEY = 'stickman_basketball_high_score';

export function StickmanBasketballGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordGamePlayed = usePlayerStore((s) => s.recordGamePlayed);

  const [state, setState] = useState<BasketballGameState>(() =>
    createInitialBasketballState(false),
  );
  const stateRef = useRef<BasketballGameState>(state);
  stateRef.current = state;

  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isTwoPlayer, setIsTwoPlayer] = useState(false);

  const keysRef = useRef<Record<string, boolean>>({});
  const p1ShootHeldRef = useRef(false);
  const p1ShootReleasedRef = useRef(false);
  const p1CrossoverTriggerRef = useRef(false);
  const p1StealTriggerRef = useRef(false);

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

      if (event === 'bounce') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (event === 'shoot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (event === 'swish') {
        // High soft hiss
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.18);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (event === 'rim_hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (event === 'dunk') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (event === 'crossover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (event === 'steal') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (event === 'buzzer') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
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

      if (e.code === 'Space' || e.code === 'KeyJ' || e.key.toLowerCase() === 'j') {
        p1ShootHeldRef.current = true;
      }
      if (e.code === 'KeyK' || e.key.toLowerCase() === 'k' || e.code === 'ShiftLeft') {
        p1CrossoverTriggerRef.current = true;
        p1StealTriggerRef.current = true;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current[e.code] = false;
      keysRef.current[e.key.toLowerCase()] = false;

      if (e.code === 'Space' || e.code === 'KeyJ' || e.key.toLowerCase() === 'j') {
        p1ShootHeldRef.current = false;
        p1ShootReleasedRef.current = true;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleRestart = useCallback(() => {
    setState(createInitialBasketballState(isTwoPlayer));
    setIsPaused(false);
  }, [isTwoPlayer]);

  // Main game loop
  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const keys = keysRef.current;
      const p1Controls: PlayerControls = {
        moveLeft: keys['ArrowLeft'] || keys['KeyA'] || keys['a'],
        moveRight: keys['ArrowRight'] || keys['KeyD'] || keys['d'],
        shootHold: p1ShootHeldRef.current,
        shootRelease: p1ShootReleasedRef.current,
        crossover: p1CrossoverTriggerRef.current,
        steal: p1StealTriggerRef.current,
      };

      p1ShootReleasedRef.current = false;
      p1CrossoverTriggerRef.current = false;
      p1StealTriggerRef.current = false;

      const p2Controls: PlayerControls = isTwoPlayer
        ? {
            moveLeft: keys['Numpad4'],
            moveRight: keys['Numpad6'],
            shootHold: keys['Numpad1'],
            shootRelease: !keys['Numpad1'],
            crossover: keys['Numpad2'],
            steal: keys['Numpad3'],
          }
        : {};

      const next = stepBasketballEngine(stateRef.current, { p1: p1Controls, p2: p2Controls }, dt);

      for (const evt of next.soundEvents) {
        playSound(evt);
      }

      if (next.status === 'game_over' && stateRef.current.status !== 'game_over') {
        const p1Won = next.p1.score > next.p2.score;
        recordGamePlayed(p1Won, 'arcade', 'stickman-basketball', next.p1.score);
        if (next.p1.score > highScore) {
          setHighScore(next.p1.score);
          StorageService.set(STORAGE_HIGH_SCORE_KEY, next.p1.score);
        }
      }

      setState(next);
      renderCanvas(next);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isTwoPlayer, highScore, recordGamePlayed, playSound]);

  const renderCanvas = (st: BasketballGameState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = COURT_WIDTH;
    const height = 480;

    // 1. Urban Blacktop Backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.65, '#121829');
    bgGrad.addColorStop(1, '#060a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Chain-link fence pattern in background
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x + 20, COURT_FLOOR_Y);
      ctx.stroke();
    }
    for (let x = width; x >= 0; x -= 30) {
      ctx.beginPath();
      ctx.moveTo(x, 100);
      ctx.lineTo(x - 20, COURT_FLOOR_Y);
      ctx.stroke();
    }

    // Court Blacktop
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, COURT_FLOOR_Y, width, height - COURT_FLOOR_Y);

    // Court Line Markings
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, COURT_FLOOR_Y);
    ctx.lineTo(width, COURT_FLOOR_Y);
    ctx.stroke();

    // Center court circle
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(width / 2, COURT_FLOOR_Y, 70, Math.PI, 0);
    ctx.stroke();

    // 3-point arcs
    ctx.beginPath();
    ctx.arc(HOOPS.left.rimX, COURT_FLOOR_Y, 260, Math.PI * 1.5, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(HOOPS.right.rimX, COURT_FLOOR_Y, 260, Math.PI, Math.PI * 1.5);
    ctx.stroke();

    // 2. Render Hoops
    renderHoop(ctx, HOOPS.left, 'left');
    renderHoop(ctx, HOOPS.right, 'right');

    // 3. Render Players
    renderPlayer(ctx, st.p1, '#38bdf8');
    renderPlayer(ctx, st.p2, '#f43f5e');

    // 4. Render Ball
    renderBall(ctx, st.ball);
  };

  const renderHoop = (
    ctx: CanvasRenderingContext2D,
    hoop: { x: number; y: number; rimX: number; backboardX: number },
    side: 'left' | 'right',
  ) => {
    ctx.save();
    // Pole
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(hoop.backboardX, COURT_FLOOR_Y);
    ctx.lineTo(hoop.backboardX, hoop.y - 60);
    ctx.stroke();

    // Backboard
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.fillRect(hoop.backboardX - 4, hoop.y - 65, 8, 85);
    ctx.strokeRect(hoop.backboardX - 4, hoop.y - 65, 8, 85);

    // Rim
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(hoop.backboardX, hoop.y);
    ctx.lineTo(hoop.rimX, hoop.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Net
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const netTipX = (hoop.rimX + hoop.backboardX) / 2;
    ctx.moveTo(hoop.rimX, hoop.y);
    ctx.lineTo(netTipX + (side === 'left' ? 4 : -4), hoop.y + 35);
    ctx.lineTo(hoop.backboardX, hoop.y);
    ctx.stroke();

    ctx.restore();
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, p: BasketballPlayer, color: string) => {
    ctx.save();
    const x = p.x;
    const y = p.y;
    const facing = p.facing;

    // Shot meter above head
    if (p.isShooting) {
      const meterW = 32;
      const meterH = 5;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - meterW / 2, y - 68, meterW, meterH);

      // Green sweet spot in the middle
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x - 4, y - 68, 8, meterH);

      // Current fill
      const isGreen = Math.abs(p.shootCharge - 0.55) < 0.12;
      ctx.fillStyle = isGreen ? '#4ade80' : '#f59e0b';
      ctx.fillRect(x - meterW / 2, y - 68, meterW * p.shootCharge, meterH);
    }

    // Shadow on blacktop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, COURT_FLOOR_Y + 2, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stickman Body
    ctx.strokeStyle = p.stumbled ? '#eab308' : color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const headY = y - 48;

    // Head
    ctx.beginPath();
    ctx.arc(x, headY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Torso
    const pelvisY = y - 22;
    ctx.beginPath();
    ctx.moveTo(x, headY + 8);
    ctx.lineTo(x, pelvisY);
    ctx.stroke();

    // Legs
    if (p.isJumping) {
      // Tucked / splayed jump legs
      ctx.beginPath();
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x - 8, y - 6);
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x + 10, y - 10);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x - 6, y);
      ctx.moveTo(x, pelvisY);
      ctx.lineTo(x + 6, y);
      ctx.stroke();
    }

    // Arms
    if (p.isShooting || p.isDunking) {
      // Raised shooting arms
      ctx.beginPath();
      ctx.moveTo(x, headY + 12);
      ctx.lineTo(x + facing * 8, headY - 4);
      ctx.lineTo(x + facing * 14, headY - 14);
      ctx.stroke();
    } else {
      // Dribbling arms
      ctx.beginPath();
      ctx.moveTo(x, headY + 12);
      ctx.lineTo(x + facing * 12, pelvisY + 4);
      ctx.stroke();
    }

    ctx.restore();
  };

  const renderBall = (ctx: CanvasRenderingContext2D, b: Ball) => {
    ctx.save();
    ctx.translate(b.x, b.y);

    ctx.fillStyle = '#ea580c';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = b.inFlight ? 8 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // Seams
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-b.radius, 0);
    ctx.lineTo(b.radius, 0);
    ctx.stroke();

    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 rounded-xl max-w-5xl mx-auto shadow-2xl border border-slate-800">
      {/* Top HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 font-mono">
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 font-bold">
            P1: {state.p1.score}
          </Badge>
          <Badge variant="outline" className="border-rose-500/50 text-rose-400 font-bold">
            P2: {state.p2.score}
          </Badge>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400">
            CLOCK: {Math.ceil(state.gameTimeRemaining)}s
          </Badge>
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300">
            SHOT CLOCK: {Math.ceil(state.shotClock)}s
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            BEST: {highScore}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTwoPlayer(!isTwoPlayer)}
            className="text-xs"
          >
            {isTwoPlayer ? 'Mode: 2P Versus' : 'Mode: 1P vs AI'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="text-xs"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart} className="text-xs">
            Restart Match
          </Button>
        </div>
      </div>

      {/* Canvas Court */}
      <div className="relative border border-slate-800 rounded-lg overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={COURT_WIDTH}
          height={480}
          className="w-full max-w-[800px] h-auto block bg-slate-950"
        />

        {/* Scored Flash Banner */}
        {state.status === 'scored' && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-950 px-6 py-2 rounded-full font-black tracking-widest font-mono shadow-2xl animate-bounce">
            +{state.lastScoredPoints} POINTS!
          </div>
        )}

        {/* Game Over Banner */}
        {state.status === 'game_over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-6 bg-slate-900/90 rounded-2xl border border-amber-500/40 shadow-2xl max-w-sm">
              <h2 className="text-3xl font-black text-amber-400 font-mono mb-2">FINAL BUZZER</h2>
              <p className="text-lg text-slate-200 mb-2 font-mono font-bold">
                {state.p1.score > state.p2.score
                  ? `${state.p1.name} WINS!`
                  : state.p2.score > state.p1.score
                    ? `${state.p2.name} WINS!`
                    : 'TIED GAME!'}
              </p>
              <div className="text-sm text-slate-400 font-mono mb-4">
                FINAL SCORE: {state.p1.score} - {state.p2.score}
              </div>
              <Button
                onClick={handleRestart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tactile Onscreen Controls */}
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
            ◀ Move Left (A)
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
            ▶ Move Right (D)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              p1ShootHeldRef.current = true;
            }}
            onPointerUp={() => {
              p1ShootHeldRef.current = false;
              p1ShootReleasedRef.current = true;
            }}
            className="bg-amber-950/60 border-amber-600/50 hover:bg-amber-900/80 text-amber-200 text-xs font-mono"
          >
            🏀 Hold to Jump / Release to Shoot (Space)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              p1CrossoverTriggerRef.current = true;
              p1StealTriggerRef.current = true;
            }}
            className="bg-indigo-950/60 border-indigo-600/50 hover:bg-indigo-900/80 text-indigo-200 text-xs font-mono"
          >
            ⚡ Crossover / Steal (K)
          </Button>
        </div>
      </div>
    </div>
  );
}
