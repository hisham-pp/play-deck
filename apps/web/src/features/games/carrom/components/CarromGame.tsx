'use client';

import {
  Bot,
  Crown,
  Globe,
  HelpCircle,
  RotateCcw,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OnlineRoomSetupCard } from '@/features/multiplayer/components/OnlineRoomSetupCard';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import {
  areAllPiecesStopped,
  calculateBotShot,
  createCarromGame,
  resolveTurn,
  setStrikerAim,
  setStrikerPosition,
  shootStriker,
  stepPhysics,
  type CarromBotDifficulty,
  type CarromGameMode,
  type CarromPocketEvent,
  type CarromSetupType,
  type CarromState,
} from '../engine/carrom-engine';
import {
  type CarromAimPayload,
  type CarromShotPayload,
  type CarromSyncPayload,
  useCarromMultiplayer,
} from '../hooks/use-carrom-multiplayer';
import { renderCarromBoard } from './carrom-renderer';

export function CarromGame() {
  const { player, recordGamePlayed } = usePlayerStore();
  const { roomCode, role, opponent, leaveRoom } = useMultiplayerStore();

  const [seatedOnMount] = useState(() => Boolean(useMultiplayerStore.getState().roomCode));
  const [mode, setMode] = useState<CarromGameMode>(() => (seatedOnMount ? 'online' : 'vs-ai'));
  const [setupType, setSetupType] = useState<CarromSetupType>('classic');
  const [botDifficulty, setBotDifficulty] = useState<CarromBotDifficulty>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const [gameState, setGameState] = useState<CarromState>(() =>
    createCarromGame({
      mode: seatedOnMount ? 'online' : 'vs-ai',
      setupType: 'classic',
      botDifficulty: 'medium',
    }),
  );

  const [aimAngleDeg, setAimAngleDeg] = useState(90); // 90° = up towards board center for P1
  const [aimPower, setAimPower] = useState(60);
  const [strikerBaselineX, setStrikerBaselineX] = useState(400);

  const [turnToast, setTurnToast] = useState<{
    text: string;
    type: 'info' | 'success' | 'foul';
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stateRef = useRef<CarromState>(gameState);
  stateRef.current = gameState;

  const accumulatedPocketsRef = useRef<CarromPocketEvent[]>([]);
  const isDraggingStrikerRef = useRef(false);
  const isAimDraggingRef = useRef(false);
  const botThinkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synthesizer via Web Audio API
  const playSound = useCallback(
    (
      type: 'strike' | 'clack' | 'cushion' | 'pocket' | 'foul' | 'queen' | 'win',
      intensity = 0.6,
    ) => {
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
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'strike') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
          gain.gain.setValueAtTime(0.5 * intensity, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'clack') {
          osc.type = 'sine';
          const baseFreq = 480 + Math.random() * 80;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);
          gain.gain.setValueAtTime(0.4 * intensity, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
        } else if (type === 'pocket') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
          gain.gain.setValueAtTime(0.6 * intensity, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (type === 'foul') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.setValueAtTime(110, now + 0.12);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'queen') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'win') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.15);
          osc.frequency.setValueAtTime(783.99, now + 0.3);
          osc.frequency.setValueAtTime(1046.5, now + 0.45);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
          osc.start(now);
          osc.stop(now + 0.7);
        }
      } catch {
        // Ignore audio playback exceptions if autoplay policy blocked
      }
    },
    [soundEnabled],
  );

  // Online role calculations
  const isOnline = mode === 'online' && Boolean(roomCode);
  const isHost = isOnline && role === 'host';
  const isGuest = isOnline && role === 'guest';
  const isMyTurn =
    !isOnline ||
    (isHost && gameState.activePlayer === 'player1') ||
    (isGuest && gameState.activePlayer === 'player2');

  const handleRestart = useCallback(
    (
      newMode: CarromGameMode = mode,
      newSetup: CarromSetupType = setupType,
      newDiff: CarromBotDifficulty = botDifficulty,
    ) => {
      if (newMode !== 'online' && roomCode) {
        leaveRoom();
      }
      if (botThinkingTimeoutRef.current) {
        clearTimeout(botThinkingTimeoutRef.current);
      }
      accumulatedPocketsRef.current = [];
      const freshState = createCarromGame({
        mode: newMode,
        setupType: newSetup,
        botDifficulty: newDiff,
      });
      setGameState(freshState);
      setStrikerBaselineX(400);
      setAimAngleDeg(90);
      setAimPower(60);
      setTurnToast({ text: 'Match started! White plays first.', type: 'info' });
    },
    [mode, setupType, botDifficulty, roomCode, leaveRoom],
  );

  // Multiplayer Hook Handlers
  const handleRemoteAim = useCallback((payload: CarromAimPayload) => {
    setStrikerBaselineX(payload.strikerX);
    setAimAngleDeg(payload.angleDeg);
    setAimPower(payload.power);
    const state = stateRef.current;
    setStrikerPosition(state, payload.strikerX);
    const angleRad =
      state.activePlayer === 'player1'
        ? (-payload.angleDeg * Math.PI) / 180
        : (payload.angleDeg * Math.PI) / 180;
    setStrikerAim(state, angleRad, payload.power);
  }, []);

  const handleRemoteShot = useCallback(
    (payload: CarromShotPayload) => {
      const state = stateRef.current;
      setStrikerPosition(state, payload.strikerX);
      const angleRad =
        state.activePlayer === 'player1'
          ? (-payload.angleDeg * Math.PI) / 180
          : (payload.angleDeg * Math.PI) / 180;
      setStrikerAim(state, angleRad, payload.power);
      shootStriker(state);
      playSound('strike', payload.power / 100);
      setGameState({ ...state });
    },
    [playSound],
  );

  const handleRemoteSync = useCallback((payload: CarromSyncPayload) => {
    const state = stateRef.current;
    state.coins = payload.coins;
    state.striker = payload.striker;
    state.activePlayer = payload.activePlayer;
    state.phase = payload.phase;
    state.coinsPocketedCount = payload.coinsPocketedCount;
    state.queenState = payload.queenState;
    state.winner = payload.winner;
    if (payload.message) {
      setTurnToast({ text: payload.message, type: 'info' });
    }
    setStrikerBaselineX(state.striker.x);
    setGameState({ ...state });
  }, []);

  const handleRequestRestart = useCallback(
    (newSetup: CarromSetupType) => {
      handleRestart('online', newSetup, botDifficulty);
    },
    [handleRestart, botDifficulty],
  );

  const { sendAim, sendShot, sendSync, requestRestart, hasOpponent } = useCarromMultiplayer(
    mode === 'online',
    {
      onRemoteAim: handleRemoteAim,
      onRemoteShot: handleRemoteShot,
      onRemoteSync: handleRemoteSync,
      onRequestRestart: handleRequestRestart,
    },
  );

  // Execute human or bot shot
  const triggerShot = useCallback(() => {
    const state = stateRef.current;
    if (state.phase !== 'positioning' && state.phase !== 'aiming') return;
    if (mode === 'online' && (!isMyTurn || !hasOpponent)) return;

    const angleRad =
      state.activePlayer === 'player1'
        ? (-aimAngleDeg * Math.PI) / 180
        : (aimAngleDeg * Math.PI) / 180;

    setStrikerAim(state, angleRad, aimPower);
    shootStriker(state);
    playSound('strike', aimPower / 100);

    if (mode === 'online') {
      sendShot({
        strikerX: state.striker.x,
        angleDeg: aimAngleDeg,
        power: aimPower,
      });
    }

    setGameState({ ...state });
  }, [aimAngleDeg, aimPower, mode, isMyTurn, hasOpponent, sendShot, playSound]);

  // Striker baseline slider change
  const handleBaselineChange = (newX: number) => {
    const state = stateRef.current;
    if (state.phase !== 'positioning' && state.phase !== 'aiming') return;
    if (mode === 'online' && (!isMyTurn || !hasOpponent)) return;

    const ok = setStrikerPosition(state, newX);
    if (ok) {
      setStrikerBaselineX(newX);
      if (mode === 'online') {
        sendAim({
          strikerX: newX,
          angleDeg: aimAngleDeg,
          power: aimPower,
        });
      }
      setGameState({ ...state });
    }
  };

  // Bot automation turn handler
  useEffect(() => {
    const state = gameState;
    if (mode === 'vs-ai' && state.activePlayer === 'player2' && state.phase === 'positioning') {
      botThinkingTimeoutRef.current = setTimeout(() => {
        const shot = calculateBotShot(state);
        setStrikerPosition(state, shot.strikerX);
        setStrikerAim(state, shot.angle, shot.power);
        shootStriker(state);
        playSound('strike', shot.power / 100);
        setGameState({ ...state });
      }, 1000);
    }

    return () => {
      if (botThinkingTimeoutRef.current) {
        clearTimeout(botThinkingTimeoutRef.current);
      }
    };
  }, [gameState, mode, playSound]);

  // Main 60fps simulation and render loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.04, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const state = stateRef.current;

      // 1. Physics Step when in simulating phase
      if (state.phase === 'simulating') {
        const { collisions, pockets } = stepPhysics(state, dt);

        if (collisions.length > 0) {
          const maxIntensity = Math.max(...collisions.map((c) => c.intensity));
          playSound('clack', maxIntensity);
        }

        if (pockets.length > 0) {
          accumulatedPocketsRef.current.push(...pockets);
          playSound('pocket', 0.8);
        }

        // Check if all pieces came to rest
        if (areAllPiecesStopped(state)) {
          const result = resolveTurn(state, accumulatedPocketsRef.current);
          accumulatedPocketsRef.current = [];

          if (result.strikerFoul) {
            playSound('foul', 0.8);
            setTurnToast({ text: result.message, type: 'foul' });
          } else if (result.queenCovered) {
            playSound('queen', 0.9);
            setTurnToast({ text: result.message, type: 'success' });
          } else if (result.extraTurn) {
            setTurnToast({ text: result.message, type: 'success' });
          } else {
            setTurnToast({ text: result.message, type: 'info' });
          }

          if (state.winner) {
            playSound('win', 1.0);
            const isOnlineMatch = mode === 'online' && Boolean(roomCode);
            const won = isOnlineMatch
              ? role === 'host'
                ? state.winner === 'player1'
                : state.winner === 'player2'
              : state.winner === 'player1';
            recordGamePlayed(won, 'board');
          }

          setStrikerBaselineX(state.striker.x);
          setGameState({ ...state });

          // Host sends authoritative sync to guest
          if (mode === 'online' && role === 'host') {
            sendSync({
              coins: state.coins,
              striker: state.striker,
              activePlayer: state.activePlayer,
              phase: state.phase,
              coinsPocketedCount: state.coinsPocketedCount,
              queenState: state.queenState,
              winner: state.winner,
              message: result.message,
            });
          }
        }
      }

      // 2. Render Board on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCarromBoard(ctx, state, aimAngleDeg, aimPower);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [aimAngleDeg, aimPower, mode, role, roomCode, sendSync, recordGamePlayed, playSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (mode === 'online' && (!isMyTurn || !hasOpponent)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        triggerShot();
      } else if (e.code === 'ArrowLeft') {
        handleBaselineChange(strikerBaselineX - 15);
      } else if (e.code === 'ArrowRight') {
        handleBaselineChange(strikerBaselineX + 15);
      } else if (e.code === 'KeyA') {
        setAimAngleDeg((prev) => Math.min(160, prev + 5));
      } else if (e.code === 'KeyD') {
        setAimAngleDeg((prev) => Math.max(20, prev - 5));
      } else if (e.code === 'KeyW') {
        setAimPower((prev) => Math.min(100, prev + 5));
      } else if (e.code === 'KeyS') {
        setAimPower((prev) => Math.max(10, prev - 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [strikerBaselineX, triggerShot, mode, isMyTurn, hasOpponent]);

  // Mouse / Touch Aim Interaction on Canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.phase !== 'positioning' && state.phase !== 'aiming') return;
    if (mode === 'online' && (!isMyTurn || !hasOpponent)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 800 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    const distToStriker = Math.hypot(clickX - state.striker.x, clickY - state.striker.y);
    if (distToStriker <= state.striker.radius * 1.8) {
      isDraggingStrikerRef.current = true;
      return;
    }

    isAimDraggingRef.current = true;
    updateAimFromPointer(clickX, clickY);
  };

  const updateAimFromPointer = (clickX: number, clickY: number) => {
    const state = stateRef.current;
    const dx = clickX - state.striker.x;
    const dy = clickY - state.striker.y;

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;

    if (state.activePlayer === 'player1') {
      deg = -deg;
    }

    deg = Math.max(15, Math.min(165, deg));
    setAimAngleDeg(deg);

    if (mode === 'online') {
      sendAim({
        strikerX: state.striker.x,
        angleDeg: deg,
        power: aimPower,
      });
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 800 / rect.width;
    const clickX = (e.clientX - rect.left) * scale;
    const clickY = (e.clientY - rect.top) * scale;

    if (isDraggingStrikerRef.current) {
      handleBaselineChange(clickX);
    } else if (isAimDraggingRef.current) {
      updateAimFromPointer(clickX, clickY);
    }
  };

  const handleCanvasPointerUp = () => {
    isDraggingStrikerRef.current = false;
    isAimDraggingRef.current = false;
  };

  const handleRematch = () => {
    if (isGuest) {
      requestRestart(setupType);
    } else {
      handleRestart(mode, setupType, botDifficulty);
    }
  };

  const p1Name = isOnline
    ? isHost
      ? `${player?.displayName || 'Host'} (You)`
      : opponent?.displayName || 'Host'
    : 'Player 1 (White)';

  const p2Name = isOnline
    ? isGuest
      ? `${player?.displayName || 'Guest'} (You)`
      : opponent?.displayName || 'Challenger'
    : mode === 'vs-ai'
      ? `Bot (${botDifficulty})`
      : 'Player 2 (Black)';

  return (
    <div className="flex w-full flex-col items-center justify-center p-3 text-slate-100 sm:p-6 select-none">
      {/* Top Header & Navigation */}
      <div className="mb-4 flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/games"
          onClick={() => {
            if (roomCode) leaveRoom();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <span>← Back to Catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            Rules & Controls
          </button>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition-colors hover:text-white cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Online Room Setup Card */}
      {mode === 'online' && !roomCode ? (
        <div className="w-full max-w-xl">
          <OnlineRoomSetupCard
            title="Carrom Online 1v1"
            gameName="Carrom"
            subtitle="Host a match or enter a 6-digit code to challenge a friend."
            description="Classic tabletop pocket duel featuring realistic circle collision physics, queen cover rules, and integrated live voice chat."
            onBack={() => {
              setMode('vs-ai');
              handleRestart('vs-ai', setupType, botDifficulty);
            }}
          />
        </div>
      ) : (
        <>
          {/* WebRTC Voice Chat Dock */}
          {mode === 'online' && roomCode && (
            <RoomVoiceDock defaultOpen={false} />
          )}

          {/* Mode & Setup Selector Bar */}
          <div className="mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode('vs-ai');
                  handleRestart('vs-ai', setupType, botDifficulty);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'vs-ai'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                Vs AI Bot
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('pass-and-play');
                  handleRestart('pass-and-play', setupType, botDifficulty);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'pass-and-play'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                2-Player Local
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('online');
                  handleRestart('online', setupType, botDifficulty);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'online'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                Online 1v1
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('practice');
                  handleRestart('practice', setupType, botDifficulty);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'practice'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                Practice
              </button>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'vs-ai' && (
                <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-1 text-xs">
                  <span className="px-1.5 text-[10px] font-bold uppercase text-slate-400">AI:</span>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setBotDifficulty(diff);
                        handleRestart(mode, setupType, diff);
                      }}
                      className={`rounded px-2 py-0.5 capitalize transition-all cursor-pointer ${
                        botDifficulty === diff
                          ? 'bg-amber-500/20 font-bold text-amber-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSetupType('classic');
                    handleRestart(mode, 'classic', botDifficulty);
                  }}
                  className={`rounded px-2 py-0.5 transition-all cursor-pointer ${
                    setupType === 'classic'
                      ? 'bg-amber-500/20 font-bold text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Classic (19)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSetupType('blitz');
                    handleRestart(mode, 'blitz', botDifficulty);
                  }}
                  className={`rounded px-2 py-0.5 transition-all cursor-pointer ${
                    setupType === 'blitz'
                      ? 'bg-amber-500/20 font-bold text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blitz (9)
                </button>
              </div>
            </div>
          </div>

          {/* Main Game Arena */}
          <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-4 lg:grid-cols-4">
            {/* Left Side: Score & Queen HUD */}
            <div className="flex flex-col gap-3 lg:col-span-1">
              {/* Player 1 Card */}
              <div
                className={`rounded-xl border p-3.5 transition-all ${
                  gameState.activePlayer === 'player1'
                    ? 'border-amber-400/80 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-400 bg-slate-200 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-slate-900/20" />
                    </span>
                    <span className="text-sm font-bold text-slate-200">{p1Name}</span>
                  </div>
                  {gameState.activePlayer === 'player1' && (
                    <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300 animate-pulse">
                      Turn
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Potted:</span>
                  <span className="font-mono text-xl font-black text-amber-400">
                    {gameState.coinsPocketedCount.white} / {setupType === 'classic' ? 9 : 4}
                  </span>
                </div>
              </div>

              {/* Player 2 / AI Card */}
              <div
                className={`rounded-xl border p-3.5 transition-all ${
                  gameState.activePlayer === 'player2'
                    ? 'border-indigo-400/80 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-600 bg-slate-800 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-slate-100/20" />
                    </span>
                    <span className="text-sm font-bold text-slate-200">{p2Name}</span>
                  </div>
                  {gameState.activePlayer === 'player2' && (
                    <span className="rounded bg-indigo-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-300 animate-pulse">
                      Turn
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Potted:</span>
                  <span className="font-mono text-xl font-black text-indigo-400">
                    {gameState.coinsPocketedCount.black} / {setupType === 'classic' ? 9 : 4}
                  </span>
                </div>
              </div>

              {/* Queen Status Badge */}
              <div className="rounded-xl border border-red-900/40 bg-gradient-to-b from-red-950/20 to-slate-900/40 p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <Crown className="h-4 w-4 text-red-400" />
                  Queen Status
                </div>
                <div className="mt-2 text-xs font-medium text-slate-300">
                  {gameState.queenState.coveredBy ? (
                    <span className="text-amber-400">
                      Covered by {gameState.queenState.coveredBy === 'player1' ? p1Name : p2Name}!
                    </span>
                  ) : gameState.queenState.pendingCoverBy ? (
                    <span className="text-amber-300">
                      Potted by {gameState.queenState.pendingCoverBy === 'player1' ? p1Name : p2Name}{' '}
                      (Pending Cover coin!)
                    </span>
                  ) : (
                    <span className="text-slate-400">In play (Center Red)</span>
                  )}
                </div>
              </div>

              {/* Toast / Turn Feedback */}
              {turnToast && (
                <div
                  className={`rounded-xl border p-3 text-xs font-semibold animate-in fade-in zoom-in-95 ${
                    turnToast.type === 'foul'
                      ? 'border-red-500/40 bg-red-950/30 text-red-300'
                      : turnToast.type === 'success'
                        ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                        : 'border-slate-700 bg-slate-800/40 text-slate-300'
                  }`}
                >
                  {turnToast.text}
                </div>
              )}
            </div>

            {/* Center: Interactive Board Canvas */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-3">
              <div className="relative aspect-square w-full max-w-[680px] overflow-hidden rounded-2xl border-4 border-[#2b180d] bg-[#120a05] shadow-2xl shadow-black/80">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  className="h-full w-full touch-none cursor-crosshair select-none"
                />

                {/* Waiting for Opponent Overlay */}
                {mode === 'online' && !hasOpponent && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 p-6 text-center backdrop-blur-md">
                    <div className="rounded-2xl border border-amber-500/40 bg-slate-900/95 px-6 py-4 shadow-2xl animate-pulse">
                      <span className="text-sm font-bold text-amber-400 block mb-1">
                        WAITING FOR OPPONENT
                      </span>
                      <span className="font-mono text-xs text-slate-300">
                        Share Room Code:{' '}
                        <strong className="text-amber-300 font-bold tracking-widest">
                          {roomCode}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Winner Overlay Modal */}
                {gameState.phase === 'game-over' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-md">
                    <Trophy className="mb-3 h-16 w-16 animate-bounce text-amber-400" />
                    <h2 className="text-2xl font-black tracking-wide text-white">
                      {gameState.winner === 'draw'
                        ? 'Match Drawn!'
                        : gameState.winner === 'player1'
                          ? `${p1Name} Wins!`
                          : `${p2Name} Wins!`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      White: {gameState.score.player1} pts · Black: {gameState.score.player2} pts
                    </p>
                    <button
                      type="button"
                      onClick={handleRematch}
                      className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Play Rematch
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Controls Bar: Striker Placement, Aim & Shoot */}
              <div className="mt-4 flex w-full max-w-[680px] flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-900/80 p-3.5 backdrop-blur-md">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Baseline Position Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Striker Placement</span>
                      <span className="font-mono text-amber-400">
                        {Math.round(strikerBaselineX)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={gameState.baseline.minX}
                      max={gameState.baseline.maxX}
                      value={strikerBaselineX}
                      disabled={
                        gameState.phase === 'simulating' ||
                        (mode === 'vs-ai' && gameState.activePlayer === 'player2') ||
                        (mode === 'online' && (!isMyTurn || !hasOpponent))
                      }
                      onChange={(e) => handleBaselineChange(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-amber-500 disabled:opacity-40"
                    />
                  </div>

                  {/* Power Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Shot Power</span>
                      <span className="font-mono text-amber-400">{aimPower}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={aimPower}
                      disabled={
                        gameState.phase === 'simulating' ||
                        (mode === 'vs-ai' && gameState.activePlayer === 'player2') ||
                        (mode === 'online' && (!isMyTurn || !hasOpponent))
                      }
                      onChange={(e) => {
                        const newPower = Number(e.target.value);
                        setAimPower(newPower);
                        if (mode === 'online' && isMyTurn) {
                          sendAim({
                            strikerX: strikerBaselineX,
                            angleDeg: aimAngleDeg,
                            power: newPower,
                          });
                        }
                      }}
                      className="h-2 w-full cursor-pointer accent-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Strike Action Button */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-slate-500">
                    {mode === 'online' && !isMyTurn
                      ? "Waiting for opponent's shot…"
                      : "Drag on board to aim, or click Strike / press Space"}
                  </span>
                  <button
                    type="button"
                    onClick={triggerShot}
                    disabled={
                      gameState.phase === 'simulating' ||
                      (mode === 'vs-ai' && gameState.activePlayer === 'player2') ||
                      (mode === 'online' && (!isMyTurn || !hasOpponent))
                    }
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    Strike!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rules Modal */}
          {showRules && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl">
                <h3 className="text-lg font-bold text-amber-400">Official Carrom Rules</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-slate-300">
                  <li>
                    <strong>Pieces:</strong> White coins (Player 1), Black coins (Player 2), Red Queen
                    (Bonus 3 pts).
                  </li>
                  <li>
                    <strong>Turn Flow:</strong> Pocketing your own coin gives you an extra turn. Missing
                    passes the turn.
                  </li>
                  <li>
                    <strong>Queen Rule:</strong> To claim the Red Queen, you must pocket it and
                    subsequently "cover" it by pocketing another of your own coins on the very next
                    shot. If uncovered, the Queen returns to the center!
                  </li>
                  <li>
                    <strong>Fouls:</strong> Pocketing the striker returns one of your potted coins to
                    the center.
                  </li>
                  <li>
                    <strong>Online Play:</strong> Play 1v1 with low latency and real-time voice chat
                    over WebRTC.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setShowRules(false)}
                  className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
