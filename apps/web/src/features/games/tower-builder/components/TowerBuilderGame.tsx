'use client';

import {
  ArrowDown,
  ArrowLeft,
  Flame,
  Heart,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ARENA_WIDTH,
  BASE_PLATFORM_WIDTH,
  BASE_PLATFORM_Y,
  createInitialTowerBuilderState,
  dropPiece,
  moveCrane,
  PIECE_DEFINITIONS,
  startTowerGame,
  stepTowerGame,
  type TowerBuilderState,
} from '../engine/tower-builder-engine';

export function TowerBuilderGame() {
  const [gameState, setGameState] = useState<TowerBuilderState>(() =>
    createInitialTowerBuilderState(0),
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<TowerBuilderState>(gameState);
  stateRef.current = gameState;

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (stateRef.current.status === 'playing') {
        const nextState = stepTowerGame(stateRef.current, dt);
        stateRef.current = nextState;
        setGameState(nextState);
      }

      drawStage();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleDrop = useCallback(() => {
    if (stateRef.current.status === 'idle') {
      const started = startTowerGame(stateRef.current);
      stateRef.current = started;
      setGameState(started);
      return;
    }
    if (stateRef.current.status === 'game_over') {
      const restarted = startTowerGame(stateRef.current);
      stateRef.current = restarted;
      setGameState(restarted);
      return;
    }
    const nextState = dropPiece(stateRef.current);
    stateRef.current = nextState;
    setGameState(nextState);
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleDrop();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setGameState((prev) => moveCrane(prev, prev.craneX - 25));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setGameState((prev) => moveCrane(prev, prev.craneX + 25));
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const restarted = startTowerGame(stateRef.current);
        setGameState(restarted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop]);

  // Touch / Mouse interactive crane positioning
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState.status !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    setGameState((prev) => moveCrane(prev, clientX));
  };

  // Canvas drawing routine
  const drawStage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const state = stateRef.current;
    const camY = state.cameraY;

    // 1. Dynamic Atmosphere Background based on altitude
    const heightRatio = Math.min(1, state.highestY / 2500);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (heightRatio < 0.4) {
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#1e293b');
    } else if (heightRatio < 0.8) {
      bgGrad.addColorStop(0, '#0284c7');
      bgGrad.addColorStop(1, '#090d16');
    } else {
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(1, '#090d16');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stars in upper atmosphere
    if (heightRatio > 0.3) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 25; i++) {
        const sx = (i * 73) % width;
        const sy = (i * 97) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    // World coordinate transform: origin is bottom-center, Y grows upward
    ctx.save();
    ctx.translate(0, height - 80 + camY);

    // 2. Base Platform / Foundation Pedestal
    const baseCenterX = width / 2;
    ctx.fillStyle = '#334155';
    ctx.fillRect(baseCenterX - BASE_PLATFORM_WIDTH / 2, -BASE_PLATFORM_Y, BASE_PLATFORM_WIDTH, 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      baseCenterX - BASE_PLATFORM_WIDTH / 2,
      -BASE_PLATFORM_Y,
      BASE_PLATFORM_WIDTH,
      24,
    );

    // Foundation support lines
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(baseCenterX - BASE_PLATFORM_WIDTH / 2, -BASE_PLATFORM_Y + 24);
    ctx.lineTo(baseCenterX - BASE_PLATFORM_WIDTH / 2 - 20, -BASE_PLATFORM_Y + 70);
    ctx.moveTo(baseCenterX + BASE_PLATFORM_WIDTH / 2, -BASE_PLATFORM_Y + 24);
    ctx.lineTo(baseCenterX + BASE_PLATFORM_WIDTH / 2 + 20, -BASE_PLATFORM_Y + 70);
    ctx.stroke();

    // 3. Placed Tower Blocks
    state.placedBlocks.forEach((block) => {
      ctx.save();
      ctx.translate(block.x, -block.y - block.height);

      ctx.fillStyle = block.piece.color;
      ctx.fillRect(-block.width / 2, 0, block.width, block.height);

      ctx.strokeStyle = block.isPerfect ? '#fde047' : block.piece.borderColor;
      ctx.lineWidth = block.isPerfect ? 3 : 2;
      ctx.strokeRect(-block.width / 2, 0, block.width, block.height);

      // Perfect alignment shimmer badge
      if (block.isPerfect) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        ctx.fillRect(-block.width / 2, 0, block.width, block.height);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.piece.name, 0, block.height / 2);

      ctx.restore();
    });

    // 4. Falling Debris Blocks (missed drops)
    state.fallingBlocks.forEach((fb) => {
      ctx.save();
      ctx.translate(fb.x, -fb.y - fb.piece.height);
      ctx.rotate(fb.rotation);

      ctx.fillStyle = fb.piece.color;
      ctx.globalAlpha = 0.75;
      ctx.fillRect(-fb.piece.width / 2, 0, fb.piece.width, fb.piece.height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(-fb.piece.width / 2, 0, fb.piece.width, fb.piece.height);

      ctx.restore();
    });

    // 5. Active Dropping Piece
    if (state.droppingPiece) {
      const dp = state.droppingPiece;
      ctx.save();
      ctx.translate(dp.x, -dp.y - dp.piece.height);

      ctx.fillStyle = dp.piece.color;
      ctx.fillRect(-dp.piece.width / 2, 0, dp.piece.width, dp.piece.height);
      ctx.strokeStyle = dp.piece.borderColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-dp.piece.width / 2, 0, dp.piece.width, dp.piece.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dp.piece.name, 0, dp.piece.height / 2);

      ctx.restore();
    }

    // 6. Crane & Cable System (positioned above highest block)
    const craneY = state.highestY + 320;
    const craneScreenY = -craneY;

    // Top rail
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, craneScreenY - 30);
    ctx.lineTo(width - 20, craneScreenY - 30);
    ctx.stroke();

    // Trolley
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(state.craneX - 16, craneScreenY - 36, 32, 12);

    // Cable to piece
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.craneX, craneScreenY - 24);
    ctx.lineTo(state.craneX, craneScreenY);
    ctx.stroke();

    // Crane hook holding current piece if not dropped
    if (!state.droppingPiece && state.status === 'playing') {
      const piece = PIECE_DEFINITIONS[state.currentPieceShape];
      ctx.save();
      ctx.translate(state.craneX, craneScreenY);

      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.width / 2, 0, piece.width, piece.height);
      ctx.strokeStyle = piece.borderColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-piece.width / 2, 0, piece.width, piece.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(piece.name, 0, piece.height / 2);

      ctx.restore();
    }

    ctx.restore();
  };

  const nextPiece = PIECE_DEFINITIONS[gameState.nextPieceShape];
  const towerMeters = Math.round(gameState.highestY / 20);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-deck-100 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-deck-800 pb-3">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-semibold text-deck-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Game Catalog</span>
        </Link>

        {/* Lives Counter */}
        <div className="flex items-center gap-1.5 rounded-lg border border-deck-800 bg-deck-900/80 px-3 py-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-400 mr-1">
            Lives
          </span>
          {[...Array(gameState.maxLives)].map((_, i) => (
            <Heart
              key={i}
              className={`h-4 w-4 transition-colors ${
                i < gameState.lives ? 'fill-rose-500 text-rose-500' : 'fill-deck-800 text-deck-700'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setGameState(startTowerGame(gameState))}
          className="inline-flex items-center gap-1.5 rounded-md border border-deck-700 bg-deck-800/80 px-3 py-1 text-xs font-medium text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left Column: Stats & Next Piece Preview */}
        <div className="flex flex-col gap-3">
          {/* Height Indicator Card */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-deck-800 bg-gradient-to-b from-deck-900/90 to-deck-950/90 p-4 text-center shadow-lg">
            <Layers className="h-6 w-6 text-amber-400 mb-1" />
            <span className="text-3xl font-black text-white">{towerMeters}m</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-400">
              Tower Altitude
            </span>
            <span className="mt-1 text-xs text-deck-500">
              {gameState.blocksPlaced} Blocks Stacked
            </span>
          </div>

          {/* Score & Combo */}
          <div className="flex flex-col gap-2 rounded-xl border border-deck-800 bg-deck-900/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-deck-400 uppercase tracking-wider">
                Score
              </span>
              <span className="text-base font-black text-amber-400">{gameState.score}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-deck-400">
              <span>Best Height</span>
              <span className="font-bold text-white">{Math.round(gameState.highScore / 20)}m</span>
            </div>

            {gameState.combo > 0 && (
              <div className="mt-1 flex items-center justify-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>Combo x{gameState.combo}!</span>
              </div>
            )}
          </div>

          {/* Next Piece Queue */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-deck-800 bg-deck-900/60 p-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-deck-400">
              Next Material
            </span>
            <div className="my-2 flex h-14 items-center justify-center">
              <div
                style={{
                  width: `${nextPiece.width * 0.7}px`,
                  height: `${nextPiece.height * 0.7}px`,
                  backgroundColor: nextPiece.color,
                  borderColor: nextPiece.borderColor,
                }}
                className="rounded border-2 shadow-sm"
              />
            </div>
            <span className="text-xs font-bold text-white">{nextPiece.name}</span>
            <span className="text-[10px] text-deck-400">Mass: {nextPiece.mass}x</span>
          </div>
        </div>

        {/* Center / Right Column: The Physics Stage */}
        <div className="flex flex-col gap-3 lg:col-span-3">
          {/* Action Log / Guidance */}
          <div
            aria-live="polite"
            className="flex items-center justify-between rounded-xl border border-deck-800 bg-deck-900/90 px-4 py-2.5 text-xs font-medium text-deck-200"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {gameState.lastMessage}
            </span>
            <span className="hidden sm:inline text-deck-500 text-[11px]">
              Keys: [A/D or Arrows] Guide · [Space] Drop · [R] Reset
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative overflow-hidden rounded-2xl border border-deck-800 bg-deck-950 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={ARENA_WIDTH}
              height={520}
              onClick={handleDrop}
              onPointerMove={handlePointerMove}
              className="h-[520px] w-full cursor-pointer touch-none"
            />

            {/* Overlays for Idle / Game Over */}
            {gameState.status !== 'playing' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-deck-950/85 p-6 backdrop-blur-sm text-center">
                {gameState.status === 'idle' ? (
                  <>
                    <Layers className="mb-2 h-14 w-14 text-amber-400" />
                    <h3 className="text-2xl font-black uppercase tracking-wider text-white">
                      Tower Builder
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-deck-300">
                      Balance physics, time your crane releases, and construct the ultimate
                      skyscraper without collapsing!
                    </p>

                    <button
                      type="button"
                      onClick={handleDrop}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Construction</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Trophy className="mb-2 h-12 w-12 text-rose-400 animate-bounce" />
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">
                      Tower Collapsed!
                    </h3>
                    <p className="mt-1 text-xs text-deck-300">
                      You reached a peak altitude of{' '}
                      <span className="font-bold text-amber-400">{towerMeters} meters</span> with{' '}
                      {gameState.blocksPlaced} blocks stacked.
                    </p>

                    <div className="my-3 flex items-center gap-4 rounded-lg border border-deck-800 bg-deck-900/90 px-4 py-2 text-xs">
                      <div>
                        <span className="text-deck-500 block uppercase text-[10px]">Score</span>
                        <span className="text-base font-bold text-white">{gameState.score}</span>
                      </div>
                      <div className="h-6 w-px bg-deck-800" />
                      <div>
                        <span className="text-deck-500 block uppercase text-[10px]">Max Combo</span>
                        <span className="text-base font-bold text-amber-400">
                          x{gameState.maxCombo}
                        </span>
                      </div>
                      <div className="h-6 w-px bg-deck-800" />
                      <div>
                        <span className="text-deck-500 block uppercase text-[10px]">
                          Perfect Drops
                        </span>
                        <span className="text-base font-bold text-emerald-400">
                          {gameState.perfectDrops}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setGameState(startTowerGame(gameState))}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Try Again</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Mobile Touch Drop Trigger Bar */}
            {gameState.status === 'playing' && (
              <div className="absolute bottom-3 inset-x-3 flex justify-center sm:hidden">
                <button
                  type="button"
                  onClick={handleDrop}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/90 py-3 text-sm font-black text-slate-950 shadow-lg active:scale-95 transition-transform"
                >
                  <ArrowDown className="h-5 w-5" />
                  <span>RELEASE BLOCK</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
