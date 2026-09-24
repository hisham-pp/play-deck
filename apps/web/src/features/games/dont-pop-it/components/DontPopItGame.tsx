'use client';

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Crown,
  HelpCircle,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import {
  createDontPopItGame,
  getAiTileSelection,
  selectTile,
  startNextRound,
  type DontPopItState,
  type TileType,
} from '../engine/dont-pop-it-engine';

export function DontPopItGame() {
  const [mode, setMode] = useState<'solo' | 'pass_play'>('solo');
  const [gameState, setGameState] = useState<DontPopItState>(() =>
    createDontPopItGame({
      players: [
        { name: 'Player 1', isAi: false },
        { name: 'Pop-Bot 3000', isAi: true },
      ],
    }),
  );

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restart or switch mode
  const handleStartGame = (selectedMode: 'solo' | 'pass_play') => {
    setMode(selectedMode);
    const players =
      selectedMode === 'solo'
        ? [
            { name: 'Player 1', isAi: false },
            { name: 'Pop-Bot 3000', isAi: true },
          ]
        : [
            { name: 'Player 1', isAi: false },
            { name: 'Player 2', isAi: false },
          ];

    setGameState(
      createDontPopItGame({
        players,
        gridSize: 5,
        popCount: 3,
        maxRounds: 3,
      }),
    );
  };

  // AI turn automation
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer && activePlayer.isAi && !activePlayer.isEliminated) {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

      aiTimeoutRef.current = setTimeout(() => {
        const tileId = getAiTileSelection(gameState);
        setGameState((prev) => selectTile(prev, tileId));
      }, 900);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameState]);

  const handleTileClick = (tileId: number) => {
    if (gameState.status !== 'playing') return;
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer?.isAi) return; // Prevent clicking while AI is thinking

    setGameState((prev) => selectTile(prev, tileId));
  };

  // Keyboard navigation across grid
  const handleKeyDown = (e: React.KeyboardEvent, tileId: number) => {
    const size = gameState.gridSize;
    let nextIndex = tileId;

    if (e.key === 'ArrowRight') nextIndex = (tileId + 1) % (size * size);
    else if (e.key === 'ArrowLeft') nextIndex = (tileId - 1 + size * size) % (size * size);
    else if (e.key === 'ArrowDown') nextIndex = (tileId + size) % (size * size);
    else if (e.key === 'ArrowUp') nextIndex = (tileId - size + size * size) % (size * size);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTileClick(tileId);
      return;
    }

    if (nextIndex !== tileId) {
      e.preventDefault();
      setFocusedIndex(nextIndex);
      const targetEl = document.getElementById(`dont-pop-tile-${nextIndex}`);
      targetEl?.focus();
    }
  };

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isAiThinking = activePlayer?.isAi && gameState.status === 'playing';

  // Tension color calculation
  const tension = gameState.tensionPercentage;
  const tensionColor =
    tension < 35
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : tension < 65
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        : 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse';

  const balloonScale = 1 + (tension / 100) * 0.45;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-3 py-4 text-deck-100">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-deck-800 pb-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold text-deck-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Game Catalog</span>
        </Link>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-deck-800 bg-deck-900/80 p-1">
          <button
            type="button"
            onClick={() => handleStartGame('solo')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'solo'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-deck-400 hover:text-white'
            }`}
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Solo vs Bot</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartGame('pass_play')}
            className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === 'pass_play'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-deck-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Pass & Play</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleStartGame(mode)}
          className="inline-flex items-center gap-1.5 rounded-md border border-deck-700 bg-deck-800/80 px-2.5 py-1 text-xs font-medium text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Match</span>
        </button>
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left Column: Player Cards & Balloon Pressure Meter */}
        <div className="flex flex-col gap-4">
          {/* Balloon Pressure Gauge */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-deck-800 bg-gradient-to-b from-deck-900/90 to-deck-950/90 p-5 text-center shadow-lg">
            <div className="relative mb-3 flex h-36 w-36 items-center justify-center">
              {/* Balloon Graphic */}
              <div
                className="relative flex items-center justify-center rounded-full transition-transform duration-300"
                style={{
                  transform: `scale(${balloonScale})`,
                  width: '90px',
                  height: '110px',
                  borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
                  background:
                    tension < 35
                      ? 'radial-gradient(circle at 35% 35%, #38bdf8, #0284c7)'
                      : tension < 65
                        ? 'radial-gradient(circle at 35% 35%, #fbbf24, #d97706)'
                        : 'radial-gradient(circle at 35% 35%, #f43f5e, #be123c)',
                  boxShadow:
                    tension > 60
                      ? '0 0 25px rgba(244, 63, 94, 0.4)'
                      : '0 0 15px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Shine highlight */}
                <div className="absolute top-3 left-4 h-5 w-3 rounded-full bg-white/40" />
                <span className="text-xl font-black text-white drop-shadow">{tension}%</span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-deck-400">
                Pop Pressure Gauge
              </span>
              <span
                className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${tensionColor}`}
              >
                {tension < 35
                  ? 'CALM TENSION'
                  : tension < 65
                    ? 'ELEVATED RISK'
                    : 'CRITICAL PRESSURE!'}
              </span>
            </div>
          </div>

          {/* Player Roster */}
          <div className="flex flex-col gap-2 rounded-xl border border-deck-800 bg-deck-900/60 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-deck-400">
              <span>Match Standings</span>
              <span>
                Round {gameState.round} of {gameState.maxRounds}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {gameState.players.map((p, idx) => {
                const isCurrentTurn =
                  idx === gameState.currentTurnIndex && gameState.status === 'playing';
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                      isCurrentTurn
                        ? 'border-amber-500/80 bg-amber-500/10 shadow-sm'
                        : p.isEliminated
                          ? 'border-deck-800/40 bg-deck-950/40 opacity-60'
                          : 'border-deck-800 bg-deck-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          isCurrentTurn
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-deck-800 text-deck-200'
                        }`}
                      >
                        {p.isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {p.name}
                          {p.hasShield && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-blue-500/20 px-1 py-0.2 text-[10px] font-semibold text-blue-300 border border-blue-500/40">
                              <Shield className="h-2.5 w-2.5" /> Shielded
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-deck-400">
                          {p.isEliminated
                            ? '💥 Popped Out'
                            : isCurrentTurn
                              ? '▶ Active Turn'
                              : 'Waiting'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-400">{p.score}</span>
                      <span className="text-[10px] text-deck-500 block uppercase">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center / Right Column: The Mystery Tile Grid */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Action Log / Instructions Banner */}
          <div
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl border border-deck-800 bg-deck-900/90 px-4 py-3 text-xs font-medium text-deck-200 shadow-sm"
          >
            {isAiThinking ? (
              <div className="flex items-center gap-2 text-amber-400">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <span>Pop-Bot 3000 is calculating tile probabilities...</span>
              </div>
            ) : (
              <span className="leading-relaxed">{gameState.lastActionMessage}</span>
            )}
          </div>

          {/* Grid Container */}
          <div className="relative rounded-2xl border border-deck-800 bg-deck-950/80 p-4 shadow-2xl">
            <div
              role="grid"
              aria-label="Don't Pop It Mystery Grid"
              className="grid grid-cols-5 gap-2.5 sm:gap-3"
            >
              {gameState.tiles.map((tile) => {
                const isFocused = focusedIndex === tile.id;
                return (
                  <button
                    key={tile.id}
                    id={`dont-pop-tile-${tile.id}`}
                    role="gridcell"
                    type="button"
                    tabIndex={tile.revealed ? -1 : 0}
                    disabled={tile.revealed || gameState.status !== 'playing' || isAiThinking}
                    onClick={() => handleTileClick(tile.id)}
                    onKeyDown={(e) => handleKeyDown(e, tile.id)}
                    aria-label={
                      tile.revealed
                        ? `Revealed ${tile.type} tile at row ${tile.row + 1} column ${tile.col + 1}`
                        : `Mystery tile at row ${tile.row + 1} column ${tile.col + 1}`
                    }
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-xl p-2 font-display transition-all duration-200 outline-none ${
                      tile.revealed
                        ? getRevealedTileClasses(tile.type)
                        : `border border-deck-700/80 bg-deck-900 hover:border-amber-500/80 hover:bg-deck-800 hover:shadow-md ${
                            isFocused
                              ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-deck-950'
                              : ''
                          }`
                    }`}
                  >
                    {tile.revealed ? (
                      renderTileContent(tile.type)
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1">
                        <HelpCircle className="h-5 w-5 text-deck-500 group-hover:text-amber-400 transition-colors" />
                        {tile.hintScouted && (
                          <span className="absolute bottom-1 right-1 flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Round Over / Game Over Overlay */}
            {gameState.status !== 'playing' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-deck-950/85 p-6 backdrop-blur-sm text-center">
                {gameState.status === 'game_over' ? (
                  <>
                    <Trophy className="mb-2 h-12 w-12 text-amber-400 animate-bounce" />
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">
                      Game Concluded!
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-deck-300">
                      Final scores tallied across {gameState.maxRounds} tense rounds.
                    </p>

                    <div className="my-4 flex flex-col gap-1.5 w-full max-w-xs">
                      {[...gameState.players]
                        .sort((a, b) => b.score - a.score)
                        .map((p, idx) => (
                          <div
                            key={p.id}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                              idx === 0
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                : 'bg-deck-900 border border-deck-800 text-deck-200'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {idx === 0 && <Crown className="h-4 w-4 text-amber-400" />}#{idx + 1}{' '}
                              {p.name}
                            </span>
                            <span className="font-bold">{p.score} pts</span>
                          </div>
                        ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartGame(mode)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Play Again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Sparkles className="mb-2 h-10 w-10 text-amber-400" />
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">
                      Round {gameState.round} Complete!
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-deck-300">
                      {gameState.lastActionMessage}
                    </p>

                    <button
                      type="button"
                      onClick={() => setGameState((prev) => startNextRound(prev))}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                    >
                      <Play className="h-4 w-4" />
                      <span>Begin Round {gameState.round + 1}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRevealedTileClasses(type: TileType): string {
  switch (type) {
    case 'pop':
      return 'border-rose-500/80 bg-rose-500/20 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-shake';
    case 'bonus':
      return 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    case 'double':
      return 'border-purple-500/80 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
    case 'shield':
      return 'border-blue-500/80 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
    case 'extra_turn':
      return 'border-amber-500/80 bg-amber-500/20 text-amber-300';
    case 'scout':
      return 'border-cyan-500/80 bg-cyan-500/20 text-cyan-300';
    case 'safe':
    default:
      return 'border-deck-700 bg-deck-900/60 text-deck-300';
  }
}

function renderTileContent(type: TileType) {
  switch (type) {
    case 'pop':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
          <span className="text-[10px] font-black uppercase text-rose-400">POP!</span>
        </div>
      );
    case 'bonus':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Sparkles className="h-6 w-6 text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-emerald-400">+25</span>
        </div>
      );
    case 'double':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Zap className="h-6 w-6 text-purple-400" />
          <span className="text-[10px] font-black uppercase text-purple-400">2X</span>
        </div>
      );
    case 'shield':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Shield className="h-6 w-6 text-blue-400" />
          <span className="text-[10px] font-black uppercase text-blue-400">SHIELD</span>
        </div>
      );
    case 'extra_turn':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <RotateCcw className="h-6 w-6 text-amber-400" />
          <span className="text-[10px] font-black uppercase text-amber-400">+1 TURN</span>
        </div>
      );
    case 'scout':
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <HelpCircle className="h-6 w-6 text-cyan-400" />
          <span className="text-[10px] font-black uppercase text-cyan-400">RADAR</span>
        </div>
      );
    case 'safe':
    default:
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-sm font-bold text-deck-400">✓</span>
          <span className="text-[10px] font-bold text-deck-400">+10</span>
        </div>
      );
  }
}
