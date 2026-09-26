'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';

import {
  calculateWordScore,
  createInitialWordBattleState,
  startRound,
  stepWordBattleEngine,
  submitPlayerWord,
  type DuplicateRule,
  type WordBattleMode,
  type WordBattleState,
} from '../engine/word-battle-engine';
import { WordRack } from './WordRack';

interface WordBattleGameProps {
  roomCode?: string;
  initialPlayerName?: string;
  onExit?: () => void;
}

// Sound effects synthesizer
class SoundEffects {
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

  playTileClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playSubmitSuccess(isPangram = false) {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = isPangram ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.18);
    });
  }

  playErrorBuzz() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playShuffle() {
    const ctx = this.getContext();
    if (!ctx) return;
    for (let i = 0; i < 4; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 400, ctx.currentTime + i * 0.03);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.03 + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.03);
      osc.stop(ctx.currentTime + i * 0.03 + 0.04);
    }
  }

  playRoundEnd() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [440, 392, 349, 329.6];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
    });
  }
}

const sfx = new SoundEffects();

export const WordBattleGame: React.FC<WordBattleGameProps> = ({
  roomCode,
  initialPlayerName = 'You',
  onExit,
}) => {
  // Game state
  const [gameState, setGameState] = useState<WordBattleState>(() =>
    createInitialWordBattleState({ roomCode }, initialPlayerName),
  );

  // Active word composition
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configuration options for lobby
  const [mode, setMode] = useState<WordBattleMode>('classic');
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>('cancelled');
  const [roundDuration, setRoundDuration] = useState<number>(45);
  const [totalRounds, setTotalRounds] = useState<number>(3);
  const [botCount, setBotCount] = useState<number>(2);

  // Current composed word string
  const composedWord = useMemo(() => {
    return selectedIndices.map((idx) => gameState.currentRound.letters[idx]).join('');
  }, [selectedIndices, gameState.currentRound.letters]);

  // Projected score preview
  const previewScore = useMemo(() => {
    if (composedWord.length < 3) return null;
    return calculateWordScore(composedWord, gameState.currentRound.letters, gameState.config.mode);
  }, [composedWord, gameState.currentRound.letters, gameState.config.mode]);

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
        const next = stepWordBattleEngine(prev, dt);
        if (next.phase !== 'playing' && prev.phase === 'playing') {
          sfx.playRoundEnd();
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState.phase]);

  // Handle letter click from rack
  const handleLetterClick = useCallback(
    (_char: string, index: number) => {
      if (selectedIndices.includes(index)) return;
      sfx.playTileClick();
      setSelectedIndices((prev) => [...prev, index]);
      setErrorMessage(null);
    },
    [selectedIndices],
  );

  // Remove letter from composition
  const handleRemoveLetter = useCallback((indexToRemove: number) => {
    sfx.playTileClick();
    setSelectedIndices((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setErrorMessage(null);
  }, []);

  // Shuffle letters
  const handleShuffle = useCallback(() => {
    sfx.playShuffle();
    setGameState((prev) => {
      const letters = [...prev.currentRound.letters];
      for (let i = letters.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      return {
        ...prev,
        currentRound: {
          ...prev.currentRound,
          letters,
        },
      };
    });
    setSelectedIndices([]);
    setErrorMessage(null);
  }, []);

  // Clear word
  const handleClear = useCallback(() => {
    sfx.playTileClick();
    setSelectedIndices([]);
    setErrorMessage(null);
  }, []);

  // Submit word
  const handleSubmit = useCallback(() => {
    if (composedWord.length < 3) {
      setErrorMessage('Words must be at least 3 letters long');
      sfx.playErrorBuzz();
      return;
    }

    const { state: nextState, result } = submitPlayerWord(
      gameState,
      gameState.activePlayerId,
      composedWord,
    );

    if (result.isValid) {
      sfx.playSubmitSuccess(result.isPangram);
      setGameState(nextState);
      setSelectedIndices([]);
      setErrorMessage(null);
    } else {
      sfx.playErrorBuzz();
      if (result.reason === 'already-submitted') {
        setErrorMessage(`"${composedWord}" already found!`);
      } else if (result.reason === 'not-in-dictionary') {
        setErrorMessage(`"${composedWord}" not recognized in lexicon!`);
      } else if (result.reason === 'invalid-letters') {
        setErrorMessage('Invalid letters for this rack!');
      } else {
        setErrorMessage('Invalid word!');
      }
    }
  }, [composedWord, gameState]);

  // Keyboard navigation
  useEffect(() => {
    if (gameState.phase !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === 'ENTER') {
        e.preventDefault();
        handleSubmit();
      } else if (key === 'BACKSPACE') {
        e.preventDefault();
        setSelectedIndices((prev) => prev.slice(0, -1));
        setErrorMessage(null);
      } else if (key === 'ESCAPE') {
        e.preventDefault();
        handleClear();
      } else if (key === ' ' || key === 'SPACE') {
        e.preventDefault();
        handleShuffle();
      } else if (/^[A-Z]$/.test(key)) {
        // Find an unselected tile index matching this character
        const availableIndex = gameState.currentRound.letters.findIndex(
          (char, idx) => char === key && !selectedIndices.includes(idx),
        );
        if (availableIndex !== -1) {
          e.preventDefault();
          sfx.playTileClick();
          setSelectedIndices((prev) => [...prev, availableIndex]);
          setErrorMessage(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState.phase,
    gameState.currentRound.letters,
    selectedIndices,
    handleSubmit,
    handleClear,
    handleShuffle,
  ]);

  // Start game from lobby
  const handleStartGame = () => {
    const freshState = createInitialWordBattleState(
      {
        mode,
        duplicateRule,
        roundDurationSeconds: roundDuration,
        totalRounds,
        botCount,
        roomCode,
      },
      initialPlayerName,
    );
    setGameState(startRound(freshState, 1));
    setSelectedIndices([]);
    setErrorMessage(null);
  };

  // Next round
  const handleNextRound = () => {
    const nextRoundNum = gameState.currentRound.roundNumber + 1;
    setGameState((prev) => startRound(prev, nextRoundNum));
    setSelectedIndices([]);
    setErrorMessage(null);
  };

  // Human player
  const humanPlayer = gameState.players.find((p) => p.id === gameState.activePlayerId);

  // Active player's submissions this round
  const humanSubmissions = useMemo(() => {
    return gameState.submissions.filter((s) => s.playerId === gameState.activePlayerId);
  }, [gameState.submissions, gameState.activePlayerId]);

  // Timer formatting
  const timeSecs = Math.ceil(gameState.currentRound.timeRemaining);
  const isUrgent = timeSecs <= 10 && gameState.phase === 'playing';

  // Team totals if team mode
  const teamScores = useMemo(() => {
    if (gameState.config.mode !== 'team-battle') return null;
    const red = gameState.players
      .filter((p) => p.team === 'red')
      .reduce((sum, p) => sum + p.score + (gameState.phase === 'playing' ? p.roundScore : 0), 0);
    const blue = gameState.players
      .filter((p) => p.team === 'blue')
      .reduce((sum, p) => sum + p.score + (gameState.phase === 'playing' ? p.roundScore : 0), 0);
    return { red, blue };
  }, [gameState.players, gameState.config.mode, gameState.phase]);

  // Ranked players for standings / game over
  const rankedPlayers = useMemo(() => {
    return [...gameState.players].sort((a, b) => b.score - a.score);
  }, [gameState.players]);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-start min-h-[640px] text-slate-100 font-sans p-2 sm:p-4 select-none">
      {/* PlayDeck Voice Dock */}
      <RoomVoiceDock />

      {/* ----------------- PHASE: LOBBY ----------------- */}
      {gameState.phase === 'lobby' && (
        <div className="w-full flex flex-col items-center justify-center gap-6 py-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <span>⚔️ Real-Time Vocabulary Showdown</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Word Battle
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
              Same letters for every player. Race against the clock, unearth rare words, and
              eliminate opponents by avoiding duplicate submissions!
            </p>
          </div>

          {/* Lobby Configuration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {/* Game Mode */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Battle Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                {[
                  { id: 'classic', label: 'Classic', desc: 'Standard word race' },
                  { id: 'speed', label: 'Speed Rush', desc: '30s rapid rounds' },
                  { id: 'longest-word', label: 'Longest Word', desc: 'Big length bonuses' },
                  { id: 'anagram-battle', label: 'Anagram', desc: 'Hunt the full word' },
                  { id: 'team-battle', label: 'Team Battle', desc: 'Red vs Blue squad' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as WordBattleMode)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      mode === m.id
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{m.label}</div>
                    <div className="text-[10px] text-slate-400">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duplicate Elimination Rule */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Duplicate Word Rule
              </label>
              <div className="flex flex-col gap-2 text-xs">
                {[
                  {
                    id: 'cancelled',
                    label: 'Cancelled (0 pts)',
                    desc: 'Shared words score zero points for both players',
                  },
                  {
                    id: 'reduced',
                    label: 'Reduced (50% pts)',
                    desc: 'Shared words are penalized by half',
                  },
                  {
                    id: 'none',
                    label: 'Friendly (100% pts)',
                    desc: 'All valid words keep full score',
                  },
                ].map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => setDuplicateRule(rule.id as DuplicateRule)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      duplicateRule === rule.id
                        ? 'bg-amber-500/20 border-amber-500 text-white'
                        : 'bg-[#162032] border-[#25334d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{rule.label}</div>
                    <div className="text-[10px] text-slate-400">{rule.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Match Duration & Rounds */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Round Duration & Rounds
              </label>
              <div className="flex items-center gap-2">
                {[30, 45, 60].map((sec) => (
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
            </div>

            {/* AI Opponents */}
            <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] space-y-3">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                AI Opponents
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
              <p className="text-[11px] text-slate-400">
                Play against LexiBot, WordSmith, VocabViper, and AnagramAce.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
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
              Start Battle
            </button>
          </div>
        </div>
      )}

      {/* ----------------- PHASE: PLAYING ----------------- */}
      {gameState.phase === 'playing' && (
        <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
          {/* Top HUD: Round info, Timer bar, Player score */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#0f172a]/90 border border-[#232f45] shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold px-2.5 py-1">
                Round {gameState.currentRound.roundNumber} / {gameState.currentRound.totalRounds}
              </Badge>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline">
                {gameState.config.mode.replace('-', ' ')}
              </span>
            </div>

            {/* Countdown Timer */}
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

            {/* Active player stats */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Round Score
                </div>
                <div className="text-base sm:text-lg font-black text-amber-400">
                  {humanPlayer?.roundScore ?? 0}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shadow-sm">
                🦊
              </div>
            </div>
          </div>

          {/* Team score banner if team mode */}
          {teamScores && (
            <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0f172a] border border-[#232f45] text-xs font-bold">
              <div className="flex items-center gap-2 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Team Red: {teamScores.red} pts</span>
              </div>
              <div className="text-slate-500">VS</div>
              <div className="flex items-center gap-2 text-sky-400">
                <span>Team Blue: {teamScores.blue} pts</span>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              </div>
            </div>
          )}

          {/* Composed Word Input Display */}
          <div className="w-full max-w-xl flex flex-col items-center gap-2 my-2">
            <div className="relative w-full min-h-[68px] sm:min-h-[76px] p-2 sm:p-3 rounded-2xl bg-[#0b101d] border-2 border-[#2b3a55] flex items-center justify-center gap-1.5 sm:gap-2 shadow-inner">
              {selectedIndices.length === 0 ? (
                <span className="text-slate-500 text-sm italic font-mono select-none">
                  Click letters or type on keyboard...
                </span>
              ) : (
                selectedIndices.map((letterIdx, pos) => {
                  const char = gameState.currentRound.letters[letterIdx];
                  return (
                    <button
                      key={`placed-${pos}`}
                      type="button"
                      onClick={() => handleRemoveLetter(pos)}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg bg-gradient-to-b from-[#232f48] to-[#161f30] border-2 border-indigo-400/80 text-white font-mono font-black text-xl sm:text-2xl flex items-center justify-center shadow-md active:scale-95 transition-all hover:border-red-400 group"
                      title="Click to remove"
                    >
                      <span className="group-hover:opacity-20">{char}</span>
                      <span className="absolute hidden group-hover:block text-xs text-red-400">
                        ✕
                      </span>
                    </button>
                  );
                })
              )}

              {/* Projected Points preview pill */}
              {previewScore && (
                <div className="absolute right-3 top-2 sm:top-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <span>+{previewScore.totalScore}</span>
                  {previewScore.isPangram && <span>★</span>}
                </div>
              )}
            </div>

            {/* Error message / Warning banner */}
            {errorMessage && (
              <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-lg animate-bounce">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Letter Rack */}
          <WordRack
            letters={gameState.currentRound.letters}
            selectedIndices={selectedIndices}
            onLetterClick={handleLetterClick}
            onShuffle={handleShuffle}
            onClear={handleClear}
            onSubmit={handleSubmit}
          />

          {/* Grid: Submissions feed & Opponents roster */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Found words this round */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#0f172a]/80 border border-[#232f45] flex flex-col gap-2.5 max-h-56 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-[#232f45] pb-2">
                <span>Your Words ({humanSubmissions.length})</span>
                <span className="text-amber-400 font-mono">
                  {humanPlayer?.comboStreak && humanPlayer.comboStreak > 1
                    ? `🔥 ${humanPlayer.comboStreak}x Streak`
                    : ''}
                </span>
              </div>

              {humanSubmissions.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-6">
                  No words submitted yet. Find as many as you can!
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {humanSubmissions.map((sub, idx) => (
                    <div
                      key={`${sub.word}-${idx}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#162238] border border-[#2a3c5d] text-xs font-bold text-slate-100 shadow-sm"
                    >
                      <span>{sub.word}</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        +{sub.totalScore}
                      </span>
                      {sub.isPangram && <span className="text-amber-400 text-xs">★</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Competitors live status */}
            <div className="p-3 sm:p-4 rounded-2xl bg-[#0f172a]/80 border border-[#232f45] flex flex-col gap-2 max-h-56 overflow-y-auto">
              <div className="text-xs font-bold text-slate-300 border-b border-[#232f45] pb-2">
                Live Opponents
              </div>

              <div className="flex flex-col gap-2">
                {gameState.players
                  .filter((p) => p.id !== gameState.activePlayerId)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#141d2e] border border-[#223048] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{player.avatar}</span>
                        <div>
                          <div className="font-bold text-slate-200 flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {player.team && (
                              <span
                                className={`text-[9px] px-1 rounded uppercase font-semibold ${
                                  player.team === 'red'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-sky-500/20 text-sky-300'
                                }`}
                              >
                                {player.team}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {player.wordsSubmitted.length} words found
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-400">
                          {player.score + player.roundScore} pts
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {(player.nextBotSubmitCooldown ?? 0) <= 1.5 ? (
                            <span className="text-indigo-400 animate-pulse">Typing...</span>
                          ) : (
                            'Thinking'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
              Word Clash & Scored Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {gameState.config.duplicateRule === 'cancelled'
                ? 'Duplicate words shared between players were cancelled (0 points)!'
                : gameState.config.duplicateRule === 'reduced'
                  ? 'Duplicate words received a 50% score penalty!'
                  : 'All words counted for full points!'}
            </p>
          </div>

          {/* Clash breakdown list */}
          <div className="w-full max-w-2xl p-4 rounded-2xl bg-[#0f172a] border border-[#232f45] shadow-xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Submitted Words ({gameState.submissions.length})
            </h3>

            {gameState.submissions.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">
                No words were submitted in this round.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
                {gameState.submissions.map((sub, idx) => (
                  <div
                    key={`${sub.word}-${sub.playerId}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      sub.isDuplicate
                        ? 'bg-rose-950/20 border-rose-500/40 text-slate-300'
                        : 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className={sub.isDuplicate ? 'line-through text-slate-400' : 'text-white'}
                        >
                          {sub.word}
                        </span>
                        {sub.isPangram && (
                          <span className="text-amber-400" title="Full rack pangram">
                            ★
                          </span>
                        )}
                        {sub.isLongestWord && (
                          <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300">
                            Longest
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {sub.playerName}
                        {sub.isDuplicate && ' (Clashed)'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          sub.isDuplicate && sub.totalScore === 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        +{sub.totalScore}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Standings */}
          <div className="w-full max-w-2xl p-4 rounded-2xl bg-[#0f172a] border border-[#232f45] shadow-xl flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Match Standings
            </h3>
            <div className="flex flex-col gap-1.5">
              {rankedPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#162032] border border-[#273650] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <span className="text-base">{player.avatar}</span>
                    <span className="font-bold text-white">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400">
                      +{player.roundScore} this round
                    </span>
                    <span className="font-mono font-extrabold text-amber-400">
                      {player.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Round Button */}
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
              🏆 Match Concluded
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Final Standings
            </h2>
            <p className="text-sm text-slate-400">
              The lexicon champion has emerged from the battle!
            </p>
          </div>

          {/* Leaderboard Table */}
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
                            Champion
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total score: {player.score} points
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-extrabold text-lg text-amber-400">
                    {player.score}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Play Again Button */}
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
                  createInitialWordBattleState(
                    {
                      mode,
                      duplicateRule,
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
