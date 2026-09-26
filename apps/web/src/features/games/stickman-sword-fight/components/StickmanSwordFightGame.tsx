'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button } from '@playdeck/ui';
import { StorageService } from '@/lib/storage/storage';
import { usePlayerStore } from '@/stores/player.store';
import {
  ARENA_FLOOR_Y,
  ARENA_WIDTH,
  type Difficulty,
  type Fighter,
  type PlayerInput,
  type SwordFightState,
  createInitialSwordFightState,
  stepSwordFightEngine,
} from '../engine/stickman-sword-fight-engine';

const STORAGE_HIGH_SCORE_KEY = 'stickman_sword_fight_high_score';

export function StickmanSwordFightGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordGamePlayed = usePlayerStore((s) => s.recordGamePlayed);

  const [state, setState] = useState<SwordFightState>(() =>
    createInitialSwordFightState({ difficulty: 'normal', isTwoPlayer: false }),
  );
  const stateRef = useRef<SwordFightState>(state);
  stateRef.current = state;

  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isTwoPlayer, setIsTwoPlayer] = useState(false);

  const cycleDifficulty = useCallback(() => {
    const next: Difficulty =
      difficulty === 'easy'
        ? 'normal'
        : difficulty === 'normal'
          ? 'hard'
          : difficulty === 'hard'
            ? 'expert'
            : 'easy';
    setDifficulty(next);
    setState(createInitialSwordFightState({ difficulty: next, isTwoPlayer }));
  }, [difficulty, isTwoPlayer]);

  // Active key inputs
  const keysRef = useRef<Record<string, boolean>>({});

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

      if (event === 'slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (event === 'heavy_slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (event === 'parry') {
        // High-pitch bell chime + metal ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.35);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (event === 'clash') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.18);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (event === 'block') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (event === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (event === 'posture_break') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.4);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (event === 'match_win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.45); // C6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch {
      // Audio playback silenced if blocked by browser policy
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

  // Restart match
  const handleRestart = useCallback(() => {
    setState(createInitialSwordFightState({ difficulty, isTwoPlayer }));
    setIsPaused(false);
  }, [difficulty, isTwoPlayer]);

  // Main game loop
  useEffect(() => {
    if (isPaused) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const keys = keysRef.current;
      const p1Input: PlayerInput = {
        moveLeft: keys['ArrowLeft'] || keys['KeyA'] || keys['a'],
        moveRight: keys['ArrowRight'] || keys['KeyD'] || keys['d'],
        jump: keys['ArrowUp'] || keys['KeyW'] || keys['w'],
        slash: keys['KeyJ'] || keys['j'],
        heavySlash: keys['KeyU'] || keys['u'],
        parry: keys['KeyK'] || keys['k'],
        dash: keys['Space'] || keys[' '],
      };

      const p2Input: PlayerInput = isTwoPlayer
        ? {
            moveLeft: keys['Numpad4'],
            moveRight: keys['Numpad6'],
            jump: keys['Numpad8'],
            slash: keys['Numpad1'],
            heavySlash: keys['Numpad2'],
            parry: keys['Numpad3'],
            dash: keys['Numpad0'],
          }
        : {};

      // Reset single-trigger keys so holding doesn't endlessly fire slashes
      if (p1Input.slash) {
        keys['KeyJ'] = false;
        keys['j'] = false;
      }
      if (p1Input.heavySlash) {
        keys['KeyU'] = false;
        keys['u'] = false;
      }
      if (p1Input.dash) {
        keys['Space'] = false;
        keys[' '] = false;
      }

      const next = stepSwordFightEngine(stateRef.current, { p1: p1Input, p2: p2Input }, dt);

      // Play audio events
      for (const evt of next.soundEvents) {
        playSound(evt);
      }

      // Handle match finish
      if (next.status === 'match_over' && stateRef.current.status !== 'match_over') {
        const finalScore = next.score;
        recordGamePlayed(next.matchWinner === 'p1', 'arcade', 'stickman-sword-fight', finalScore);
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
  }, [isPaused, isTwoPlayer, highScore, recordGamePlayed, playSound]);

  // Render Canvas
  const renderCanvas = (st: SwordFightState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = ARENA_WIDTH;
    const height = 480;

    // 1. Background Dojo Arena
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.65, '#121829');
    bgGrad.addColorStop(1, '#070a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Moonlight glow behind shoji
    const moonGlow = ctx.createRadialGradient(width / 2, 140, 10, width / 2, 140, 260);
    moonGlow.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    moonGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
    moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(0, 0, width, height);

    // Shoji screen pillars & lattice
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let x = 80; x < width; x += 110) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, ARENA_FLOOR_Y);
      ctx.stroke();
    }
    for (let y = 80; y < ARENA_FLOOR_Y; y += 70) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 40, y);
      ctx.stroke();
    }

    // Wooden Dojo Floor
    ctx.fillStyle = '#1c1511';
    ctx.fillRect(0, ARENA_FLOOR_Y, width, height - ARENA_FLOOR_Y);

    // Floor planks & reflection line
    ctx.strokeStyle = '#2d221b';
    ctx.lineWidth = 1;
    for (let y = ARENA_FLOOR_Y + 15; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glowing boundary line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, ARENA_FLOOR_Y);
    ctx.lineTo(width, ARENA_FLOOR_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 2. Render Fighters
    renderFighter(ctx, st.p1, '#38bdf8', '#0284c7');
    renderFighter(ctx, st.p2, '#f43f5e', '#be123c');

    // 3. Render Sparks
    for (const sp of st.sparks) {
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 4. Render Floating Text
    for (const ft of st.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.opacity;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  };

  const renderFighter = (
    ctx: CanvasRenderingContext2D,
    f: Fighter,
    primaryColor: string,
    _accentColor: string,
  ) => {
    ctx.save();
    const floorY = ARENA_FLOOR_Y + f.y;
    const x = f.x;
    const facing = f.facing;

    // Dash trail effect
    if (f.state === 'dashing') {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x - facing * 20, floorY - 60, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, ARENA_FLOOR_Y + 4, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stickman Body
    ctx.strokeStyle =
      f.state === 'staggered' ? '#eab308' : f.state === 'hit' ? '#ef4444' : '#f8fafc';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Head
    const headY = floorY - 64;
    ctx.beginPath();
    ctx.arc(x, headY, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Torso
    const pelvisY = floorY - 32;
    ctx.beginPath();
    ctx.moveTo(x, headY + 10);
    ctx.lineTo(x, pelvisY);
    ctx.stroke();

    // Legs
    const legOffset = f.state === 'walking' ? Math.sin(Date.now() / 80) * 12 : 10;
    ctx.beginPath();
    ctx.moveTo(x, pelvisY);
    ctx.lineTo(x - legOffset, floorY);
    ctx.moveTo(x, pelvisY);
    ctx.lineTo(x + legOffset, floorY);
    ctx.stroke();

    // Arms & Katana
    const shoulderY = headY + 15;
    let handX = x + facing * 16;
    let handY = shoulderY + 8;
    let bladeTipX = handX + facing * 45;
    let bladeTipY = handY - 20;

    if (f.state === 'parrying') {
      handX = x + facing * 12;
      handY = shoulderY - 4;
      bladeTipX = handX + facing * 5;
      bladeTipY = handY - 45; // Vertical high guard
    } else if (f.state === 'slashing') {
      handX = x + facing * 26;
      handY = shoulderY + 4;
      bladeTipX = handX + facing * 55;
      bladeTipY = handY + 10; // Forward horizontal slice
    } else if (f.state === 'heavy_slashing') {
      handX = x + facing * 32;
      handY = shoulderY + 2;
      bladeTipX = handX + facing * 65;
      bladeTipY = handY + 22; // Overhead strike
    } else if (f.state === 'staggered') {
      handX = x - facing * 10;
      handY = shoulderY + 18;
      bladeTipX = handX - facing * 25;
      bladeTipY = floorY; // Dropped sword
    }

    // Draw arm to sword hilt
    ctx.beginPath();
    ctx.moveTo(x, shoulderY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Katana Blade
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(bladeTipX, bladeTipY);
    ctx.stroke();

    // Katana Guard & Hilt
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(handX - 4, handY + 2);
    ctx.lineTo(handX + 4, handY - 2);
    ctx.stroke();

    // Parry aura indicator
    if (f.parryWindowActive) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(handX, handY - 15, 26, -Math.PI / 2, Math.PI / 2, facing === -1);
      ctx.stroke();
    }

    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 rounded-xl max-w-5xl mx-auto shadow-2xl border border-slate-800">
      {/* Top Header HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 font-mono">
            ROUND {state.round} / {state.maxRounds}
          </Badge>
          <button
            type="button"
            onClick={cycleDifficulty}
            className="cursor-pointer focus:outline-none"
            title="Click to cycle difficulty"
          >
            <Badge
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 font-mono hover:bg-cyan-950/40"
            >
              DIFFICULTY: {difficulty.toUpperCase()} ↺
            </Badge>
          </button>
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 font-mono">
            SCORE: {state.score}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono">
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
            {isTwoPlayer ? 'Mode: 2-Player Versus' : 'Mode: 1P vs AI'}
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

      {/* Fighters Health & Posture HUD */}
      <div className="w-full grid grid-cols-2 gap-6 mb-3 px-2">
        {/* Player 1 HUD */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              {state.p1.name}
              {state.p1.roundsWon > 0 && (
                <span className="text-amber-400">{'★'.repeat(state.p1.roundsWon)}</span>
              )}
            </span>
            <span className="text-slate-400">HP {Math.round(state.p1.health)} / 100</span>
          </div>
          {/* Health Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-75"
              style={{ width: `${state.p1.health}%` }}
            />
          </div>
          {/* Posture Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>POSTURE</span>
            <span className="text-amber-400">{Math.round(state.p1.posture)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-75"
              style={{ width: `${state.p1.posture}%` }}
            />
          </div>
        </div>

        {/* Player 2 HUD */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              {state.p2.name}
              {state.p2.roundsWon > 0 && (
                <span className="text-amber-400">{'★'.repeat(state.p2.roundsWon)}</span>
              )}
            </span>
            <span className="text-slate-400">HP {Math.round(state.p2.health)} / 100</span>
          </div>
          {/* Health Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-l from-rose-600 to-rose-400 transition-all duration-75 float-right"
              style={{ width: `${state.p2.health}%` }}
            />
          </div>
          {/* Posture Bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>POSTURE</span>
            <span className="text-amber-400">{Math.round(state.p2.posture)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-amber-600 to-amber-400 transition-all duration-75 float-right"
              style={{ width: `${state.p2.posture}%` }}
            />
          </div>
        </div>
      </div>

      {/* Canvas Arena */}
      <div className="relative border border-slate-800 rounded-lg overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={ARENA_WIDTH}
          height={480}
          className="w-full max-w-[800px] h-auto block bg-slate-950"
        />

        {/* Countdown Banner */}
        {state.status === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="text-center">
              <h2 className="text-5xl font-black text-amber-400 tracking-widest font-mono animate-pulse">
                ROUND {state.round}
              </h2>
              <p className="text-sm font-mono text-slate-300 mt-2">READY FOR COMBAT</p>
            </div>
          </div>
        )}

        {/* Match Over Banner */}
        {state.status === 'match_over' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="text-center p-6 bg-slate-900/90 rounded-2xl border border-amber-500/40 shadow-2xl max-w-sm">
              <h2 className="text-3xl font-black text-amber-400 font-mono mb-2">
                {state.matchWinner === 'p1' ? 'VICTORY!' : 'DEFEATED'}
              </h2>
              <p className="text-sm text-slate-300 mb-4 font-mono">
                {state.matchWinner === 'p1'
                  ? `${state.p1.name} CONQUERED THE DOJO!`
                  : `${state.p2.name} EMERGED VICTORIOUS.`}
              </p>
              <div className="text-xs text-slate-400 font-mono mb-4">
                FINAL SCORE: <span className="text-amber-400 font-bold">{state.score}</span>
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

      {/* Onscreen Mobile & Quick Controls */}
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
            ▲ Jump (W)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['KeyJ'] = true;
            }}
            className="bg-cyan-950/60 border-cyan-600/50 hover:bg-cyan-900/80 text-cyan-200 text-xs font-mono"
          >
            ⚔ Slash (J)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['KeyU'] = true;
            }}
            className="bg-amber-950/60 border-amber-600/50 hover:bg-amber-900/80 text-amber-200 text-xs font-mono"
          >
            💥 Heavy (U)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['KeyK'] = true;
            }}
            onPointerUp={() => {
              keysRef.current['KeyK'] = false;
            }}
            className="bg-indigo-950/60 border-indigo-600/50 hover:bg-indigo-900/80 text-indigo-200 text-xs font-mono"
          >
            🛡 Parry (K)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onPointerDown={() => {
              keysRef.current['Space'] = true;
            }}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono"
          >
            💨 Dash (Space)
          </Button>
        </div>
      </div>
    </div>
  );
}
