'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Globe,
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
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
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
import {
  type FootballSnapshotPayload,
  useFootballMultiplayer,
} from '../hooks/use-football-multiplayer';

export type FootballMode = 'solo' | 'local2p' | 'online';

export function PhysicsFootballGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { roomCode, role, opponent, leaveRoom } = useMultiplayerStore();

  const [seatedOnMount] = useState(() => Boolean(useMultiplayerStore.getState().roomCode));
  const [mode, setMode] = useState<FootballMode>(() => (seatedOnMount ? 'online' : 'solo'));
  const [gameState, setGameState] = useState<FootballState>(() =>
    createInitialFootballState(
      seatedOnMount ? 'Host (Blue)' : 'You (Blue)',
      seatedOnMount ? 'Challenger (Red)' : 'StrikerBot (Red)',
      !seatedOnMount,
    ),
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

  const startNewMatch = useCallback(
    (chosenMode: FootballMode) => {
      if (chosenMode !== 'online' && roomCode) {
        leaveRoom();
      }
      setMode(chosenMode);
      if (chosenMode === 'solo') {
        setGameState(createInitialFootballState('You (Blue)', 'StrikerBot (Red)', true));
      } else if (chosenMode === 'local2p') {
        setGameState(createInitialFootballState('Player 1 (Blue)', 'Player 2 (Red)', false));
      } else {
        setGameState(createInitialFootballState('Host (Blue)', 'Challenger (Red)', false));
      }
      setIsPaused(false);
    },
    [roomCode, leaveRoom],
  );

  // Track remote guest action on host
  const remoteGuestActionRef = useRef<FootballPlayerAction>({ moveX: 0, moveY: 0, kick: false });

  const handleRemoteAction = useCallback((action: FootballPlayerAction) => {
    remoteGuestActionRef.current = action;
  }, []);

  const handleSnapshotReceived = useCallback(
    (snapshot: FootballSnapshotPayload) => {
      setGameState((prev) => {
        if (snapshot.status === 'goal_scored' && prev.status === 'playing') {
          playSound('goal');
        }
        if (snapshot.status === 'playing' && prev.status === 'kickoff') {
          playSound('whistle');
        }
        if (snapshot.status === 'game_over' && prev.status !== 'game_over') {
          playSound('win');
        }
        const prevBallSpeed = Math.hypot(prev.ball.vx, prev.ball.vy);
        const currBallSpeed = Math.hypot(snapshot.ball.vx, snapshot.ball.vy);
        if (currBallSpeed > 350 && prevBallSpeed < 200) {
          playSound('kick');
        }
        return snapshot;
      });
    },
    [playSound],
  );

  const handleRequestRestart = useCallback(() => {
    startNewMatch('online');
  }, [startNewMatch]);

  const { sendAction, requestRestart, hasOpponent } = useFootballMultiplayer(
    mode === 'online',
    gameState,
    {
      onRemoteAction: handleRemoteAction,
      onSnapshotReceived: handleSnapshotReceived,
      onRequestRestart: handleRequestRestart,
    },
  );

  // Record stats on match end
  const gameOverHandledRef = useRef(false);
  useEffect(() => {
    if (gameState.status === 'game_over' && !gameOverHandledRef.current) {
      gameOverHandledRef.current = true;
      const isOnlineMatch = mode === 'online' && Boolean(roomCode);
      const won = isOnlineMatch
        ? role === 'host'
          ? gameState.winnerTeam === 'blue'
          : gameState.winnerTeam === 'red'
        : gameState.winnerTeam === 'blue';
      recordGamePlayed(won, 'arcade');
    } else if (gameState.status !== 'game_over') {
      gameOverHandledRef.current = false;
    }
  }, [gameState.status, gameState.winnerTeam, mode, roomCode, role, recordGamePlayed]);

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
  const isOnline = mode === 'online' && Boolean(roomCode);
  const isGuest = isOnline && role === 'guest';
  const isHost = isOnline && role === 'host';

  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const keys = keysDownRef.current;

      // Guest sends local action to host and lets host simulate physics
      if (isGuest) {
        let p2X = 0;
        let p2Y = 0;
        if (keys.has('arrowup') || keys.has('w')) p2Y -= 1;
        if (keys.has('arrowdown') || keys.has('s')) p2Y += 1;
        if (keys.has('arrowleft') || keys.has('a')) p2X -= 1;
        if (keys.has('arrowright') || keys.has('d')) p2X += 1;
        const kick = keys.has('enter') || keys.has('e') || keys.has(' ') || keys.has('space');

        sendAction({ moveX: p2X, moveY: p2Y, kick });
        animId = requestAnimationFrame(loop);
        return;
      }

      if (!isPaused && gameState.status !== 'game_over') {
        const actions: Record<string, FootballPlayerAction> = {};

        // Blue Player (P1): WASD + Space
        let p1X = 0;
        let p1Y = 0;
        if (keys.has('w')) p1Y -= 1;
        if (keys.has('s')) p1Y += 1;
        if (keys.has('a')) p1X -= 1;
        if (keys.has('d')) p1X += 1;

        // In solo or online host, also accept Arrow Keys for Blue player
        if (mode === 'solo' || isHost) {
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

        // Red Player (P2): Online Remote, Local 2-Player (Arrow Keys + Enter), or AI
        if (isHost) {
          actions['p2'] = remoteGuestActionRef.current;
        } else if (mode === 'local2p') {
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
  }, [gameState, isPaused, mode, isGuest, isHost, sendAction, playSound]);

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
      ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#16a34a';
      ctx.fillRect(i * stripeW, 0, stripeW, PITCH_HEIGHT);
    }

    // Outer pitch border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      PITCH_PADDING_X,
      PITCH_PADDING_Y,
      PITCH_WIDTH - PITCH_PADDING_X * 2,
      PITCH_HEIGHT - PITCH_PADDING_Y * 2,
    );

    // Center Line & Center Circle
    const midX = PITCH_WIDTH / 2;
    const midY = PITCH_HEIGHT / 2;

    ctx.beginPath();
    ctx.moveTo(midX, PITCH_PADDING_Y);
    ctx.lineTo(midX, PITCH_HEIGHT - PITCH_PADDING_Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(midX, midY, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, midY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Goal Areas & Penalty Boxes
    // Blue side (Left)
    ctx.strokeRect(PITCH_PADDING_X, midY - 90, 110, 180);
    // Red side (Right)
    ctx.strokeRect(PITCH_WIDTH - PITCH_PADDING_X - 110, midY - 90, 110, 180);

    // Goalmouth Nets
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    // Left net
    ctx.fillRect(
      PITCH_PADDING_X - 45,
      GOAL_Y_MIN,
      45,
      GOAL_Y_MAX - GOAL_Y_MIN,
    );
    ctx.strokeRect(
      PITCH_PADDING_X - 45,
      GOAL_Y_MIN,
      45,
      GOAL_Y_MAX - GOAL_Y_MIN,
    );
    // Right net
    ctx.fillRect(
      PITCH_WIDTH - PITCH_PADDING_X,
      GOAL_Y_MIN,
      45,
      GOAL_Y_MAX - GOAL_Y_MIN,
    );
    ctx.strokeRect(
      PITCH_WIDTH - PITCH_PADDING_X,
      GOAL_Y_MIN,
      45,
      GOAL_Y_MAX - GOAL_Y_MIN,
    );

    // Goalposts (4 corner posts)
    GOALPOSTS.forEach((post) => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(post.x, post.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 2. Render Players
    gameState.players.forEach((p) => {
      ctx.save();

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + p.radius * 0.7, p.radius * 1.1, p.radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Kick Aura when kicking
      if (p.isKicking) {
        ctx.strokeStyle = p.team === 'blue' ? '#38bdf8' : '#f87171';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player Body Disc
      const gradient = ctx.createRadialGradient(
        p.x - p.radius * 0.3,
        p.y - p.radius * 0.3,
        2,
        p.x,
        p.y,
        p.radius,
      );

      if (p.team === 'blue') {
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, '#1d4ed8');
      } else {
        gradient.addColorStop(0, '#f87171');
        gradient.addColorStop(1, '#b91c1c');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Team Ring / Core Indicator
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Jersey number or Bot tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.team === 'blue' ? '10' : p.isAi ? 'AI' : '9', p.x, p.y - p.radius - 12);

      ctx.restore();
    });

    // 3. Render Ball
    const ball = gameState.ball;
    ctx.save();

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

  const handleRematch = () => {
    if (isGuest) {
      requestRestart();
    } else {
      startNewMatch(mode);
    }
  };

  const blueLabel = isOnline
    ? isHost
      ? `${player?.displayName || 'Host'} (You)`
      : opponent?.displayName || 'Host'
    : 'BLUE';

  const redLabel = isOnline
    ? isGuest
      ? `${player?.displayName || 'Guest'} (You)`
      : opponent?.displayName || 'Challenger'
    : mode === 'solo'
      ? 'BOT'
      : 'RED';

  return (
    <div className="flex w-full flex-col items-center justify-center p-3 sm:p-6 text-deck-100">
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {/* HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deck-800 bg-deck-900/90 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link
              href="/games"
              onClick={() => {
                if (roomCode) leaveRoom();
              }}
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
                  {mode === 'solo' ? 'SOLO VS BOT' : mode === 'local2p' ? 'LOCAL 2P' : 'ONLINE 1V1'}
                </span>
              </div>
              <p className="text-xs text-deck-400">
                2D arcade soccer with momentum physics, impulse kicks, and goalpost rebounds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-deck-300 transition-colors hover:bg-deck-700 cursor-pointer"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-deck-300 transition-colors hover:bg-deck-700 cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={handleRematch}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-deck-700 bg-deck-800 px-3 text-xs font-semibold text-deck-200 transition-colors hover:bg-deck-700 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Online Room Setup Card */}
        {mode === 'online' && !roomCode ? (
          <OnlineRoomSetupCard
            title="Physics Football Online 1v1"
            gameName="Physics Football"
            subtitle="Host a match or enter a 6-digit code to challenge a friend."
            description="Real-time arcade soccer duel with momentum physics, ricochet goalposts, and live voice chat."
            onBack={() => startNewMatch('solo')}
          />
        ) : (
          <>
            {/* Live WebRTC Voice Chat Dock */}
            {mode === 'online' && roomCode && <RoomVoiceDock defaultOpen={false} />}

            {/* Mode Selector & Scoreboard */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startNewMatch('solo')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    mode === 'solo'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Solo vs AI
                </button>
                <button
                  type="button"
                  onClick={() => startNewMatch('local2p')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    mode === 'local2p'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Local 2-Player
                </button>
                <button
                  type="button"
                  onClick={() => startNewMatch('online')}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    mode === 'online'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-deck-800 bg-deck-900/50 text-deck-400 hover:bg-deck-800'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Online 1v1
                </button>
              </div>

              {/* Live Scoreboard */}
              <div className="flex items-center justify-center gap-6 rounded-xl border border-deck-800 bg-deck-950/80 px-6 py-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="font-arcade text-xs font-bold text-blue-400">{blueLabel}</span>
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
                  <span className="font-arcade text-xs font-bold text-red-400">{redLabel}</span>
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

              {/* Online Waiting for Opponent Overlay */}
              {mode === 'online' && !hasOpponent && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="rounded-2xl border border-amber-500/40 bg-deck-900/95 px-6 py-4 text-center font-arcade shadow-2xl">
                    <span className="text-sm font-bold text-amber-400 block mb-1">
                      WAITING FOR OPPONENT
                    </span>
                    <span className="font-mono text-xs text-deck-300">
                      Share Room Code:{' '}
                      <strong className="text-amber-300 font-bold tracking-widest">
                        {roomCode}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

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
                      {gameState.lastScorer === 'blue'
                        ? `${blueLabel} SCORES!`
                        : `${redLabel} SCORES!`}
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
                      ? `${blueLabel} WINS!`
                      : gameState.winnerTeam === 'red'
                        ? `${redLabel} WINS!`
                        : 'DRAW MATCH!'}
                  </h2>
                  <p className="mt-1 text-sm text-deck-300">
                    Final Score: Blue {gameState.blueScore} – {gameState.redScore} Red
                  </p>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleRematch}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-arcade text-xs font-bold text-deck-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      REMATCH
                    </button>
                    <Link
                      href="/games"
                      onClick={() => {
                        if (roomCode) leaveRoom();
                      }}
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
                    type="button"
                    onTouchStart={() => handleVirtualDirection('up')}
                    onTouchEnd={() => handleVirtualDirection('stop')}
                    className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onTouchStart={() => handleVirtualDirection('left')}
                    onTouchEnd={() => handleVirtualDirection('stop')}
                    className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-10 items-center justify-center rounded-lg bg-deck-900 border border-deck-800" />
                  <button
                    type="button"
                    onTouchStart={() => handleVirtualDirection('right')}
                    onTouchEnd={() => handleVirtualDirection('stop')}
                    className="flex h-10 items-center justify-center rounded-lg border border-deck-700 bg-deck-800 text-white active:bg-emerald-500 active:text-deck-950"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div />
                  <button
                    type="button"
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
                  type="button"
                  onClick={handleVirtualKick}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border-2 border-emerald-400 bg-emerald-600/90 text-white shadow-lg shadow-emerald-600/30 active:scale-95 active:bg-emerald-500 cursor-pointer"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="font-arcade text-[10px] font-black">KICK</span>
                </button>
              </div>
            </div>

            {/* Controls Guide Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deck-800 bg-deck-900/40 p-3 text-xs text-deck-400">
              {mode === 'online' ? (
                <div>
                  <strong className={isHost ? 'text-blue-400' : 'text-red-400'}>
                    {isHost ? 'You (Blue):' : 'You (Red):'}
                  </strong>{' '}
                  WASD or Arrow Keys to steer,{' '}
                  <strong className="text-white">SPACE or ENTER</strong> to strike
                </div>
              ) : (
                <div>
                  <strong className="text-blue-400">Blue (P1):</strong> WASD to steer,{' '}
                  <strong className="text-white">SPACE</strong> to strike
                </div>
              )}
              {mode === 'online' ? (
                <div className="flex items-center gap-1.5 text-deck-400">
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Online Low-Latency Netcode + Voice</span>
                </div>
              ) : mode === 'local2p' ? (
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
          </>
        )}
      </div>
    </div>
  );
}
