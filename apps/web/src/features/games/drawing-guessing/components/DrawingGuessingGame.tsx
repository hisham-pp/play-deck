'use client';

import {
  ArrowRight,
  Bot,
  HelpCircle,
  MessageSquare,
  Paintbrush,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  addStroke,
  BOT_SKETCHES,
  clearCanvas,
  createInitialDrawingState,
  getMaskedWord,
  nextRound,
  selectSecretWord,
  stepDrawingTimer,
  submitGuess,
  undoLastStroke,
  type DrawingGuessingState,
  type DrawingStroke,
  type WordOption,
} from '../engine/drawing-guessing-engine';
import { DrawingCanvas } from './DrawingCanvas';

export function DrawingGuessingGame() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [guessInput, setGuessInput] = useState('');

  const [gameState, setGameState] = useState<DrawingGuessingState>(() =>
    createInitialDrawingState({ playerCount: 4, maxRounds: 3, roundDuration: 60 }),
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const botDrawTimerRef = useRef<NodeJS.Timeout | null>(null);
  const botGuessTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [gameState.chatMessages]);

  // Audio synthesizer via Web Audio API
  const playSound = useCallback(
    (type: 'correct' | 'near_miss' | 'tick' | 'round_end' | 'select' | 'win') => {
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
          case 'correct':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
            osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
          case 'near_miss':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(466.16, now + 0.1);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
            break;
          case 'tick':
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;
          case 'round_end':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(392, now);
            osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
          case 'select':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;
          case 'win':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
            break;
        }
      } catch {
        // Ignore audio failures if blocked
      }
    },
    [soundEnabled],
  );

  // Main countdown timer interval
  useEffect(() => {
    if (gameState.phase !== 'drawing') return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.phase !== 'drawing') return prev;
        const nextState = { ...prev };
        stepDrawingTimer(nextState, 1);
        if (nextState.timerSeconds <= 5 && nextState.timerSeconds > 0) {
          playSound('tick');
        }
        if (nextState.phase === 'round_reveal') {
          playSound('round_end');
        }
        return nextState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.phase, playSound]);

  // Handle Bot Drawer: Choose word and incrementally render sketch
  useEffect(() => {
    const currentDrawer = gameState.players[gameState.currentDrawerIndex];
    if (!currentDrawer.isBot) return;

    if (gameState.phase === 'selecting_word') {
      const timeout = setTimeout(() => {
        // Prefer word with preset bot sketch
        const matchingWord = gameState.wordOptions.find((w) => BOT_SKETCHES[w.word]);
        const chosen = matchingWord || gameState.wordOptions[0];
        setGameState((prev) => {
          const next = { ...prev };
          selectSecretWord(next, chosen.word);
          return next;
        });
        playSound('select');
      }, 1500);

      return () => clearTimeout(timeout);
    }

    if (gameState.phase === 'drawing') {
      const sketch = BOT_SKETCHES[gameState.secretWord] || BOT_SKETCHES.SUN;
      let strokeIndex = 0;

      botDrawTimerRef.current = setInterval(() => {
        if (strokeIndex < sketch.length) {
          const stroke = sketch[strokeIndex];
          setGameState((prev) => {
            const next = { ...prev };
            addStroke(next, stroke);
            return next;
          });
          strokeIndex++;
        } else {
          if (botDrawTimerRef.current) clearInterval(botDrawTimerRef.current);
        }
      }, 2500);

      return () => {
        if (botDrawTimerRef.current) clearInterval(botDrawTimerRef.current);
      };
    }
  }, [
    gameState.phase,
    gameState.currentDrawerIndex,
    gameState.players,
    gameState.wordOptions,
    gameState.secretWord,
    playSound,
  ]);

  // Handle Bot Guessers
  useEffect(() => {
    if (gameState.phase !== 'drawing') return;

    const currentDrawer = gameState.players[gameState.currentDrawerIndex];
    const botGuessers = gameState.players.filter((p) => p.isBot && p.id !== currentDrawer.id);

    botGuessTimerRef.current = setInterval(() => {
      botGuessers.forEach((bot) => {
        if (bot.hasGuessed) return;

        // Bots have a chance to guess based on remaining time
        const timeElapsed = gameState.roundDuration - gameState.timerSeconds;
        const guessChance = Math.min(0.25, timeElapsed * 0.008);

        if (Math.random() < guessChance) {
          const roll = Math.random();
          let guess = '';
          if (roll < 0.65) {
            // Correct guess!
            guess = gameState.secretWord;
          } else if (roll < 0.85) {
            // Near-miss guess (typo)
            guess = gameState.secretWord.slice(0, -1) + 'X';
          } else {
            // Random distraction
            guess = ['DOG', 'PLANE', 'HOUSE', 'BALL'][Math.floor(Math.random() * 4)];
          }

          setGameState((prev) => {
            const next = { ...prev };
            const res = submitGuess(next, bot.id, guess);
            if (res.isCorrect) playSound('correct');
            else if (res.isNearMiss) playSound('near_miss');
            return next;
          });
        }
      });
    }, 4000);

    return () => {
      if (botGuessTimerRef.current) clearInterval(botGuessTimerRef.current);
    };
  }, [
    gameState.phase,
    gameState.players,
    gameState.currentDrawerIndex,
    gameState.secretWord,
    gameState.timerSeconds,
    gameState.roundDuration,
    playSound,
  ]);

  // Canvas actions by human player
  const handleAddStroke = (stroke: DrawingStroke) => {
    setGameState((prev) => {
      const next = { ...prev };
      addStroke(next, stroke);
      return next;
    });
  };

  const handleUndo = () => {
    setGameState((prev) => {
      const next = { ...prev };
      undoLastStroke(next);
      return next;
    });
  };

  const handleClear = () => {
    setGameState((prev) => {
      const next = { ...prev };
      clearCanvas(next);
      return next;
    });
  };

  // Submit human player guess
  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim() || gameState.phase !== 'drawing') return;

    const user = gameState.players[0];
    const res = submitGuess(gameState, user.id, guessInput);

    if (res.isCorrect) {
      playSound('correct');
    } else if (res.isNearMiss) {
      playSound('near_miss');
    }

    setGameState({ ...gameState });
    setGuessInput('');
  };

  // Choose secret word by human player
  const handleSelectWord = (word: WordOption) => {
    setGameState((prev) => {
      const next = { ...prev };
      selectSecretWord(next, word.word);
      return next;
    });
    playSound('select');
  };

  // Advance to next round
  const handleNextRound = () => {
    setGameState((prev) => {
      const next = { ...prev };
      nextRound(next);
      if (next.phase === 'game_over') {
        playSound('win');
      }
      return next;
    });
  };

  // Restart new match
  const handleRestart = () => {
    setGameState(createInitialDrawingState({ playerCount: 4, maxRounds: 3, roundDuration: 60 }));
    playSound('select');
  };

  const user = gameState.players[0];
  const currentDrawer = gameState.players[gameState.currentDrawerIndex];
  const isUserDrawer = currentDrawer.id === user.id;

  return (
    <div className="relative min-h-[700px] w-full max-w-6xl mx-auto flex flex-col gap-4 p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl select-none">
      {/* Top Header & Navigation */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Paintbrush className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Drawing & Guessing
              </h1>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PARTY ARCADE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Round {gameState.currentRound} of {gameState.maxRounds} • Drawer:{' '}
              <strong className="text-amber-300">{currentDrawer.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
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
            onClick={handleRestart}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </header>

      {/* Secret Word & Timer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="w-4 h-4 text-amber-400" />
          <span>
            {gameState.players.filter((p) => p.hasGuessed).length} / {gameState.players.length - 1}{' '}
            Guessed
          </span>
        </div>

        {/* Word Display (Secret for drawer, masked for guessers) */}
        <div className="flex flex-col items-center justify-center">
          {gameState.phase === 'drawing' ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isUserDrawer ? 'YOUR SECRET WORD TO DRAW' : 'SECRET WORD HINT'}
              </span>
              <span className="text-xl md:text-2xl font-black font-mono tracking-widest text-amber-300">
                {isUserDrawer
                  ? gameState.secretWord
                  : getMaskedWord(gameState.secretWord, gameState.revealedIndices)}
              </span>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400">
              {gameState.lastActionMessage}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="flex items-center justify-end gap-2">
          <div
            className={`px-3 py-1 rounded-lg font-mono text-sm font-bold border transition-colors ${
              gameState.timerSeconds <= 15
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            ⏱ {gameState.timerSeconds}s
          </div>
        </div>
      </div>

      {/* Main Playfield: Canvas (Left) + Chat/Guessing Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column: Canvas Area (2 cols on large screen) */}
        <div className="lg:col-span-2">
          <DrawingCanvas
            strokes={gameState.strokes}
            isDrawer={isUserDrawer && gameState.phase === 'drawing'}
            drawerName={currentDrawer.name}
            onAddStroke={handleAddStroke}
            onUndo={handleUndo}
            onClear={handleClear}
          />
        </div>

        {/* Right Column: Live Chat & Guessing Feed */}
        <div className="flex flex-col h-[520px] bg-slate-900/90 rounded-xl border border-slate-800 p-3 shadow-xl">
          {/* Feed Title */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Guesses & Chat</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {gameState.chatMessages.length} msgs
            </span>
          </div>

          {/* Chat Stream */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto py-2 space-y-2 text-xs">
            {gameState.chatMessages.map((msg) => {
              if (msg.senderId === 'system') {
                return (
                  <div
                    key={msg.id}
                    className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-center font-medium"
                  >
                    ✦ {msg.text}
                  </div>
                );
              }

              if (msg.isCorrect) {
                return (
                  <div
                    key={msg.id}
                    className="p-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between shadow-sm"
                  >
                    <span>🎉 {msg.text}</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                );
              }

              if (msg.isNearMiss) {
                return (
                  <div
                    key={msg.id}
                    className="p-2 rounded bg-amber-500/20 border border-amber-500/30 text-amber-200 font-semibold"
                  >
                    <span className="text-slate-400 font-normal">{msg.senderName}: </span>
                    <span className="line-through opacity-70">{msg.text}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                      SO CLOSE!
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="text-slate-300">
                  <span className="font-semibold text-slate-400">{msg.senderName}: </span>
                  <span>{msg.text}</span>
                </div>
              );
            })}
          </div>

          {/* Guess Input Form */}
          {!isUserDrawer && (
            <div className="pt-2 border-t border-slate-800">
              {user.hasGuessed ? (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-center font-bold text-xs">
                  ✓ You guessed the secret word! (+{user.score} total pts)
                </div>
              ) : (
                <form onSubmit={handleGuessSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    placeholder="Type your guess here..."
                    disabled={gameState.phase !== 'drawing'}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={gameState.phase !== 'drawing' || !guessInput.trim()}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Guess</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Players & Leaderboard Tray */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        {gameState.players.map((p, idx) => {
          const isDrawer = idx === gameState.currentDrawerIndex;
          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                isDrawer
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-slate-800/60 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {p.isBot ? (
                    <Bot className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="text-white">P1</span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{p.name}</span>
                    {isDrawer && (
                      <span className="text-[9px] px-1 bg-amber-400 text-slate-950 rounded font-black uppercase">
                        DRAW
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{p.score} pts</div>
                </div>
              </div>

              {p.hasGuessed && (
                <span className="text-emerald-400 text-xs font-black" title="Guessed this round">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Word Selection (when user is drawer) */}
      {isUserDrawer && gameState.phase === 'selecting_word' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex items-center justify-center p-6 z-30">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/30">
              <Paintbrush className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white">Your Turn to Draw!</h2>
            <p className="text-xs text-slate-400">
              Choose a secret word to sketch. Harder words grant bonus points to you and the
              guessers!
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {gameState.wordOptions.map((opt) => (
                <button
                  key={opt.word}
                  type="button"
                  onClick={() => handleSelectWord(opt)}
                  className="w-full p-3.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 transition-all flex items-center justify-between group font-bold"
                >
                  <span className="text-sm font-mono tracking-wider">{opt.word}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                        opt.difficulty === 'easy'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : opt.difficulty === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {opt.difficulty} ({opt.pointsMultiplier}x)
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Round Reveal */}
      {gameState.phase === 'round_reveal' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-30">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Round Complete
            </span>
            <div>
              <div className="text-xs text-slate-400">The secret word was</div>
              <div className="text-2xl font-black font-mono tracking-widest text-amber-300 mt-1">
                {gameState.secretWord}
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium">{gameState.lastActionMessage}</p>

            <button
              type="button"
              onClick={handleNextRound}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/20"
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

            {/* Final Standings */}
            <div className="space-y-2 pt-2">
              {[...gameState.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      idx === 0
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-black'
                        : 'bg-slate-800 border-slate-700 text-slate-300 text-xs'
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
                onClick={handleRestart}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-colors shadow-lg"
              >
                Play Again
              </button>
              <Link
                href="/games"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-colors border border-slate-700"
              >
                Back to Arcade
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
                <HelpCircle className="w-4 h-4 text-amber-400" />
                How to Play Drawing & Guessing
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
                <strong>1. Role Rotation:</strong> Players take turns being the Artist. When it is
                your turn, choose one of three secret words (Easy, Medium, or Hard).
              </p>
              <p>
                <strong>2. Sketch & Draw:</strong> Use colors, varied brush sizes, and the eraser to
                sketch clues without writing words, letters, or numbers.
              </p>
              <p>
                <strong>3. Guess Fast:</strong> Other players type guesses into the chat. The faster
                you guess correctly, the more points you score (time-decay formula).
              </p>
              <p>
                <strong>4. Near-Miss Assistance:</strong> One-letter typos are automatically flagged
                as <em>SO CLOSE</em> to help you fix spelling quickly!
              </p>
              <p>
                <strong>5. Progressive Hints:</strong> As the round timer winds down, the game
                master automatically reveals letters to keep the match exciting.
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
