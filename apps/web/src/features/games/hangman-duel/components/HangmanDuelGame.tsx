'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button } from '@playdeck/ui';
import { StorageService } from '@/lib/storage/storage';
import { usePlayerStore } from '@/stores/player.store';
import { getRandomWord } from '../engine/hangman-bank';
import {
  createInitialState,
  getMaskedWord,
  getPlayerBoard,
  proceedToNextRound,
  startRound,
  submitLetterGuess,
} from '../engine/hangman-engine';
import type {
  HangmanCategory,
  HangmanDifficulty,
  HangmanMode,
  HangmanRules,
  HangmanState,
} from '../types/hangman-duel.types';

const STORAGE_HIGH_SCORE_KEY = 'hangman_duel_high_score';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export function HangmanDuelGame() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordGamePlayed = usePlayerStore((s) => s.recordGamePlayed);

  const [mode, setMode] = useState<HangmanMode>('solo');
  const [category, setCategory] = useState<HangmanCategory | null>(null);
  const [difficulty, setDifficulty] = useState<HangmanDifficulty>('medium');
  const [highScore, setHighScore] = useState(0);

  const createGame = useCallback(
    (m: HangmanMode, cat: HangmanCategory | null, diff: HangmanDifficulty) => {
      const rules: HangmanRules = {
        mode: m,
        category: cat,
        difficulty: diff,
        allowedMisses: 6,
        totalRounds: 3,
        turnSeconds: 15,
        showCategory: true,
        revealFirstLetter: false,
      };

      const playerConfigs =
        m === 'solo'
          ? [{ id: 'p1', name: 'Player 1' }]
          : [
              { id: 'p1', name: 'Player 1' },
              { id: 'p2', name: 'Player 2' },
            ];

      const initial = createInitialState(rules, playerConfigs);
      const randomWord = getRandomWord(cat, diff);
      startRound(initial, randomWord.word, randomWord.category);
      return initial;
    },
    [],
  );

  const [state, setState] = useState<HangmanState>(() => createGame(mode, category, difficulty));

  const playSound = useCallback((type: 'hit' | 'miss' | 'solve' | 'lose') => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
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

      if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'solve') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        osc.frequency.setValueAtTime(1046.5, now + 0.3);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Audio suspended or blocked
    }
  }, []);

  useEffect(() => {
    async function loadScore() {
      const saved = await StorageService.get<number>(STORAGE_HIGH_SCORE_KEY);
      if (typeof saved === 'number') {
        setHighScore(saved);
      }
    }
    void loadScore();
  }, []);

  const handleGuess = useCallback(
    (letter: string) => {
      if (state.status !== 'guessing') return;

      const activePlayerId = state.players[state.turnIndex]?.id || 'p1';
      const board = getPlayerBoard(state, activePlayerId);
      const prevWrong = board.wrongCount;
      const prevSolved = board.solved;

      const next = { ...state };
      submitLetterGuess(next, activePlayerId, letter, Date.now());

      const nextBoard = getPlayerBoard(next, activePlayerId);
      if (nextBoard.solved && !prevSolved) {
        playSound('solve');
      } else if (nextBoard.wrongCount > prevWrong) {
        playSound('miss');
      } else {
        playSound('hit');
      }

      if (next.status === 'round-over' || next.status === 'finished') {
        const topScore = Math.max(...next.players.map((p) => p.score));
        if (topScore > highScore) {
          setHighScore(topScore);
          void StorageService.set(STORAGE_HIGH_SCORE_KEY, topScore);
        }
        void recordGamePlayed(next.winnerIds.includes('p1'), 'puzzle', 'hangman-duel', topScore);
      }

      setState({ ...next });
    },
    [state, highScore, playSound, recordGamePlayed],
  );

  // Physical keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (/^[a-zA-Z]$/.test(e.key)) {
        handleGuess(e.key.toLowerCase());
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  const handleNextRound = () => {
    const next = { ...state };
    proceedToNextRound(next);
    setState({ ...next });
  };

  const handleRestartGame = () => {
    setState(createGame(mode, category, difficulty));
  };

  const activePlayer = state.players[state.turnIndex] || state.players[0]!;
  const activeBoard = getPlayerBoard(state, activePlayer.id);
  const maskedSecret = getMaskedWord(state, activePlayer.id);
  const missesLeft = Math.max(0, state.rules.allowedMisses - activeBoard.wrongCount);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 rounded-xl max-w-4xl mx-auto shadow-2xl border border-slate-800">
      {/* Top Header Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 font-mono">
            ROUND {state.round} / {state.rules.totalRounds}
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-500/50 text-amber-400 font-mono uppercase"
          >
            CATEGORY: {state.category || 'RANDOM'}
          </Badge>
          <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 font-mono">
            SCORE: {activePlayer.score}
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300 font-mono">
            BEST: {highScore}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextMode: HangmanMode = mode === 'solo' ? 'classic' : 'solo';
              setMode(nextMode);
              setState(createGame(nextMode, category, difficulty));
            }}
            className="text-xs"
          >
            {mode === 'solo' ? 'Mode: Solo Practice' : 'Mode: 2P Versus'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const categories: (HangmanCategory | null)[] = [
                null,
                'animals',
                'movies',
                'food',
                'places',
                'professions',
                'objects',
              ];
              const curIdx = categories.indexOf(category);
              const nextCat = categories[(curIdx + 1) % categories.length] ?? null;
              setCategory(nextCat);
              setState(createGame(mode, nextCat, difficulty));
            }}
            className="text-xs uppercase"
          >
            Cat: {category || 'ALL'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextDiff: HangmanDifficulty =
                difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
              setDifficulty(nextDiff);
              setState(createGame(mode, category, nextDiff));
            }}
            className="text-xs uppercase"
          >
            Diff: {difficulty}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestartGame} className="text-xs">
            Restart
          </Button>
        </div>
      </div>

      {/* Main Duel Stage (Gallows + Word Display) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/60 p-6 rounded-xl border border-slate-800 mb-6">
        {/* Neon Gallows SVG */}
        <div className="flex flex-col items-center justify-center">
          <svg viewBox="0 0 200 220" width="200" height="220" className="overflow-visible">
            {/* Gallows Base */}
            <line
              x1="20"
              y1="200"
              x2="180"
              y2="200"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Vertical Beam */}
            {activeBoard.wrongCount >= 1 && (
              <line
                x1="50"
                y1="200"
                x2="50"
                y2="20"
                stroke="#475569"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}
            {/* Top Beam */}
            {activeBoard.wrongCount >= 2 && (
              <>
                <line
                  x1="50"
                  y1="20"
                  x2="140"
                  y2="20"
                  stroke="#475569"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="50"
                  y1="50"
                  x2="80"
                  y2="20"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </>
            )}
            {/* Rope & Noose */}
            {activeBoard.wrongCount >= 3 && (
              <line
                x1="140"
                y1="20"
                x2="140"
                y2="55"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="3,2"
              />
            )}
            {/* Stickman Head */}
            {activeBoard.wrongCount >= 4 && (
              <circle cx="140" cy="70" r="15" fill="#0f172a" stroke="#f43f5e" strokeWidth="3.5" />
            )}
            {/* Torso & Arms */}
            {activeBoard.wrongCount >= 5 && (
              <>
                <line
                  x1="140"
                  y1="85"
                  x2="140"
                  y2="135"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="140"
                  y1="100"
                  x2="115"
                  y2="115"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="140"
                  y1="100"
                  x2="165"
                  y2="115"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </>
            )}
            {/* Legs (Dead / Staggered) */}
            {activeBoard.wrongCount >= 6 && (
              <>
                <line
                  x1="140"
                  y1="135"
                  x2="120"
                  y2="175"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="140"
                  y1="135"
                  x2="160"
                  y2="175"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
          <div className="mt-2 text-xs font-mono text-slate-400">
            STRIKES REMAINING: <span className="text-amber-400 font-bold">{missesLeft}</span> / 6
          </div>
        </div>

        {/* Word Mystery Blanks */}
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="text-sm font-mono text-slate-400">
            {mode !== 'solo' ? `TURN: ${activePlayer.name}` : 'GUESS THE SECRET PHRASE'}
          </div>

          {/* Masked Letter Slots */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {maskedSecret.map((char, i) => (
              <div
                key={i}
                className="w-9 h-12 flex items-center justify-center border-b-4 border-cyan-500 text-2xl font-black font-mono text-cyan-200 uppercase bg-slate-800/40 rounded-t-md"
              >
                {char !== '_' ? char : ''}
              </div>
            ))}
          </div>

          {state.message && (
            <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-full border border-cyan-800/40">
              {state.message}
            </div>
          )}

          {/* Round Outcome Notification */}
          {state.status === 'round-over' && (
            <div className="flex flex-col items-center gap-3 p-4 bg-slate-800/80 rounded-xl border border-amber-500/50">
              <div className="text-base font-bold font-mono text-amber-300">
                {activeBoard.solved ? 'ROUND SOLVED!' : 'OUT OF GUESSES!'}
              </div>
              <div className="text-xs font-mono text-slate-300">
                The word was:{' '}
                <span className="text-amber-400 font-black uppercase">{state.secret}</span>
              </div>
              <Button
                onClick={handleNextRound}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Next Round
              </Button>
            </div>
          )}

          {state.status === 'finished' && (
            <div className="flex flex-col items-center gap-3 p-4 bg-slate-800/80 rounded-xl border border-cyan-500/50">
              <div className="text-lg font-bold font-mono text-cyan-400">DUEL COMPLETE!</div>
              <div className="text-xs font-mono text-slate-300">
                WINNER: <span className="text-cyan-300 font-bold">{state.players[0]?.name}</span>
              </div>
              <Button
                onClick={handleRestartGame}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Onscreen QWERTY Keyboard */}
      <div className="w-full flex flex-col items-center gap-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-1.5 w-full">
            {row.map((letter) => {
              const lower = letter.toLowerCase();
              const isHit = activeBoard.guessedLetters.includes(lower);
              const isMiss = activeBoard.wrongLetters.includes(lower);
              const isUsed = isHit || isMiss;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={isUsed || state.status !== 'guessing'}
                  onClick={() => handleGuess(lower)}
                  className={`min-w-[32px] sm:min-w-[42px] h-11 px-2 rounded-lg font-mono font-bold text-sm transition-all shadow-md ${
                    isHit
                      ? 'bg-emerald-600/60 border border-emerald-400 text-emerald-100 opacity-60 cursor-not-allowed'
                      : isMiss
                        ? 'bg-rose-950/60 border border-rose-800 text-rose-400 opacity-40 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 border border-slate-700 text-slate-100 hover:border-cyan-500 cursor-pointer'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
