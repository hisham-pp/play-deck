'use client';

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Flag,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialPlatformRaceState,
  getBotRaceAction,
  stepPlatformRace,
  PlatformRaceState,
  PlayerRaceAction,
  COURSE_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from '../engine/platform-race-engine';

export function PlatformRaceGame() {
  const [mode, setMode] = useState<'solo' | 'local2p'>('solo');
  const [gameState, setGameState] = useState<PlatformRaceState>(() =>
    createInitialPlatformRaceState([
      { name: 'You (P1)', isAi: false },
      { name: 'ApexBot', isAi: true },
      { name: 'TurboBot', isAi: true },
      { name: 'FlashBot', isAi: true },
    ]),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const keysDownRef = useRef<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const cameraXRef = useRef(0);

  // Sound Synthesizer
  const playSound = useCallback(
    (type: 'jump' | 'double_jump' | 'spring' | 'boost' | 'checkpoint' | 'finish') => {
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

        if (type === 'jump') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === 'double_jump') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
        } else if (type === 'spring') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.22);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (type === 'boost') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.28);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'checkpoint') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'finish') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.15);
          osc.frequency.setValueAtTime(783.99, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
        }
      } catch {
        // Ignore audio failures if autoplay restricted
      }
    },
    [soundEnabled],
  );

  const startNewRace = useCallback((chosenMode: 'solo' | 'local2p') => {
    setMode(chosenMode);
    const configs =
      chosenMode === 'solo'
        ? [
            { name: 'You (P1)', isAi: false },
            { name: 'ApexBot', isAi: true },
            { name: 'TurboBot', isAi: true },
            { name: 'FlashBot', isAi: true },
          ]
        : [
            { name: 'Player 1', isAi: false },
            { name: 'Player 2', isAi: false },
            { name: 'ApexBot', isAi: true },
            { name: 'TurboBot', isAi: true },
          ];

    setGameState(createInitialPlatformRaceState(configs));
    cameraXRef.current = 0;
    setIsPaused(false);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 'd'].includes(
          e.key.toLowerCase(),
        )
      ) {
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

  // Main Race Loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (!isPaused && gameState.status !== 'finished') {
        const keys = keysDownRef.current;
        const actions: Record<string, PlayerRaceAction> = {};

        // Player 1: A / D / Space / W
        const p1Left = keys.has('a') || (mode === 'solo' && keys.has('arrowleft'));
        const p1Right = keys.has('d') || (mode === 'solo' && keys.has('arrowright'));
        const p1Jump = keys.has(' ') || keys.has('w') || (mode === 'solo' && keys.has('arrowup'));

        actions['racer_1'] = {
          moveLeft: p1Left,
          moveRight: p1Right,
          jump: p1Jump,
        };

        // Player 2 (Local 2P): Left / Right / Up / Enter
        if (mode === 'local2p') {
          actions['racer_2'] = {
            moveLeft: keys.has('arrowleft'),
            moveRight: keys.has('arrowright'),
            jump: keys.has('arrowup') || keys.has('enter'),
          };
        }

        // AI Bot Racers
        for (const player of gameState.players) {
          if (player.isAi && !player.finished) {
            actions[player.id] = getBotRaceAction(player, gameState);
          }
        }

        const prevCheckpoints = gameState.players.map((p) => p.lastCheckpointIndex);
        const prevFinishedCount = gameState.winners.length;

        const nextState = stepPlatformRace(gameState, actions, dt);

        // Sound triggers
        const lead = nextState.players[0];
        if (lead.lastCheckpointIndex > prevCheckpoints[0]) {
          playSound('checkpoint');
        }
        if (nextState.winners.length > prevFinishedCount) {
          playSound('finish');
        }

        setGameState(nextState);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, mode, playSound]);

  // Smooth Horizontal Camera Tracking & Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewportW = canvas.width;
    const viewportH = canvas.height;

    // Follow lead human player
    const targetPlayer = gameState.players[0];
    const targetCamX = Math.max(
      0,
      Math.min(COURSE_WIDTH - viewportW, targetPlayer.x - viewportW * 0.35),
    );
    cameraXRef.current += (targetCamX - cameraXRef.current) * 0.12;
    const camX = cameraXRef.current;

    ctx.clearRect(0, 0, viewportW, viewportH);

    // 1. Parallax Cyberpunk Grid Sky
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, viewportW, viewportH);

    // Distant city silhouette
    const cityOffset = (camX * 0.2) % 200;
    ctx.fillStyle = '#111827';
    for (let bx = -cityOffset; bx < viewportW + 200; bx += 80) {
      ctx.fillRect(bx, 180, 60, viewportH - 180);
    }

    // Midground hills / grids
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let gx = -(camX % 60); gx < viewportW; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, viewportH);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(-camX, 0);

    // 2. Render Platforms
    for (const plat of gameState.course.platforms) {
      const isMoving = plat.type.startsWith('moving');

      // Platform body
      ctx.fillStyle = isMoving ? '#1e293b' : '#0f172a';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Top glowing neon surface
      ctx.fillStyle = isMoving ? '#38bdf8' : '#06b6d4';
      ctx.shadowColor = isMoving ? '#38bdf8' : '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.fillRect(plat.x, plat.y, plat.width, 4);
      ctx.shadowBlur = 0;

      // Border outline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
    }

    // 3. Render Spring Pads
    for (const spring of gameState.course.springs) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(spring.x, spring.y, spring.width, spring.height);

      // Spring coil indicator
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(spring.x, spring.y, spring.width, spring.height);
    }

    // 4. Render Boost Pads
    for (const boost of gameState.course.boostPads) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(boost.x, boost.y, boost.width, boost.height);

      // Moving neon arrow effect
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.strokeRect(boost.x, boost.y, boost.width, boost.height);
    }

    // 5. Render Hazards (Acid / Spikes)
    for (const h of gameState.course.hazards) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(h.x, h.y, h.width, h.height);

      // Warning spikes
      ctx.fillStyle = '#f87171';
      for (let sx = h.x; sx < h.x + h.width; sx += 16) {
        ctx.beginPath();
        ctx.moveTo(sx, h.y + h.height);
        ctx.lineTo(sx + 8, h.y);
        ctx.lineTo(sx + 16, h.y + h.height);
        ctx.fill();
      }
    }

    // 6. Checkpoints
    gameState.course.checkpoints.forEach((cp, idx) => {
      const active = gameState.players[0].lastCheckpointIndex >= idx;
      ctx.fillStyle = active ? '#10b981' : '#64748b';
      ctx.shadowColor = active ? '#10b981' : 'transparent';
      ctx.shadowBlur = active ? 12 : 0;

      // Laser Gate beam
      ctx.fillRect(cp.x, cp.y, 4, cp.height);
      ctx.fillRect(cp.x + cp.width - 4, cp.y, 4, cp.height);

      // Checkpoint Banner
      ctx.fillStyle = active ? '#34d399' : '#94a3b8';
      ctx.fillRect(cp.x, cp.y, cp.width, 16);
      ctx.shadowBlur = 0;
    });

    // 7. Finish Line
    const finX = gameState.course.finishLineX;
    const isEvenFinish = Math.floor(gameState.raceTimeSec * 4) % 2 === 0;
    ctx.fillStyle = isEvenFinish ? '#ffffff' : '#000000';
    ctx.fillRect(finX, 100, 16, 420);

    // Finish Checkered pattern
    for (let fy = 100; fy < 520; fy += 20) {
      ctx.fillStyle = Math.floor(fy / 20) % 2 === 0 ? '#ffffff' : '#f59e0b';
      ctx.fillRect(finX, fy, 16, 20);
    }

    // 8. Racers
    for (const p of gameState.players) {
      ctx.save();

      // Boost aura
      if (p.boostTimer > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.strokeRect(p.x - 3, p.y - 3, PLAYER_WIDTH + 6, PLAYER_HEIGHT + 6);
        ctx.shadowBlur = 0;
      }

      // Racer Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(
        p.x + PLAYER_WIDTH / 2,
        p.y + PLAYER_HEIGHT + 2,
        PLAYER_WIDTH * 0.6,
        4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Racer Capsule Body
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, PLAYER_WIDTH, PLAYER_HEIGHT, 8);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Visor / Face
      ctx.fillStyle = '#0f172a';
      const eyeX = p.facing === 'right' ? p.x + PLAYER_WIDTH - 8 : p.x + 2;
      ctx.fillRect(eyeX, p.y + 6, 6, 8);

      // Label & Rank
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      const label = p.finished ? `#${p.rank} ${p.name}` : p.name;
      ctx.fillText(label, p.x + PLAYER_WIDTH / 2, p.y - 6);

      ctx.restore();
    }

    ctx.restore();
  }, [gameState]);

  // Touch Virtual Controls
  const handleVirtualLeft = (active: boolean) => {
    if (active) keysDownRef.current.add('a');
    else keysDownRef.current.delete('a');
  };

  const handleVirtualRight = (active: boolean) => {
    if (active) keysDownRef.current.add('d');
    else keysDownRef.current.delete('d');
  };

  const handleVirtualJump = () => {
    keysDownRef.current.add(' ');
    setTimeout(() => {
      keysDownRef.current.delete(' ');
    }, 120);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-3 sm:p-6 text-deck-100">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {/* HUD Top Bar */}
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
                  PLATFORM RACE
                </h1>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                  {mode === 'solo' ? 'SOLO GP' : 'LOCAL 2P'}
                </span>
              </div>
              <p className="text-xs text-deck-400">
                Dash across moving platforms, hit spring pads and speed boosts to cross the finish
                line!
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
              onClick={() => startNewRace(mode)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-deck-700 bg-deck-800 px-3 text-xs font-semibold text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restart
            </button>
          </div>
        </div>

        {/* Mode Selector & Race Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => startNewRace('solo')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'solo'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Solo Grand Prix
            </button>
            <button
              onClick={() => startNewRace('local2p')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'local2p'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Local 2-Player
            </button>
          </div>

          {/* Mini Progress Track */}
          <div className="relative flex h-8 w-full items-center rounded-xl border border-deck-800 bg-deck-950 px-4">
            <div className="absolute left-4 right-4 h-1.5 rounded-full bg-deck-800" />
            <Flag className="absolute right-3 h-4 w-4 text-amber-400" />

            {gameState.players.map((p) => {
              const progressPct = Math.min(
                100,
                Math.max(0, (p.x / gameState.course.finishLineX) * 100),
              );
              return (
                <div
                  key={p.id}
                  className="absolute -translate-x-1/2 flex items-center justify-center transition-all duration-75"
                  style={{ left: `calc(16px + ${progressPct * 0.9}%)` }}
                  title={`${p.name}: ${Math.floor(progressPct)}%`}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-white shadow-md"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border-4 border-deck-800 bg-deck-950 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="aspect-[16/10] max-h-[65vh] w-full max-w-[800px] object-contain"
          />

          {/* Countdown Overlay */}
          {gameState.status === 'countdown' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
              <div className="rounded-2xl border border-cyan-500/40 bg-deck-900/90 px-8 py-4 font-arcade text-3xl font-black text-cyan-400 shadow-2xl animate-pulse">
                {Math.ceil(gameState.countdownSec) > 0 ? Math.ceil(gameState.countdownSec) : 'GO!'}
              </div>
            </div>
          )}

          {/* Finish Line Podium Modal */}
          {gameState.status === 'finished' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-md animate-in fade-in zoom-in-95">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="font-arcade text-2xl font-black tracking-wider text-white">
                RACE COMPLETE!
              </h2>

              <div className="mt-4 flex flex-col gap-2 w-full max-w-sm">
                {gameState.players
                  .slice()
                  .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-deck-800 bg-deck-900/60 p-2.5 text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">#{p.rank ?? '-'}</span>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-white">{p.name}</span>
                        {p.isAi && <Bot className="h-3 w-3 text-deck-400" />}
                      </div>
                      <span className="font-mono text-deck-300">
                        {p.finishTimeSec ? `${p.finishTimeSec.toFixed(2)}s` : 'DNF'}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => startNewRace(mode)}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-arcade text-xs font-bold text-deck-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  RACE AGAIN
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

        {/* Mobile Touch Controls */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-deck-800 bg-deck-900/60 p-4 sm:hidden">
          <div className="flex gap-2">
            <button
              onTouchStart={() => handleVirtualLeft(true)}
              onTouchEnd={() => handleVirtualLeft(false)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-deck-700 bg-deck-800 text-white active:bg-cyan-500 active:text-deck-950"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <button
              onTouchStart={() => handleVirtualRight(true)}
              onTouchEnd={() => handleVirtualRight(false)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-deck-700 bg-deck-800 text-white active:bg-cyan-500 active:text-deck-950"
            >
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>

          <button
            onClick={handleVirtualJump}
            className="flex h-12 px-6 items-center justify-center rounded-xl border border-cyan-500 bg-cyan-600 text-white font-arcade text-xs font-black shadow-lg shadow-cyan-500/20 active:scale-95 active:bg-cyan-400"
          >
            <ArrowUp className="mr-1 h-5 w-5" />
            JUMP
          </button>
        </div>

        {/* Controls Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deck-800 bg-deck-900/40 p-3 text-xs text-deck-400">
          <div>
            <strong className="text-cyan-400">P1:</strong> A / D to steer,{' '}
            <strong className="text-white">SPACE / W</strong> to jump (tap twice for double jump)
          </div>
          {mode === 'local2p' && (
            <div>
              <strong className="text-red-400">P2:</strong> Left / Right to steer,{' '}
              <strong className="text-white">UP / ENTER</strong> to jump
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400">
              <Sparkles className="h-3.5 w-3.5" /> Springs
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="h-3.5 w-3.5" /> Boost Pads
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
