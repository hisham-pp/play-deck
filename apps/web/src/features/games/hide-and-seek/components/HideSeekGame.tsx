'use client';

import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Box,
  Ghost,
  HelpCircle,
  Radio,
  RotateCcw,
  Search,
  Shield,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialHideSeekState,
  inspectHidingSpot,
  movePlayer,
  nextRound,
  stepHideSeekMatch,
  toggleHidingSpot,
  useDisguise,
  useInvisibility,
  useRadarPulse,
  useSprint,
  type HideSeekState,
  type PlayerRole,
} from '../engine/hide-and-seek-engine';
import { HideSeekArenaCanvas } from './HideSeekArenaCanvas';

export function HideSeekGame() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [preferredRole, setPreferredRole] = useState<PlayerRole>('hider');

  const [gameState, setGameState] = useState<HideSeekState>(() =>
    createInitialHideSeekState({
      mapId: 'manor',
      playerCount: 4,
      playerRole: 'hider',
      maxRounds: 3,
    }),
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});
  const user = gameState.players[0];

  // Sound Synthesizer via Web Audio API
  const playSound = useCallback(
    (type: 'spot' | 'radar' | 'invisible' | 'tag' | 'sprint' | 'win') => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
          case 'spot':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;
          case 'radar':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(987.77, now);
            osc.frequency.setValueAtTime(1318.51, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
            break;
          case 'invisible':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
          case 'tag':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
          case 'sprint':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
          case 'win':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
            break;
        }
      } catch {
        // Ignore audio failures
      }
    },
    [soundEnabled],
  );

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      // Abilities hotkeys
      if (e.key === 'e' || e.key === 'E') {
        if (user.role === 'hider') {
          handleToggleHiding();
        } else {
          handleInspectHiding();
        }
      } else if (e.key === '1') {
        if (user.role === 'hider') handleDisguise();
        else handleRadar();
      } else if (e.key === '2' && user.role === 'hider') {
        handleInvisibility();
      } else if (e.code === 'Space') {
        e.preventDefault();
        handleSprint();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Main 60 FPS Game Loop
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      setGameState((prev) => {
        if (prev.phase === 'round_over' || prev.phase === 'game_over') return prev;
        const next = { ...prev };
        const u = next.players[0];

        // Process User Movement from WASD / Arrows
        let dx = 0;
        let dy = 0;
        const keys = keysPressed.current;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        // Seeker is frozen during hiding phase
        const canMove = !(u.role === 'seeker' && next.phase === 'hiding_phase');
        if (canMove && (dx !== 0 || dy !== 0)) {
          movePlayer(u, dx, dy, dt, next.map);
        }

        // Step simulation
        const prevTagged = u.isTagged;
        stepHideSeekMatch(next, dt);

        if (!prevTagged && u.isTagged) {
          playSound('tag');
        }

        return next;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [playSound, user.role]);

  // Ability Handlers
  const handleToggleHiding = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = toggleHidingSpot(next.players[0], next.map);
      if (success) playSound('spot');
      return next;
    });
  };

  const handleInspectHiding = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = inspectHidingSpot(next.players[0], next.map, next);
      if (success) playSound('tag');
      return next;
    });
  };

  const handleDisguise = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = useDisguise(next.players[0], 'box');
      if (success) playSound('spot');
      return next;
    });
  };

  const handleInvisibility = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = useInvisibility(next.players[0]);
      if (success) playSound('invisible');
      return next;
    });
  };

  const handleSprint = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = useSprint(next.players[0]);
      if (success) playSound('sprint');
      return next;
    });
  };

  const handleRadar = () => {
    setGameState((prev) => {
      const next = { ...prev };
      const success = useRadarPulse(next.players[0], next);
      if (success) playSound('radar');
      return next;
    });
  };

  // Next round
  const handleNextRound = () => {
    setGameState((prev) => {
      const next = { ...prev };
      nextRound(next);
      return next;
    });
  };

  // Restart match
  const handleRestart = (role?: PlayerRole) => {
    const r = role ?? preferredRole;
    setPreferredRole(r);
    setGameState(
      createInitialHideSeekState({
        mapId: 'manor',
        playerCount: 4,
        playerRole: r,
        maxRounds: 3,
      }),
    );
  };

  // Touch Virtual D-pad Movement
  const handleTouchDirection = (dirX: number, dirY: number) => {
    setGameState((prev) => {
      const next = { ...prev };
      const u = next.players[0];
      const canMove = !(u.role === 'seeker' && next.phase === 'hiding_phase');
      if (canMove) {
        movePlayer(u, dirX, dirY, 0.12, next.map);
      }
      return next;
    });
  };

  const hidersCount = gameState.players.filter((p) => p.role === 'hider' && !p.isTagged).length;
  const seekersCount = gameState.players.filter((p) => p.role === 'seeker').length;

  return (
    <div className="relative min-h-[720px] w-full max-w-6xl mx-auto flex flex-col gap-4 p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl select-none">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              user.role === 'seeker'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {user.role === 'seeker' ? (
              <Search className="w-6 h-6 animate-pulse" />
            ) : (
              <Ghost className="w-6 h-6 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Hide & Seek
              </h1>
              <span
                className={`px-2 py-0.5 text-xs font-black rounded uppercase tracking-wider ${
                  user.role === 'seeker'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                ROLE: {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Round {gameState.currentRound} of {gameState.maxRounds} • Map:{' '}
              <strong className="text-slate-200">{gameState.map.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            aria-label={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Game Rules"
            aria-label="Game Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleRestart()}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </header>

      {/* Phase Banner & Countdown Clock */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Ghost className="w-4 h-4" />
            <span>{hidersCount} Hiders Left</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <Search className="w-4 h-4" />
            <span>{seekersCount} Seekers</span>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-300 text-center">
          {gameState.lastActionMessage}
        </div>

        {/* Phase Timer */}
        <div
          className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-colors ${
            gameState.phase === 'hiding_phase'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : gameState.phaseTimerSeconds <= 10
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          {gameState.phase === 'hiding_phase' ? '🙈 HIDING: ' : '🔍 HUNT: '}
          {Math.ceil(gameState.phaseTimerSeconds)}s
        </div>
      </div>

      {/* Main Arena & Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Arena Canvas (3 Cols on Desktop) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <HideSeekArenaCanvas state={gameState} user={user} />

          {/* Action Dock / Abilities Bar */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              {/* Hider Abilities */}
              {user.role === 'hider' ? (
                <>
                  <button
                    type="button"
                    onClick={handleToggleHiding}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      user.isHiddenInSpot
                        ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <Box className="w-4 h-4 text-amber-400" />
                    <span>{user.isHiddenInSpot ? 'Exit Spot [E]' : 'Hide in Spot [E]'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisguise}
                    disabled={user.disguiseCooldown > 0 || user.isHiddenInSpot}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>
                      Box Prop [1]{' '}
                      {user.disguiseCooldown > 0 && `(${Math.ceil(user.disguiseCooldown)}s)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInvisibility}
                    disabled={user.invisibilityCooldown > 0 || user.isHiddenInSpot}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Ghost className="w-4 h-4 text-cyan-400" />
                    <span>
                      Ghost Cloak [2]{' '}
                      {user.invisibilityCooldown > 0 &&
                        `(${Math.ceil(user.invisibilityCooldown)}s)`}
                    </span>
                  </button>
                </>
              ) : (
                /* Seeker Abilities */
                <>
                  <button
                    type="button"
                    onClick={handleInspectHiding}
                    className="px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-bold text-red-200 hover:bg-red-900/60 flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-4 h-4 text-red-400" />
                    <span>Search Spot [E]</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRadar}
                    disabled={user.radarCooldown > 0}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span>
                      Radar Pulse [1]{' '}
                      {user.radarCooldown > 0 && `(${Math.ceil(user.radarCooldown)}s)`}
                    </span>
                  </button>
                </>
              )}

              {/* Universal Sprint Dash */}
              <button
                type="button"
                onClick={handleSprint}
                disabled={user.dashCooldown > 0 || user.isHiddenInSpot}
                className="px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 disabled:opacity-40 text-xs font-black text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  Sprint [Space] {user.dashCooldown > 0 && `(${Math.ceil(user.dashCooldown)}s)`}
                </span>
              </button>
            </div>

            {/* Mobile Touch D-pad */}
            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleTouchDirection(0, -1)}
                className="p-1.5 rounded bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                title="Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTouchDirection(-1, 0)}
                className="p-1.5 rounded bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                title="Left"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTouchDirection(0, 1)}
                className="p-1.5 rounded bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                title="Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTouchDirection(1, 0)}
                className="p-1.5 rounded bg-slate-700 text-white hover:bg-slate-600 active:scale-95"
                title="Right"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Match Log & Players (1 Col) */}
        <div className="flex flex-col gap-4">
          {/* Players Roster */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Player Standings</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {gameState.players.map((p) => {
                const isSeeker = p.role === 'seeker';
                return (
                  <div
                    key={p.id}
                    className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                      p.id === user.id
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSeeker ? 'bg-red-400' : 'bg-cyan-400'
                        }`}
                      />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span
                        className={`px-1 py-0.2 rounded font-black uppercase ${
                          isSeeker ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {p.role}
                      </span>
                      <span className="text-white font-bold">{p.score} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Commentary Log */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Match Feed</span>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] text-slate-400">
              {gameState.activityLog.slice(0, 10).map((log, idx) => (
                <div key={idx} className="p-1 rounded bg-slate-800/40">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Round Over */}
      {gameState.phase === 'round_over' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 z-30">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/40">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">
              Round {gameState.currentRound} Complete!
            </h2>
            <p className="text-xs text-slate-300 font-medium">{gameState.lastActionMessage}</p>

            <button
              type="button"
              onClick={handleNextRound}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg"
            >
              Continue to Next Round
            </button>
          </div>
        </div>
      )}

      {/* Modal: Game Over Podium */}
      {gameState.phase === 'game_over' && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 z-40">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/40">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-white">Match Finished!</h2>
            <p className="text-xs text-slate-400">{gameState.lastActionMessage}</p>

            {/* Standings */}
            <div className="space-y-1.5 pt-2">
              {[...gameState.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{idx + 1}</span>
                      <span>{p.name}</span>
                    </div>
                    <span className="font-mono">{p.score} pts</span>
                  </div>
                ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleRestart('hider')}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-sm transition-colors shadow-lg"
              >
                Play as Hider
              </button>
              <button
                type="button"
                onClick={() => handleRestart('seeker')}
                className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white font-black rounded-xl text-sm transition-colors shadow-lg"
              >
                Play as Seeker
              </button>
              <Link
                href="/games"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700"
              >
                Arcade
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                How to Play Hide & Seek
              </h3>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                <strong>1. Hiding Phase:</strong> Seekers are blindfolded and frozen at spawn for 12
                seconds. Hiders must quickly find cover in closets, crates, vents, or desks.
              </p>
              <p>
                <strong>2. Hiding Spots:</strong> Press <em>[E]</em> when near a closet, crate, or
                vent to jump inside and vanish from sight. Seekers can inspect spots to catch you!
              </p>
              <p>
                <strong>3. Abilities:</strong> Hiders can activate temporary box camouflage [1],
                ghost invisibility [2], or sprint dash [Space]. Seekers possess sonar radar pings
                [1] to detect hidden heartbeats!
              </p>
              <p>
                <strong>4. Infection Tag:</strong> When a seeker gets within tag range, the hider is
                caught and joins the seeker hunting squad!
              </p>
              <p>
                <strong>5. Victory:</strong> Surviving hiders earn bonus points when time expires.
                Seekers score points for every catch.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors border border-slate-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
