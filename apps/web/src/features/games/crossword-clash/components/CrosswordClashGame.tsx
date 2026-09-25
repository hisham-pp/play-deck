'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge, Button } from '@/components/ui';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';

import {
  createInitialCrosswordState,
  cycleCrosswordClue,
  deleteCrosswordLetter,
  getPuzzleCatalog,
  inputCrosswordLetter,
  navigateCrosswordCursor,
  selectCrosswordCell,
  selectCrosswordClue,
  startCrosswordGame,
  stepCrosswordEngine,
  type CrosswordDifficulty,
  type CrosswordMode,
  type CrosswordState,
  type CrosswordTheme,
} from '../engine/crossword-clash-engine';
import { ClueList } from './ClueList';
import { CrosswordGrid } from './CrosswordGrid';

interface CrosswordClashGameProps {
  roomCode?: string;
  initialPlayerName?: string;
  onExit?: () => void;
}

// Web Audio synthesizer for arcade sound effects
class CrosswordAudio {
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

  playKey() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  playWordComplete() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
    });
  }

  playError() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  }
}

const audio = new CrosswordAudio();

export const CrosswordClashGame: React.FC<CrosswordClashGameProps> = ({
  roomCode = 'WORD-CLASH',
  initialPlayerName = 'Player 1',
  onExit,
}) => {
  // Lobby configuration state
  const [selectedTheme, setSelectedTheme] = useState<CrosswordTheme>('science');
  const [selectedDifficulty, setSelectedDifficulty] = useState<CrosswordDifficulty>('easy');
  const [selectedMode, setSelectedMode] = useState<CrosswordMode>('race');
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active game engine state
  const [gameState, setGameState] = useState<CrosswordState>(() =>
    createInitialCrosswordState({
      theme: selectedTheme,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      players: [{ id: 'player-1', name: initialPlayerName, isBot: false }],
      highContrast,
      largeText,
    }),
  );

  const prevSolvedCountRef = useRef(0);
  const prevCompletedCluesCountRef = useRef(0);

  // Engine game loop (dt accumulator)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      setGameState((prev) => {
        if (prev.status === 'lobby' || prev.status === 'completed') {
          return prev;
        }
        return stepCrosswordEngine(prev, dt);
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Audio trigger reactions to state changes
  useEffect(() => {
    if (!soundEnabled) return;

    // Correct letter sound
    if (gameState.solvedLettersCount > prevSolvedCountRef.current) {
      audio.playCorrect();
    }
    prevSolvedCountRef.current = gameState.solvedLettersCount;

    // Word completion fanfare
    const completedCluesCount = gameState.clues.filter((c) => c.isCompleted).length;
    if (completedCluesCount > prevCompletedCluesCountRef.current) {
      audio.playWordComplete();
    }
    prevCompletedCluesCountRef.current = completedCluesCount;

    // Victory sound
    if (
      gameState.status === 'completed' &&
      gameState.solvedLettersCount >= gameState.totalLettersToSolve
    ) {
      audio.playVictory();
    }
  }, [gameState.solvedLettersCount, gameState.clues, gameState.status, soundEnabled]);

  // Handle cell click
  const handleSelectCell = useCallback(
    (row: number, col: number) => {
      if (soundEnabled) audio.playKey();
      setGameState((prev) => selectCrosswordCell(prev, row, col));
    },
    [soundEnabled],
  );

  // Handle clue click
  const handleSelectClue = useCallback(
    (clueId: string) => {
      if (soundEnabled) audio.playKey();
      setGameState((prev) => selectCrosswordClue(prev, clueId));
    },
    [soundEnabled],
  );

  // Handle letter typing
  const handleTypeLetter = useCallback(
    (char: string) => {
      if (gameState.status !== 'playing') return;
      if (soundEnabled) audio.playKey();

      setGameState((prev) => {
        const next = inputCrosswordLetter(prev, 'player-1', char);
        // Play error sound if guess failed
        const cell = next.cells[prev.selectedRow]?.[prev.selectedCol];
        if (cell?.isError && soundEnabled) {
          audio.playError();
        }
        return next;
      });
    },
    [gameState.status, soundEnabled],
  );

  // Handle backspace / deletion
  const handleDelete = useCallback(() => {
    if (soundEnabled) audio.playKey();
    setGameState((prev) => deleteCrosswordLetter(prev));
  }, [soundEnabled]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;

      // Ignore if user is typing into an input field or modal
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleTypeLetter(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setGameState((prev) => navigateCrosswordCursor(prev, 'up'));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setGameState((prev) => navigateCrosswordCursor(prev, 'down'));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setGameState((prev) => navigateCrosswordCursor(prev, 'left'));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setGameState((prev) => navigateCrosswordCursor(prev, 'right'));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setGameState((prev) => cycleCrosswordClue(prev, e.shiftKey ? -1 : 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        // Toggle direction
        setGameState((prev) => selectCrosswordCell(prev, prev.selectedRow, prev.selectedCol));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handleTypeLetter, handleDelete]);

  // Start puzzle action
  const handleStartGame = () => {
    const newState = createInitialCrosswordState({
      theme: selectedTheme,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      players: [{ id: 'player-1', name: initialPlayerName, isBot: false }],
      highContrast,
      largeText,
    });
    setGameState(startCrosswordGame(newState));
  };

  // Next puzzle action
  const handleNextPuzzle = () => {
    const catalog = getPuzzleCatalog();
    const currentIdx = catalog.findIndex((p) => p.id === gameState.puzzleId);
    const nextPuzzle = catalog[(currentIdx + 1) % catalog.length];

    setSelectedTheme(nextPuzzle.theme);
    setSelectedDifficulty(nextPuzzle.difficulty);

    const newState = createInitialCrosswordState({
      puzzleId: nextPuzzle.id,
      theme: nextPuzzle.theme,
      difficulty: nextPuzzle.difficulty,
      mode: gameState.mode,
      players: [{ id: 'player-1', name: initialPlayerName, isBot: false }],
      highContrast,
      largeText,
    });
    setGameState(startCrosswordGame(newState));
  };

  // Format seconds mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sorted players by score
  const sortedPlayers = useMemo(() => {
    return [...gameState.players].sort((a, b) => b.score - a.score);
  }, [gameState.players]);

  const activeClue = gameState.clues.find((c) => c.id === gameState.selectedClueId);

  // QWERTY keyboard rows for tactile on-screen typing
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div
      className={`min-h-[680px] w-full flex flex-col justify-between p-3 sm:p-5 rounded-2xl border transition-colors ${
        highContrast
          ? 'bg-black text-white border-white'
          : 'bg-slate-950 text-slate-100 border-slate-800'
      }`}
    >
      {/* Top Bar / HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-lg shadow-sm">
            ✛
          </div>
          <div>
            <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight text-slate-100">
              {gameState.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className="capitalize text-[10px] py-0 px-1.5 border-slate-700"
              >
                {gameState.theme}
              </Badge>
              <Badge
                variant="outline"
                className="capitalize text-[10px] py-0 px-1.5 border-slate-700"
              >
                {gameState.difficulty}
              </Badge>
              <Badge
                variant="outline"
                className={`capitalize text-[10px] py-0 px-1.5 ${
                  gameState.mode === 'team'
                    ? 'border-blue-500/60 text-blue-400'
                    : gameState.mode === 'race'
                      ? 'border-amber-500/60 text-amber-400'
                      : 'border-emerald-500/60 text-emerald-400'
                }`}
              >
                {gameState.mode} mode
              </Badge>
            </div>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          {gameState.status === 'playing' && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base ${
                gameState.timeRemaining < 30
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-amber-400'
              }`}
            >
              <span className="text-xs text-slate-400">TIME</span>
              <span>{formatTime(gameState.timeRemaining)}</span>
            </div>
          )}

          {gameState.mode === 'turn-based' && gameState.status === 'playing' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Turn:</span>
              <span
                className="font-bold"
                style={{ color: gameState.players[gameState.activePlayerIndex]?.color }}
              >
                {gameState.players[gameState.activePlayerIndex]?.name}
              </span>
              <span className="text-amber-400">({Math.ceil(gameState.turnTimeRemaining)}s)</span>
            </div>
          )}

          {/* Accessibility & Audio Toggles */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setHighContrast((prev) => !prev)}
              title="Toggle High Contrast"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                highContrast ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HC
            </button>
            <button
              type="button"
              onClick={() => setLargeText((prev) => !prev)}
              title="Toggle Large Text"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                largeText ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className={`px-2 py-1 text-xs rounded-lg transition-all ${
                soundEnabled ? 'text-amber-400' : 'text-slate-600 line-through'
              }`}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>

          {onExit && (
            <Button variant="ghost" size="sm" onClick={onExit} className="text-xs text-slate-400">
              Exit
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 my-4 flex flex-col items-center justify-center">
        {/* ==========================================
            LOBBY SCREEN
            ========================================== */}
        {gameState.status === 'lobby' && (
          <div className="w-full max-w-xl flex flex-col gap-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center">
            <div>
              <span className="text-3xl">📰 ✦ 🔠</span>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-2">
                Crossword Clash
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
                Race rival solvers, lock in letters, claim word bonuses, and collaborate or duel on
                live crossword grids.
              </p>
            </div>

            {/* Mode Picker */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Game Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['solo', 'race', 'turn-based', 'team'] as CrosswordMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedMode(mode)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      selectedMode === mode
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Picker */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Select Theme Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  ['science', 'geography', 'general', 'sports', 'pop-culture'] as CrosswordTheme[]
                ).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      selectedTheme === theme
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {theme.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Picker */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Select Difficulty & Grid Size
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as CrosswordDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {diff} (
                    {diff === 'easy'
                      ? '4x4 Mini'
                      : diff === 'medium'
                        ? '5x5 Pinwheel'
                        : '7x7 Arena'}
                    )
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStartGame}
              className="w-full py-4 text-sm font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20"
            >
              Start Crossword Clash ➔
            </Button>
          </div>
        )}

        {/* ==========================================
            COUNTDOWN SCREEN
            ========================================== */}
        {gameState.status === 'countdown' && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 animate-pulse">
            <span className="text-7xl font-black text-amber-400 tracking-tighter">
              {Math.ceil(gameState.countdownTimer)}
            </span>
            <p className="text-sm font-mono uppercase tracking-widest text-slate-400">
              Prepare to fill the grid!
            </p>
          </div>
        )}

        {/* ==========================================
            ACTIVE GAMEPLAY SCREEN
            ========================================== */}
        {gameState.status === 'playing' && (
          <div className="w-full flex flex-col gap-4">
            {/* Active Clue Highlight Banner */}
            <div
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg transition-colors ${
                highContrast
                  ? 'bg-zinc-900 border-yellow-400 text-white'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-black/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-xs shrink-0">
                  {activeClue?.id ?? '1A'}
                </span>
                <span
                  className={`font-semibold ${
                    largeText ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                  } ${highContrast ? 'text-yellow-300' : 'text-amber-200'}`}
                >
                  {activeClue?.text ?? 'Select a clue to begin'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                Direction:{' '}
                <button
                  type="button"
                  onClick={() =>
                    setGameState((prev) =>
                      selectCrosswordCell(prev, prev.selectedRow, prev.selectedCol),
                    )
                  }
                  className="font-bold underline text-amber-400 hover:text-amber-300 uppercase"
                >
                  {gameState.selectedDirection} ⇄
                </button>
              </span>
            </div>

            {/* Notification Toasts */}
            {gameState.notifications.length > 0 && (
              <div className="flex flex-col gap-1 items-center justify-center">
                {gameState.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="py-1 px-3 rounded-full text-xs font-bold shadow-md animate-bounce bg-amber-400 text-slate-950 border border-amber-300"
                  >
                    ✦ {notif.text}
                  </div>
                ))}
              </div>
            )}

            {/* Grid + Clues Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Grid Column */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center gap-4">
                <CrosswordGrid
                  cells={gameState.cells}
                  selectedRow={gameState.selectedRow}
                  selectedCol={gameState.selectedCol}
                  selectedDirection={gameState.selectedDirection}
                  selectedClueId={gameState.selectedClueId}
                  highContrast={highContrast}
                  largeText={largeText}
                  onSelectCell={handleSelectCell}
                />

                {/* Progress bar */}
                <div className="w-full max-w-sm flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Grid Completion</span>
                    <span>
                      {gameState.solvedLettersCount} / {gameState.totalLettersToSolve} cells (
                      {Math.round(
                        (gameState.solvedLettersCount / gameState.totalLettersToSolve) * 100,
                      )}
                      %)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (gameState.solvedLettersCount / gameState.totalLettersToSolve) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Clues Column */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <ClueList
                  clues={gameState.clues}
                  players={gameState.players}
                  selectedClueId={gameState.selectedClueId}
                  highContrast={highContrast}
                  largeText={largeText}
                  onSelectClue={handleSelectClue}
                />

                {/* Scoreboard Roster */}
                <div className="rounded-xl p-3 bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Solvers Scoreboard
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {sortedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="text-xs font-bold truncate text-slate-200">
                            {player.name}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {player.score}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {player.wordsCompleted} words
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Virtual On-Screen Keyboard */}
            <div className="w-full max-w-xl mx-auto flex flex-col gap-1.5 mt-2 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
              {keyboardRows.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="flex justify-center gap-1 sm:gap-1.5">
                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTypeLetter(key)}
                      className="w-8 h-10 sm:w-10 sm:h-11 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-100 font-black text-sm sm:text-base flex items-center justify-center shadow transition-all"
                    >
                      {key}
                    </button>
                  ))}
                  {rowIdx === 2 && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 sm:px-3 h-10 sm:h-11 rounded-lg bg-red-950/60 hover:bg-red-900/60 active:scale-95 border border-red-800/80 text-red-200 font-bold text-xs flex items-center justify-center shadow transition-all"
                    >
                      ⌫ DEL
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setGameState((prev) => cycleCrosswordClue(prev, -1))}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
                >
                  ◀ Prev Clue
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setGameState((prev) =>
                      selectCrosswordCell(prev, prev.selectedRow, prev.selectedCol),
                    )
                  }
                  className="px-4 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/50"
                >
                  ⇄ Toggle Across/Down
                </button>
                <button
                  type="button"
                  onClick={() => setGameState((prev) => cycleCrosswordClue(prev, 1))}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700"
                >
                  Next Clue ▶
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            GAME OVER / VICTORY MODAL
            ========================================== */}
        {gameState.status === 'completed' && (
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col items-center gap-5 text-center animate-fade-in">
            <span className="text-5xl">🏆</span>
            <div>
              <h2 className="text-2xl font-black text-slate-100">
                {gameState.solvedLettersCount >= gameState.totalLettersToSolve
                  ? 'Puzzle Completed!'
                  : 'Time Expired!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {gameState.title} ({gameState.theme} · {gameState.difficulty})
              </p>
            </div>

            {/* Final Standings */}
            <div className="w-full flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
                Final Standings
              </span>
              <div className="flex flex-col gap-1.5">
                {sortedPlayers.map((player, rank) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      rank === 0
                        ? 'bg-amber-500/20 border-amber-400/80 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-sm w-4">
                        {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="font-bold text-sm">{player.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>{player.lettersSolved} letters</span>
                      <span>{player.wordsCompleted} words</span>
                      <span className="font-black text-base text-amber-400">
                        {player.score} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300"
                onClick={() => setGameState((prev) => ({ ...prev, status: 'lobby' }))}
              >
                Change Setup
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                onClick={handleNextPuzzle}
              >
                Play Next Puzzle ➔
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Dock Integration */}
      <div className="pt-3 border-t border-slate-800">
        <RoomVoiceDock anchorClassName="!static" />
      </div>
    </div>
  );
};
