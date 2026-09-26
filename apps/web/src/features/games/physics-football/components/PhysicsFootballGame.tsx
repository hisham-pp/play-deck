'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Pause,
  Play,
  RotateCcw,
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
  createInitialFootballState,
  getFootballBotAction,
  stepFootballGame,
  FootballPlayerAction,
  FootballState,
  GOALPOSTS,
  GOAL_Y_MAX,
  GOAL_Y_MIN,
  PITCH_HEIGHT,
  PITCH_PADDING_X,
  PITCH_PADDING_Y,
  PITCH_WIDTH,
} from '../engine/football-engine';

export function PhysicsFootballGame() {
  const [mode, setMode] = useState<'solo' | 'local2p'>('solo');
  const [gameState, setGameState] = useState<FootballState>(() =>
    createInitialFootballState('You (Blue)', 'StrikerBot (Red)', true),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const keysDownRef = useRef<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound Synthesizer
  const playSound = useCallback(
    (type: 'kick' | 'bounce' | 'post' | 'goal' | 'whistle' | 'win') => {
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

        if (type === 'kick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === 'bounce') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'post') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(240, now + 0.15);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'whistle') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.setValueAtTime(1000, now + 0.08);
          osc.frequency.setValueAtTime(800, now + 0.16);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'goal') {
          // Crowd celebration chord
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
          osc.start(now);
          osc.stop(now + 0.6);
        } else if (type === 'win') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.15);
          osc.frequency.setValueAtTime(783.99, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        }
      } catch {
        // Ignore audio errors if audio autoplay blocked
      }
    },
    [soundEnabled],
  );

  const startNewMatch = useCallback((chosenMode: 'solo' | 'local2p') => {
    setMode(chosenMode);
    if (chosenMode === 'solo') {
      setGameState(createInitialFootballState('You (Blue)', 'StrikerBot (Red)', true));
    } else {
      setGameState(createInitialFootballState('Player 1 (Blue)', 'Player 2 (Red)', false));
    }
    setIsPaused(false);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Physics & Animation Loop
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (!isPaused && gameState.status !== 'game_over') {
        const keys = keysDownRef.current;
        const actions: Record<string, FootballPlayerAction> = {};

        // Blue Player (P1): WASD + Space
        let p1X = 0;
        let p1Y = 0;
        if (keys.has('w')) p1Y -= 1;
        if (keys.has('s')) p1Y += 1;
        if (keys.has('a')) p1X -= 1;
        if (keys.has('d')) p1X += 1;

        // If solo, also accept Arrow Keys for Blue player
        if (mode === 'solo') {
          if (keys.has('arrowup')) p1Y -= 1;
          if (keys.has('arrowdown')) p1Y += 1;
          if (keys.has('arrowleft')) p1X -= 1;
          if (keys.has('arrowright')) p1X += 1;
        }

        actions['p1'] = {
          moveX: p1X,
          moveY: p1Y,
          kick: keys.has(' ') || keys.has('space'),
        };

        // Red Player (P2): Local 2-Player (Arrow Keys + Enter) or AI
        if (mode === 'local2p') {
          let p2X = 0;
          let p2Y = 0;
          if (keys.has('arrowup')) p2Y -= 1;
          if (keys.has('arrowdown')) p2Y += 1;
          if (keys.has('arrowleft')) p2X -= 1;
          if (keys.has('arrowright')) p2X += 1;

          actions['p2'] = {
            moveX: p2X,
            moveY: p2Y,
            kick: keys.has('enter') || keys.has('e'),
          };
        } else {
          // AI Bot
          const bot = gameState.players[1];
          if (bot && bot.isAi) {
            actions[bot.id] = getFootballBotAction(bot, gameState);
          }
        }

        const prevState = gameState;
        const nextState = stepFootballGame(gameState, actions, dt);

        // Audio Triggers
        if (nextState.status === 'goal_scored' && prevState.status === 'playing') {
          playSound('goal');
        }
        if (nextState.status === 'playing' && prevState.status === 'kickoff') {
          playSound('whistle');
        }
        if (nextState.status === 'game_over' && prevState.status !== 'game_over') {
          playSound('win');
        }

        // Detect kick impulse on ball
        const prevBallSpeed = Math.hypot(prevState.ball.vx, prevState.ball.vy);
        const currBallSpeed = Math.hypot(nextState.ball.vx, nextState.ball.vy);
        if (currBallSpeed > 350 && prevBallSpeed < 200) {
          playSound('kick');
        }

        setGameState(nextState);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, isPaused, mode, playSound]);

  // Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);

    // 1. Turf Field Background with Stripes
    const stripeCount = 10;
    const stripeW = PITCH_WIDTH / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#064e3b' : '#047857';
      ctx.fillRect(i * stripeW, 0, stripeW, PITCH_HEIGHT);
    }

    // 2. Goal Nets Behind Goalmouth
    // Left Goal Net
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(PITCH_PADDING_X - 50, GOAL_Y_MIN, 50, GOAL_Y_MAX - GOAL_Y_MIN);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let gx = PITCH_PADDING_X - 50; gx <= PITCH_PADDING_X; gx += 10) {
      ctx.beginPath();
      ctx.moveTo(gx, GOAL_Y_MIN);
      ctx.lineTo(gx, GOAL_Y_MAX);
      ctx.stroke();
    }
    for (let gy = GOAL_Y_MIN; gy <= GOAL_Y_MAX; gy += 10) {
      ctx.beginPath();
      ctx.moveTo(PITCH_PADDING_X - 50, gy);
      ctx.lineTo(PITCH_PADDING_X, gy);
      ctx.stroke();
    }

    // Right Goal Net
    ctx.fillRect(PITCH_WIDTH - PITCH_PADDING_X, GOAL_Y_MIN, 50, GOAL_Y_MAX - GOAL_Y_MIN);
    for (
      let gx = PITCH_WIDTH - PITCH_PADDING_X;
      gx <= PITCH_WIDTH - PITCH_PADDING_X + 50;
      gx += 10
    ) {
      ctx.beginPath();
      ctx.moveTo(gx, GOAL_Y_MIN);
      ctx.lineTo(gx, GOAL_Y_MAX);
      ctx.stroke();
    }
    for (let gy = GOAL_Y_MIN; gy <= GOAL_Y_MAX; gy += 10) {
      ctx.beginPath();
      ctx.moveTo(PITCH_WIDTH - PITCH_PADDING_X, gy);
      ctx.lineTo(PITCH_WIDTH - PITCH_PADDING_X + 50, gy);
      ctx.stroke();
    }

    // 3. Pitch Lines (White markings)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;

    // Pitch Perimeter Boundary
    ctx.strokeRect(
      PITCH_PADDING_X,
      PITCH_PADDING_Y,
      PITCH_WIDTH - PITCH_PADDING_X * 2,
      PITCH_HEIGHT - PITCH_PADDING_Y * 2,
    );

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(PITCH_WIDTH * 0.5, PITCH_PADDING_Y);
    ctx.lineTo(PITCH_WIDTH * 0.5, PITCH_HEIGHT - PITCH_PADDING_Y);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH * 0.5, PITCH_HEIGHT * 0.5, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Center Spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(PITCH_WIDTH * 0.5, PITCH_HEIGHT * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Left Penalty Box
    ctx.strokeRect(PITCH_PADDING_X, 140, 110, 220);
    // Right Penalty Box
    ctx.strokeRect(PITCH_WIDTH - PITCH_PADDING_X - 110, 140, 110, 220);

    // Goalposts (4 posts)
    for (const post of GOALPOSTS) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(post.x, post.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Players
    for (const player of gameState.players) {
      const isBlue = player.team === 'blue';
      const mainColor = isBlue ? '#3b82f6' : '#ef4444';
      const shadowColor = isBlue ? '#1d4ed8' : '#b91c1c';

      ctx.save();

      // Kick ring expansion effect
      if (player.isKicking) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(
        player.x,
        player.y + player.radius * 0.75,
        player.radius,
        player.radius * 0.45,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Player circle
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Inner ring
      ctx.strokeStyle = shadowColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Direction pointer
      const spd = Math.hypot(player.vx, player.vy);
      if (spd > 10) {
        const dirX = player.vx / spd;
        const dirY = player.vy / spd;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
          player.x + dirX * (player.radius * 0.5),
          player.y + dirY * (player.radius * 0.5),
          4,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.x, player.y - player.radius - 6);

      ctx.restore();
    }

    // 5. Ball
    const ball = gameState.ball;
    ctx.save();

    // Ball speed trail
    const ballSpeed = Math.hypot(ball.vx, ball.vy);
    if (ballSpeed > 300) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = ball.radius * 1.6;
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.x - (ball.vx / ballSpeed) * 35, ball.y - (ball.vy / ballSpeed) * 35);
      ctx.stroke();
    }

    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(
      ball.x,
      ball.y + ball.radius * 0.6,
      ball.radius * 1.1,
      ball.radius * 0.5,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Soccer Ball Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Pentagonal patches
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, [gameState]);

  // Touch Controls
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

  const handleVirtualKick = () => {
    keysDownRef.current.add(' ');
    setTimeout(() => {
      keysDownRef.current.delete(' ');
    }, 150);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-3 sm:p-6 text-deck-100">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {/* HUD Bar */}
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
                  PHYSICS FOOTBALL
                </h1>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {mode === 'solo' ? 'SOLO VS BOT' : 'LOCAL 2P'}
                </span>
              </div>
              <p className="text-xs text-deck-400">
                2D arcade soccer with momentum physics, impulse kicks, and goalpost rebounds.
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

        {/* Mode Selector & Scoreboard */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => startNewMatch('solo')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'solo'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Solo vs AI
            </button>
            <button
              onClick={() => startNewMatch('local2p')}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                mode === 'local2p'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Local 2-Player
            </button>
          </div>

          {/* Live Scoreboard */}
          <div className="flex items-center justify-center gap-6 rounded-xl border border-deck-800 bg-deck-950/80 px-6 py-2 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="font-arcade text-xs font-bold text-blue-400">BLUE</span>
              <span className="font-arcade text-2xl font-black text-white">
                {gameState.blueScore}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-mono text-sm font-bold text-amber-400">
                {Math.ceil(gameState.timeRemainingSec)}s
              </span>
              <span className="text-[10px] text-deck-500">First to {gameState.targetScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-arcade text-2xl font-black text-white">
                {gameState.redScore}
              </span>
              <span className="font-arcade text-xs font-bold text-red-400">RED</span>
            </div>
          </div>
        </div>

        {/* Main Pitch Viewport */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border-4 border-deck-800 bg-deck-950 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={PITCH_WIDTH}
            height={PITCH_HEIGHT}
            className="aspect-[16/10] max-h-[65vh] w-full max-w-[800px] object-contain"
          />

          {/* Kickoff Overlay */}
          {gameState.status === 'kickoff' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="rounded-xl border border-deck-700 bg-deck-900/90 px-6 py-3 font-arcade text-xl font-black text-amber-400 shadow-xl">
                KICKOFF IN {Math.ceil(gameState.stateTimerSec)}
              </div>
            </div>
          )}

          {/* Goal Scored Celebration */}
          {gameState.status === 'goal_scored' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-90">
              <div className="rounded-2xl border-2 border-amber-400 bg-deck-900/95 px-8 py-4 text-center shadow-2xl">
                <span className="font-arcade text-3xl font-black tracking-wider text-amber-400 sm:text-4xl animate-bounce">
                  GOAL!
                </span>
                <p className="mt-1 font-arcade text-sm font-bold text-white">
                  {gameState.lastScorer === 'blue' ? 'BLUE TEAM SCORES!' : 'RED TEAM SCORES!'}
                </p>
              </div>
            </div>
          )}

          {/* Full-Time / Game Over Modal */}
          {gameState.status === 'game_over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-md animate-in fade-in zoom-in-95">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="font-arcade text-2xl font-black tracking-wider text-white">
                {gameState.winnerTeam === 'blue'
                  ? 'BLUE TEAM WINS!'
                  : gameState.winnerTeam === 'red'
                    ? 'RED TEAM WINS!'
                    : 'DRAW MATCH!'}
              </h2>
              <p className="mt-1 text-sm text-deck-300">
                Final Score: Blue {gameState.blueScore} – {gameState.redScore} Red
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => startNewMatch(mode)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-arcade text-xs font-bold text-deck-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  REMATCH
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

        {/* Mobile On-Screen Controls */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-deck-800 bg-deck-900/60 p-4 sm:hidden">
          <div className="flex items-center justify-between w-full">
            {/* D-Pad */}
            <div className="grid grid-cols-3 gap-1 w-32">
              <div />
              <button
                onTouchStart={() => handleVirtualDirection('up')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />

              <button
                onTouchStart={() => handleVirtualDirection('left')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex h-10 items-center justify-center rounded-lg bg-deck-900 border border-deck-800" />
              <button
                onTouchStart={() => handleVirtualDirection('right')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
              >
                <ArrowRight className="h-5 w-5" />
              </button>

              <div />
              <button
                onTouchStart={() => handleVirtualDirection('down')}
                onTouchEnd={() => handleVirtualDirection('stop')}
                className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              <div />
            </div>

            {/* Kick Button */}
            <button
              onClick={handleVirtualKick}
              className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/30 active:scale-95 active:bg-emerald-500"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-arcade text-[10px] font-black">KICK</span>
            </button>
          </div>
        </div>

        {/* Controls Guide Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deck-800 bg-deck-900/40 p-3 text-xs text-deck-400">
          <div>
            <strong className="text-blue-400">Blue (P1):</strong> WASD to steer,{' '}
            <strong className="text-white">SPACE</strong> to strike
          </div>
          {mode === 'local2p' ? (
            <div>
              <strong className="text-red-400">Red (P2):</strong> Arrow Keys to steer,{' '}
              <strong className="text-white">ENTER</strong> to strike
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-deck-400">
              <Bot className="h-3.5 w-3.5" />
              <span>Red StrikerBot is AI-controlled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
