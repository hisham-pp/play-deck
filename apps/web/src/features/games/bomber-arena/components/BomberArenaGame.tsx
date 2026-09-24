'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialBomberState,
  getBotAction,
  stepBomberGame,
  BomberArenaState,
  PlayerAction,
  GRID_WIDTH,
  GRID_HEIGHT,
} from '../engine/bomber-engine';

export function BomberArenaGame() {
  const [mode, setMode] = useState<'solo' | 'local2p'>('solo');
  const [gameState, setGameState] = useState<BomberArenaState>(() => createInitialBomberState());
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Keyboard input states
  const keysDownRef = useRef<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound synthesizer
  const playSound = useCallback(
    (type: 'bomb_drop' | 'explosion' | 'powerup' | 'death' | 'win') => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          void ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'bomb_drop') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'explosion') {
          // Low punchy explosion
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'powerup') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(660, now + 0.08);
          osc.frequency.setValueAtTime(880, now + 0.16);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'death') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        } else if (type === 'win') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.12);
          osc.frequency.setValueAtTime(783.99, now + 0.24);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.45);
        }
      } catch {
        // Ignore audio failures if browser blocks autoplay
      }
    },
    [soundEnabled],
  );

  // Initialize or restart match
  const startNewMatch = useCallback((chosenMode: 'solo' | 'local2p') => {
    setMode(chosenMode);
    const playersConfig =
      chosenMode === 'solo'
        ? [
            { name: 'You (P1)', isAi: false },
            { name: 'NitroBot', isAi: true },
            { name: 'BlastBot', isAi: true },
            { name: 'SparkBot', isAi: true },
          ]
        : [
            { name: 'Player 1', isAi: false },
            { name: 'Player 2', isAi: false },
            { name: 'BlastBot', isAi: true },
            { name: 'SparkBot', isAi: true },
          ];

    setGameState(createInitialBomberState(playersConfig));
    setIsPaused(false);
  }, []);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on game control keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      keysDownRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop (requestAnimationFrame)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const deltaMs = Math.min(currentTime - lastTime, 50);
      lastTime = currentTime;

      if (!isPaused && gameState.status === 'playing') {
        const keys = keysDownRef.current;
        const actions: Record<string, PlayerAction> = {};

        // Player 1 Controls (WASD + Space)
        let p1X = 0;
        let p1Y = 0;
        if (keys.has('w') || keys.has('arrowup')) p1Y -= 1;
        if (keys.has('s') || keys.has('arrowdown')) p1Y += 1;
        if (keys.has('a') || keys.has('arrowleft')) p1X -= 1;
        if (keys.has('d') || keys.has('arrowright')) p1X += 1;

        actions['p1'] = {
          moveX: p1X,
          moveY: p1Y,
          placeBomb: keys.has(' ') || keys.has('space'),
        };

        // Player 2 Controls (if local2p: IJKL / Numpad or Arrow keys + Enter)
        if (mode === 'local2p') {
          let p2X = 0;
          let p2Y = 0;
          if (keys.has('i')) p2Y -= 1;
          if (keys.has('k')) p2Y += 1;
          if (keys.has('j')) p2X -= 1;
          if (keys.has('l')) p2X += 1;

          actions['p2'] = {
            moveX: p2X,
            moveY: p2Y,
            placeBomb: keys.has('enter') || keys.has('e'),
          };
        }

        // AI bot actions
        for (const player of gameState.players) {
          if (player.isAi && player.alive) {
            actions[player.id] = getBotAction(player, gameState);
          }
        }

        const prevBombCount = gameState.bombs.length;
        const prevAliveCount = gameState.players.filter((p) => p.alive).length;

        const nextState = stepBomberGame(gameState, actions, deltaMs);

        // Sound triggers
        if (nextState.bombs.length > prevBombCount) {
          playSound('bomb_drop');
        }
        if (nextState.explosions.length > gameState.explosions.length) {
          playSound('explosion');
        }
        const currAliveCount = nextState.players.filter((p) => p.alive).length;
        if (currAliveCount < prevAliveCount) {
          playSound('death');
        }
        if (nextState.status === 'round_over' && gameState.status === 'playing') {
          playSound('win');
        }

        setGameState(nextState);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, mode, playSound]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / GRID_WIDTH;
    const cellH = height / GRID_HEIGHT;

    // Background Arena Floor
    ctx.fillStyle = '#0c1222';
    ctx.fillRect(0, 0, width, height);

    // Floor grid tiles
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const isChecker = (x + y) % 2 === 0;
        ctx.fillStyle = isChecker ? '#10192e' : '#0e1628';
        ctx.fillRect(x * cellW, y * cellH, cellW, cellH);

        // Subtle tile outline
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellW, y * cellH, cellW, cellH);
      }
    }

    // Grid Objects: Solid Walls & Destructible Blocks
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const tile = gameState.grid[y][x];
        const px = x * cellW;
        const py = y * cellH;

        if (tile === 'solid_wall') {
          // Indestructible Pillar / Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);

          // Top highlight
          ctx.fillStyle = '#334155';
          ctx.fillRect(px + 4, py + 4, cellW - 8, 4);

          // Center steel rivet
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(px + cellW / 2, py + cellH / 2, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, cellW - 4, cellH - 4);
        } else if (tile === 'destructible_block') {
          // Destructible Crate
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 3, py + 3, cellW - 6, cellH - 6);

          // Wood plank detail
          ctx.fillStyle = '#92400e';
          ctx.fillRect(px + 6, py + 6, cellW - 12, cellH - 12);

          // Hazard Cross
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px + 8, py + 8);
          ctx.lineTo(px + cellW - 8, py + cellH - 8);
          ctx.moveTo(px + cellW - 8, py + 8);
          ctx.lineTo(px + 8, py + cellH - 8);
          ctx.stroke();

          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 3, py + 3, cellW - 6, cellH - 6);
        }
      }
    }

    // Power-ups
    for (const pu of gameState.powerUps) {
      const px = pu.tileX * cellW + cellW / 2;
      const py = pu.tileY * cellH + cellH / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, cellW * 0.32, 0, Math.PI * 2);

      let color = '#f59e0b';
      let symbol = '+B';
      if (pu.type === 'blast_range') {
        color = '#ef4444';
        symbol = '+F';
      } else if (pu.type === 'speed_up') {
        color = '#3b82f6';
        symbol = '+S';
      } else if (pu.type === 'shield') {
        color = '#10b981';
        symbol = 'SH';
      }

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, px, py);
      ctx.restore();
    }

    // Bombs
    const now = Date.now();
    for (const bomb of gameState.bombs) {
      const bx = bomb.tileX * cellW + cellW / 2;
      const by = bomb.tileY * cellH + cellH / 2;
      const progress = (now - bomb.plantedAt) / bomb.fuseMs;
      const pulse = 1 + Math.sin(progress * 25) * 0.12;

      ctx.save();
      // Outer bomb sphere
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bx, by, cellW * 0.36 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Bomb ring
      ctx.strokeStyle = progress > 0.7 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Fuse cap
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx - 3, by - cellW * 0.38 * pulse - 4, 6, 4);

      // Spark fuse
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bx, by - cellW * 0.38 * pulse - 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Explosions
    for (const exp of gameState.explosions) {
      for (const cell of exp.cells) {
        const cx = cell.tileX * cellW;
        const cy = cell.tileY * cellH;

        ctx.save();
        // Inner orange flame
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 12;
        ctx.fillRect(cx + 2, cy + 2, cellW - 4, cellH - 4);

        // Bright yellow core
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx + cellW / 2, cy + cellH / 2, cellW * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Players
    for (const p of gameState.players) {
      if (!p.alive) continue;

      const px = p.x * cellW;
      const py = p.y * cellH;
      const r = cellW * 0.34;

      ctx.save();

      // Temporary invulnerability blinking
      if (now < p.invulnerableUntil && Math.floor(now / 100) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Player shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(px, py + r * 0.8, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player helmet/body
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Visor / eyes indicating facing direction
      ctx.fillStyle = '#0f172a';
      let vx = px;
      let vy = py;
      if (p.facing === 'up') vy -= r * 0.35;
      else if (p.facing === 'down') vy += r * 0.25;
      else if (p.facing === 'left') vx -= r * 0.35;
      else if (p.facing === 'right') vx += r * 0.35;

      ctx.beginPath();
      ctx.arc(vx, vy, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Active Shield Bubble
      if (p.hasShield) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, r * 1.35, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.name, px, py - r - 4);

      ctx.restore();
    }
  }, [gameState]);

  // Mobile virtual button helpers
  const handleVirtualDirection = (dir: 'up' | 'down' | 'left' | 'right' | 'stop') => {
    keysDownRef.current.delete('w');
    keysDownRef.current.delete('s');
    keysDownRef.current.delete('a');
    keysDownRef.current.delete('d');

    if (dir === 'up') keysDownRef.current.add('w');
    if (dir === 'down') keysDownRef.current.add('s');
    if (dir === 'left') keysDownRef.current.add('a');
    if (dir === 'right') keysDownRef.current.add('d');
  };

  const handleVirtualBomb = () => {
    keysDownRef.current.add(' ');
    setTimeout(() => {
      keysDownRef.current.delete(' ');
    }, 150);
  };

  const winner = gameState.players.find((p) => p.id === gameState.winnerId);

  return (
    <div className="flex w-full flex-col items-center justify-center p-3 sm:p-6 text-deck-100">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {/* Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deck-800 bg-deck-900/90 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-deck-300 transition-colors hover:bg-deck-700 hover:text-white"
              title="Return to Discovery"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-arcade text-lg font-black tracking-wide text-white sm:text-xl">
                  BOMBER ARENA
                </h1>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {mode === 'solo' ? 'SOLO VS AI' : 'LOCAL 2P'}
                </span>
              </div>
              <p className="text-xs text-deck-400">
                Destroy crates, collect tactical power-ups, blast opponents!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-deck-300 transition-colors hover:bg-deck-700"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-deck-300 transition-colors hover:bg-deck-700"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              onClick={() => startNewMatch(mode)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-deck-700 bg-deck-800 px-3 text-xs font-semibold text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => startNewMatch('solo')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-2 text-xs font-bold transition-all ${
              mode === 'solo'
                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Solo vs 3 Bots
          </button>
          <button
            onClick={() => startNewMatch('local2p')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-2 text-xs font-bold transition-all ${
              mode === 'local2p'
                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Local 2-Player Versus
          </button>
        </div>

        {/* Players Status Ribbon */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {gameState.players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg border p-2.5 text-xs ${
                p.alive
                  ? 'border-deck-700 bg-deck-900/60'
                  : 'border-red-950/40 bg-red-950/10 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3.5 w-3.5 rounded-full border border-white/20"
                  style={{ backgroundColor: p.color }}
                />
                <div>
                  <div className="flex items-center gap-1 font-bold text-white">
                    {p.name}
                    {p.isAi && <Bot className="h-3 w-3 text-deck-400" />}
                  </div>
                  <div className="text-[10px] text-deck-400">
                    {p.alive ? `Score: ${p.score}` : 'ELIMINATED'}
                  </div>
                </div>
              </div>

              {p.alive && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-deck-300">
                  {p.hasShield && <Shield className="h-3.5 w-3.5 text-emerald-400" />}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <Flame className="h-3 w-3" />
                    <span>{p.blastRange}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Canvas Arena */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-deck-800 bg-deck-950 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={650}
            height={550}
            className="aspect-[13/11] max-h-[70vh] w-full max-w-[650px] object-contain"
          />

          {/* Round Over / Winner Overlay */}
          {gameState.status === 'round_over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-sm animate-in fade-in zoom-in-95">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="font-arcade text-2xl font-black tracking-wider text-white">
                {winner ? `${winner.name.toUpperCase()} WINS!` : 'DRAW MATCH!'}
              </h2>
              <p className="mt-1 text-sm text-deck-300">
                {winner
                  ? `Spectacular arena domination! Score: ${winner.score}`
                  : 'All bombers eliminated in crossfire!'}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => startNewMatch(mode)}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-arcade text-xs font-bold text-deck-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  PLAY AGAIN
                </button>
                <Link
                  href="/games"
                  className="flex items-center gap-2 rounded-xl border border-deck-700 bg-deck-800 px-5 py-3 text-xs font-bold text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
                >
                  DISCOVERY
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Touch Directional Controls */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-deck-800 bg-deck-900/60 p-4 sm:hidden">
          <div className="flex items-center justify-between w-full">
            {/* D-Pad */}
            <div className="grid grid-cols-3 gap-1 w-32">
              <div />
              <button
                onTouchStart={() => handleVirtualDirection('up')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-amber-500 active:text-deck-950"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />

              <button
                onTouchStart={() => handleVirtualDirection('left')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-amber-500 active:text-deck-950"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 items-center justify-center rounded-lg bg-deck-900 border border-deck-800" />
              <button
                onTouchStart={() => handleVirtualDirection('right')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-amber-500 active:text-deck-950"
              >
                <ArrowRight className="h-5 w-5" />
              </button>

              <div />
              <button
                onTouchStart={() => handleVirtualDirection('down')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-amber-500 active:text-deck-950"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              <div />
            </div>

            {/* Bomb Button */}
            <button
              onClick={handleVirtualBomb}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-red-500 bg-red-600/90 text-white shadow-lg shadow-red-600/30 active:scale-95 active:bg-red-500"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-arcade text-[10px] font-black">BOMB</span>
            </button>
          </div>
        </div>

        {/* Desktop Controls Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-deck-800 bg-deck-900/40 p-3 text-xs text-deck-400">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-white">P1:</strong> WASD or Arrow Keys to move,{' '}
              <strong className="text-amber-400">SPACE</strong> to place bomb
            </span>
            {mode === 'local2p' && (
              <span>
                <strong className="text-white">P2:</strong> IJKL to move,{' '}
                <strong className="text-amber-400">ENTER / E</strong> to place bomb
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> +1 Bomb
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> +1 Flame Range
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> +Speed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Shield
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
