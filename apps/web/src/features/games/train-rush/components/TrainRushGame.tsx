'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';

import {
  createInitialTrainRushState,
  discardCurrentPiece,
  MAP_PRESETS,
  placeTrackPiece,
  removeTrackPiece,
  rotateCurrentPiece,
  startTrainRushRound,
  stepTrainRushEngine,
  type MapPreset,
  type TrainRushState,
} from '../engine/train-rush-engine';
import { TrackCell } from './TrackCell';

interface TrainRushGameProps {
  roomCode?: string;
  initialPlayerName?: string;
  onExit?: () => void;
}

// Sound effects synthesizer using Web Audio API
class TrainAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  playPlaceTrack() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playRotate() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playSteamWhistle() {
    const ctx = this.getContext();
    if (!ctx) return;
    const freqs = [587.33, 739.99, 880];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.05, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    });
  }

  playErrorBuzz() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }
}

const sfx = new TrainAudio();

export const TrainRushGame: React.FC<TrainRushGameProps> = ({
  roomCode,
  initialPlayerName = 'You',
  onExit,
}) => {
  // Game state
  const [gameState, setGameState] = useState<TrainRushState>(() =>
    createInitialTrainRushState({ roomCode }, initialPlayerName),
  );

  // Configuration options for lobby
  const [selectedMapId, setSelectedMapId] = useState<string>('meadow-crossing');
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [botCount, setBotCount] = useState<number>(2);

  // History stack for undo
  const [placementHistory, setPlacementHistory] = useState<Array<{ x: number; y: number }>>([]);

  // Loop runner for active round
  const lastTimeRef = useRef<number>(0);
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    let animId: number;
    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setGameState((prev) => {
        if (prev.phase !== 'playing') return prev;
        const next = stepTrainRushEngine(prev, dt);
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState.phase]);

  // Active human player
  const humanPlayer = useMemo(() => {
    return gameState.players.find((p) => p.id === gameState.activePlayerId);
  }, [gameState.players, gameState.activePlayerId]);

  // Handle cell click (place piece)
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!humanPlayer || gameState.phase !== 'playing') return;

      const { player: updatedPlayer, success } = placeTrackPiece(
        humanPlayer,
        gameState.currentRound.map,
        x,
        y,
        humanPlayer.currentPiece,
      );

      if (success) {
        sfx.playPlaceTrack();
        if (updatedPlayer.isFinished && !humanPlayer.isFinished) {
          sfx.playSteamWhistle();
        }

        setPlacementHistory((prev) => [...prev, { x, y }]);
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) => (p.id === humanPlayer.id ? updatedPlayer : p)),
        }));
      } else {
        sfx.playErrorBuzz();
      }
    },
    [humanPlayer, gameState.phase, gameState.currentRound.map],
  );

  // Handle right-click / cell removal
  const handleCellRightClick = useCallback(
    (x: number, y: number) => {
      if (!humanPlayer || gameState.phase !== 'playing') return;

      const updatedPlayer = removeTrackPiece(humanPlayer, gameState.currentRound.map, x, y);

      setPlacementHistory((prev) => prev.filter((pos) => pos.x !== x || pos.y !== y));
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === humanPlayer.id ? updatedPlayer : p)),
      }));
    },
    [humanPlayer, gameState.phase, gameState.currentRound.map],
  );

  // Rotate piece
  const handleRotate = useCallback(() => {
    if (!humanPlayer || gameState.phase !== 'playing') return;
    sfx.playRotate();
    const updated = rotateCurrentPiece(humanPlayer);
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === humanPlayer.id ? updated : p)),
    }));
  }, [humanPlayer, gameState.phase]);

  // Discard piece
  const handleDiscard = useCallback(() => {
    if (!humanPlayer || gameState.phase !== 'playing') return;
    sfx.playPlaceTrack();
    const updated = discardCurrentPiece(humanPlayer);
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === humanPlayer.id ? updated : p)),
    }));
  }, [humanPlayer, gameState.phase]);

  // Undo last placement
  const handleUndo = useCallback(() => {
    if (!humanPlayer || gameState.phase !== 'playing' || placementHistory.length === 0) return;
    const last = placementHistory[placementHistory.length - 1];
    handleCellRightClick(last.x, last.y);
  }, [humanPlayer, gameState.phase, placementHistory, handleCellRightClick]);

  // Keyboard controls
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
        e.preventDefault();
        handleRotate();
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleDiscard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.phase, handleRotate, handleUndo, handleDiscard]);

  // Start game from lobby
  const handleStartGame = () => {
    const freshState = createInitialTrainRushState(
      {
        mapId: selectedMapId,
        roundDurationSeconds: roundDuration,
        totalRounds,
        botCount,
        roomCode,
      },
      initialPlayerName,
    );
    setGameState(startTrainRushRound(freshState, 1));
    setPlacementHistory([]);
  };

  // Next round
  const handleNextRound = () => {
    const nextRoundNum = gameState.currentRound.roundNumber + 1;
    setGameState((prev) => startTrainRushRound(prev, nextRoundNum));
    setPlacementHistory([]);
  };

  // Timer format
  const timeSecs = Math.ceil(gameState.currentRound.timeRemaining);
  const isUrgent = timeSecs <= 10 && gameState.phase === 'playing';

  // Standings
  const rankedPlayers = useMemo(() => {
    return [...gameState.players].sort((a, b) => b.score - a.score);
  }, [gameState.players]);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-start min-h-[640px] text-slate-100 font-sans p-2 sm:p-4 select-none">
      {/* PlayDeck Mesh Voice Dock */}
      <RoomVoiceDock defaultOpen={false} />

      {/* ----------------- PHASE: LOBBY ----------------- */}
      {gameState.phase === 'lobby' && (
        <div className="w-full flex flex-col items-center justify-center gap-6 py-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>🚂 Competitive Railway Puzzle</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Train Rush
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
              Rotate and lay track pieces to connect your Start Depot to the Destination Terminus.
              Navigate obstacles, pick up passenger stations, and race rival rail barons!
            </p>
          </div>

          {/* Lobby Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {/* Map Preset Selector */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Railway Map
              </label>
              <div className="flex flex-col gap-2">
                {MAP_PRESETS.map((m: MapPreset) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMapId(m.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMapId === m.id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Match Rules & Timers */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Round Duration & Rounds
              </label>
              <div className="flex items-center gap-2">
                {[45, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRoundDuration(sec)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      roundDuration === sec
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[1, 3, 5].map((rounds) => (
                  <button
                    key={rounds}
                    type="button"
                    onClick={() => setTotalRounds(rounds)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      totalRounds === rounds
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {rounds} {rounds === 1 ? 'Round' : 'Rounds'}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block pt-2">
                AI Competitors
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setBotCount(count)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      botCount === count
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-white'
                    }`}
                  >
                    {count} {count === 1 ? 'Bot' : 'Bots'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 w-full max-w-sm pt-2">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="py-3 px-5 rounded-xl text-sm font-semibold bg-[#162032] hover:bg-[#1e2c45] text-slate-300 border border-[#2a3750] transition-all"
              >
                Exit
              </button>
            )}
            <button
              type="button"
              onClick={handleStartGame}
              className="flex-1 py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center"
            >
              Start Railway Rush
            </button>
          </div>
        </div>
      )}

      {/* ----------------- PHASE: PLAYING ----------------- */}
      {gameState.phase === 'playing' && humanPlayer && (
        <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
          {/* Top HUD */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold px-2.5 py-1">
                Round {gameState.currentRound.roundNumber} / {gameState.currentRound.totalRounds}
              </Badge>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline">
                {gameState.currentRound.map.name}
              </span>
            </div>

            {/* Countdown timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                isUrgent
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse font-mono font-bold'
                  : 'bg-[#162032] border-[#25354e] text-slate-200 font-mono font-bold'
              }`}
            >
              <svg
                className="w-4 h-4 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-base sm:text-lg">{timeSecs}s</span>
            </div>

            {/* Score & Route Status */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Score</div>
                <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {humanPlayer.roundScore}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                🧑‍✈️
              </div>
            </div>
          </div>

          {/* Connection status banner */}
          <div
            className={`w-full max-w-2xl flex items-center justify-between px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
              humanPlayer.routeResult.isComplete
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 animate-pulse'
                : 'bg-[#121929] border-[#223048] text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{humanPlayer.routeResult.isComplete ? '🚂★' : '🛤️'}</span>
              <span>
                {humanPlayer.routeResult.isComplete
                  ? 'EXPRESS ROUTE CONNECTED! Full Steam Ahead!'
                  : `Route Length: ${humanPlayer.routeResult.length} tracks connected`}
              </span>
            </div>
            {humanPlayer.routeResult.stationsVisited > 0 && (
              <span className="text-amber-400">
                +{humanPlayer.routeResult.bonusScore} Stations Bonus
              </span>
            )}
          </div>

          {/* Main Stage: Grid + Piece Hopper */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 mt-1">
            {/* 7x7 Railway Grid */}
            <div
              className="p-3 sm:p-4 rounded-3xl bg-[#0b101c] border-2 border-[#202c42] shadow-2xl flex flex-col gap-1 sm:gap-1.5"
              role="grid"
              aria-label="Train Rush grid"
            >
              {humanPlayer.grid.map((row, rIdx) => (
                <div key={`row-${rIdx}`} className="flex items-center gap-1 sm:gap-1.5">
                  {row.map((cell) => (
                    <TrackCell
                      key={`cell-${cell.x}-${cell.y}`}
                      cell={cell}
                      previewPiece={humanPlayer.currentPiece}
                      onClick={handleCellClick}
                      onRightClick={handleCellRightClick}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Right Control & Piece Hopper Panel */}
            <div className="flex flex-col items-center gap-4 w-full max-w-xs">
              {/* Current Held Piece */}
              <div className="w-full p-4 rounded-2xl bg-[#0f172a] border border-[#232f45] shadow-xl flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Held Track Piece
                </span>

                {/* Big piece visual preview */}
                <div className="w-20 h-20 rounded-2xl bg-[#141d2e] border-2 border-amber-500/60 p-2 shadow-inner flex items-center justify-center">
                  <TrackCell
                    cell={{
                      x: 0,
                      y: 0,
                      type: 'track',
                      piece: humanPlayer.currentPiece,
                    }}
                    onClick={() => {}}
                    onRightClick={() => {}}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="capitalize">{humanPlayer.currentPiece.type}</span>
                  <span className="text-amber-400 font-mono">
                    {humanPlayer.currentPiece.rotation}°
                  </span>
                </div>

                {/* Controls: Rotate, Undo, Discard */}
                <div className="flex items-center gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
                    title="Rotate Piece (R or Space)"
                  >
                    <span>Rotate</span>
                    <span className="text-[10px] opacity-75">(R)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={placementHistory.length === 0}
                    className="py-2 px-3 rounded-xl bg-[#1a2335] hover:bg-[#232f45] border border-[#293850] text-slate-200 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                    title="Undo Last Placement (Z)"
                  >
                    Undo
                  </button>

                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="py-2 px-3 rounded-xl bg-[#1a2335] hover:bg-[#232f45] border border-[#293850] text-slate-200 text-xs font-bold transition-all active:scale-95"
                    title="Skip for Next Piece (D)"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Next Piece in Queue */}
              <div className="w-full p-3 rounded-2xl bg-[#0f172a] border border-[#232f45] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Next in Queue
                  </span>
                  <span className="text-xs font-bold text-slate-200 capitalize">
                    {humanPlayer.nextPiece.type}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#141d2e] border border-slate-700/60 p-1 flex items-center justify-center">
                  <TrackCell
                    cell={{
                      x: 0,
                      y: 0,
                      type: 'track',
                      piece: humanPlayer.nextPiece,
                    }}
                    onClick={() => {}}
                    onRightClick={() => {}}
                  />
                </div>
              </div>

              {/* Live Competitors */}
              <div className="w-full p-3 rounded-2xl bg-[#0f172a] border border-[#232f45] flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Rival Rail Barons
                </span>
                <div className="flex flex-col gap-1.5">
                  {gameState.players
                    .filter((p) => p.id !== gameState.activePlayerId)
                    .map((bot) => (
                      <div
                        key={bot.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#141d2e] border border-[#223048] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{bot.avatar}</span>
                          <div>
                            <div className="font-bold text-slate-200">{bot.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {bot.isFinished ? '★ Completed!' : `${bot.routeResult.length} tracks`}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono font-bold text-amber-400">
                          {bot.score + bot.roundScore}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PHASE: ROUND REVIEW ----------------- */}
      {gameState.phase === 'round-review' && (
        <div className="w-full flex flex-col items-center gap-6 py-4 animate-fadeIn">
          <div className="text-center space-y-1">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 font-bold">
              Round {gameState.currentRound.roundNumber} Finished
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Railway Dispatch Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Routes scored based on path completion, track length, and stations serviced.
            </p>
          </div>

          {/* Standings table */}
          <div className="w-full max-w-xl p-4 sm:p-6 rounded-2xl bg-[#0f172a] border border-[#232f45] shadow-xl flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider pb-1 border-b border-[#232f45]">
              Round Standings
            </h3>
            <div className="flex flex-col gap-2">
              {rankedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#162032] border border-[#273650] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <span className="text-xl">{player.avatar}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.isFinished && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                            Finished
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {player.routeResult.length} tracks, {player.routeResult.stationsVisited}{' '}
                        stations
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400">+{player.roundScore}</span>
                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                      {player.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next round button */}
          <button
            type="button"
            onClick={handleNextRound}
            className="py-3 px-8 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Start Round {gameState.currentRound.roundNumber + 1}
          </button>
        </div>
      )}

      {/* ----------------- PHASE: GAME OVER ----------------- */}
      {gameState.phase === 'game-over' && (
        <div className="w-full flex flex-col items-center gap-6 py-6 animate-fadeIn">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              🏆 Grand Terminus Cup
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Final Railway Standings
            </h2>
            <p className="text-sm text-slate-400">
              The grand railway empire championship has reached its final station!
            </p>
          </div>

          {/* Podium */}
          <div className="w-full max-w-xl p-4 sm:p-6 rounded-2xl bg-[#0f172a] border border-[#232f45] shadow-2xl flex flex-col gap-3">
            {rankedPlayers.map((player, idx) => {
              const isWinner = idx === 0;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-[#162032] border-[#25354e]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-amber-400 w-6">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{player.name}</span>
                        {isWinner && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase">
                            Grand Conductor
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Total points: {player.score}</div>
                    </div>
                  </div>

                  <div className="font-mono font-extrabold text-lg text-amber-400">
                    {player.score}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleStartGame}
              className="py-3 px-8 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={() =>
                setGameState(
                  createInitialTrainRushState(
                    {
                      mapId: selectedMapId,
                      roundDurationSeconds: roundDuration,
                      totalRounds,
                      botCount,
                    },
                    initialPlayerName,
                  ),
                )
              }
              className="py-3 px-5 rounded-xl text-sm font-semibold bg-[#162032] hover:bg-[#1e2c45] text-slate-300 border border-[#283750] transition-all"
            >
              Match Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
