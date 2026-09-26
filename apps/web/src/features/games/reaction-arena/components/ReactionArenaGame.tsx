'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Bot,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  User,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import {
  createInitialReactionArenaState,
  evaluatePlayerResponse,
  getBotResponse,
  nextArenaRound,
  startArenaMatch,
  type ChallengeDef,
  type ReactionArenaState,
} from '../engine/reaction-arena-engine';

export function ReactionArenaGame() {
  const [mode, setMode] = useState<'solo' | 'pass_play'>('solo');
  const [gameState, setGameState] = useState<ReactionArenaState>(() =>
    createInitialReactionArenaState([
      { name: 'You', isAi: false },
      { name: 'Reflex-Bot', isAi: true },
    ]),
  );

  const [signalReady, setSignalReady] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(50);
  const [gaugeDir, setGaugeDir] = useState(1);
  const startTimeRef = useRef<number>(0);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restart match or switch mode
  const handleStartGame = (selectedMode: 'solo' | 'pass_play') => {
    setMode(selectedMode);
    const players =
      selectedMode === 'solo'
        ? [
            { name: 'You', isAi: false },
            { name: 'Reflex-Bot', isAi: true },
          ]
        : [
            { name: 'Player 1', isAi: false },
            { name: 'Player 2', isAi: false },
          ];

    const initial = createInitialReactionArenaState(players);
    const started = startArenaMatch(initial);
    setGameState(started);
  };

  // Signal delay & Gauge animations for challenges
  useEffect(() => {
    if (gameState.status !== 'challenge' || !gameState.currentChallenge) {
      setSignalReady(false);
      return;
    }

    startTimeRef.current = performance.now();
    const ch = gameState.currentChallenge;

    // Tap target green signal delay
    if (ch.type === 'tap_target') {
      setSignalReady(false);
      const delay = typeof ch.data.signalDelayMs === 'number' ? ch.data.signalDelayMs : 1200;
      const t = setTimeout(() => {
        setSignalReady(true);
        startTimeRef.current = performance.now();
      }, delay);
      return () => clearTimeout(t);
    } else {
      setSignalReady(true);
    }

    // Oscillating gauge for stop_marker challenge
    if (ch.type === 'stop_marker') {
      const interval = setInterval(() => {
        setGaugeValue((prev) => {
          let next = prev + gaugeDir * 4;
          if (next >= 95) {
            next = 95;
            setGaugeDir(-1);
          } else if (next <= 5) {
            next = 5;
            setGaugeDir(1);
          }
          return next;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [gameState.status, gameState.currentChallenge, gaugeDir]);

  // Bot automation
  useEffect(() => {
    if (gameState.status !== 'challenge' || !gameState.currentChallenge) return;

    const bot = gameState.players.find((p) => p.isAi);
    if (!bot || bot.currentRoundAnswer?.answered) return;

    const ch = gameState.currentChallenge;
    const botResp = getBotResponse(ch);

    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    botTimeoutRef.current = setTimeout(() => {
      setGameState((prev) =>
        evaluatePlayerResponse(prev, bot.playerId, botResp.answer, botResp.reactionMs),
      );
    }, botResp.reactionMs);

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [gameState]);

  // Handle human player response
  const handleAnswer = (answer: unknown) => {
    if (gameState.status !== 'challenge') return;
    const p1 = gameState.players[0];
    if (p1.currentRoundAnswer?.answered) return;

    const reactionMs = Math.round(performance.now() - startTimeRef.current);
    setGameState((prev) => evaluatePlayerResponse(prev, p1.playerId, answer, reactionMs));
  };

  // Keyboard navigation for arrow challenge
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'challenge' || !gameState.currentChallenge) return;
      const ch = gameState.currentChallenge;

      if (ch.type === 'direction_arrow') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleAnswer('UP');
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleAnswer('DOWN');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleAnswer('LEFT');
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleAnswer('RIGHT');
        }
      } else if (ch.type === 'quick_math' || ch.type === 'color_match') {
        if (e.key === 't' || e.key === 'T' || e.key === 'ArrowLeft') {
          handleAnswer(true);
        } else if (e.key === 'f' || e.key === 'F' || e.key === 'ArrowRight') {
          handleAnswer(false);
        }
      } else if (ch.type === 'tap_target' || ch.type === 'stop_marker') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleAnswer(ch.type === 'stop_marker' ? gaugeValue : true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, gaugeValue]);

  const p1 = gameState.players[0];
  const p2 = gameState.players[1];
  const ch = gameState.currentChallenge;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 text-deck-100 font-sans">
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
            <span>vs Reflex-Bot</span>
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
          className="inline-flex items-center gap-1.5 rounded-md border border-deck-700 bg-deck-800/80 px-3 py-1 text-xs font-medium text-deck-200 transition-colors hover:bg-deck-700 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column: Player Cards & Reflex Standings */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 rounded-xl border border-deck-800 bg-deck-900/60 p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-deck-400">
              <span>Match Scores</span>
              <span>
                Round {gameState.round} of {gameState.maxRounds}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {gameState.players.map((p) => (
                <div
                  key={p.playerId}
                  className="flex items-center justify-between rounded-lg border border-deck-800 bg-deck-900/50 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-deck-800 text-deck-200 text-xs font-bold">
                      {p.isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[11px] text-deck-400">
                        {p.reactionTimes.length > 0
                          ? `Avg: ${Math.round(
                              p.reactionTimes.reduce((a, b) => a + b, 0) / p.reactionTimes.length,
                            )}ms`
                          : 'No attempts'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-amber-400">{p.totalScore}</span>
                    <span className="text-[10px] text-deck-500 block uppercase">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reflex Rating Benchmark */}
          <div className="flex flex-col gap-1.5 rounded-xl border border-deck-800 bg-deck-900/50 p-4 text-xs text-deck-400">
            <span className="font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Reflex Benchmark
            </span>
            <div className="mt-1 flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between">
                <span>&lt; 250ms</span>
                <span className="text-emerald-400 font-bold">Lightning</span>
              </div>
              <div className="flex justify-between">
                <span>250ms - 350ms</span>
                <span className="text-cyan-400 font-bold">Pro Gamer</span>
              </div>
              <div className="flex justify-between">
                <span>350ms - 500ms</span>
                <span className="text-amber-400 font-bold">Solid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Column: Active Challenge Arena */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Top Banner */}
          <div
            aria-live="polite"
            className="flex items-center justify-between rounded-xl border border-deck-800 bg-deck-900/90 px-4 py-2.5 text-xs font-medium text-deck-200"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              {gameState.lastMessage}
            </span>
          </div>

          {/* Arena Box */}
          <div className="relative flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-deck-800 bg-deck-950 p-6 shadow-2xl">
            {gameState.status === 'idle' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <Zap className="mb-2 h-14 w-14 text-amber-400 animate-pulse" />
                <h3 className="text-2xl font-black uppercase tracking-wider text-white">
                  Reaction Arena
                </h3>
                <p className="mt-1 max-w-sm text-xs text-deck-300">
                  Compete across 5 rapid reflex trials. Test your visual timing, decision speed, and
                  instinct under pressure!
                </p>

                <button
                  type="button"
                  onClick={() => handleStartGame(mode)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                >
                  <Play className="h-4 w-4" />
                  <span>Enter the Arena</span>
                </button>
              </div>
            ) : gameState.status === 'game_over' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <Trophy className="mb-2 h-14 w-14 text-amber-400 animate-bounce" />
                <h3 className="text-2xl font-black uppercase tracking-wider text-white">
                  Tournament Complete!
                </h3>
                <p className="mt-1 text-xs text-deck-300">
                  {p1.totalScore >= (p2?.totalScore ?? 0)
                    ? '🏆 You achieved reflex victory!'
                    : 'Reflex-Bot edged out the speed crown.'}
                </p>

                <div className="my-4 flex flex-col gap-2 w-full max-w-xs">
                  {[...gameState.players]
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((p, idx) => (
                      <div
                        key={p.playerId}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
                          idx === 0
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'bg-deck-900 border border-deck-800 text-deck-200'
                        }`}
                      >
                        <span>
                          #{idx + 1} {p.name}
                        </span>
                        <span className="font-bold">{p.totalScore} pts</span>
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
              </div>
            ) : gameState.status === 'round_result' ? (
              <div className="flex flex-col items-center justify-center text-center">
                <Award className="mb-2 h-12 w-12 text-amber-400" />
                <h3 className="text-xl font-black uppercase tracking-wider text-white">
                  Round {gameState.round} Results
                </h3>

                <div className="my-4 flex gap-4 text-xs">
                  {gameState.players.map((p) => (
                    <div
                      key={p.playerId}
                      className="flex flex-col items-center gap-1 rounded-xl border border-deck-800 bg-deck-900/80 p-3 min-w-[120px]"
                    >
                      <span className="font-bold text-white">{p.name}</span>
                      <span className="text-[11px] text-deck-400">
                        {p.currentRoundAnswer?.correct ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {p.currentRoundAnswer.reactionMs}ms
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Missed
                          </span>
                        )}
                      </span>
                      <span className="text-sm font-black text-amber-400 mt-1">
                        +{p.currentRoundAnswer?.points ?? 0} pts
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setGameState((prev) => nextArenaRound(prev))}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-amber-400 shadow-md"
                >
                  <Play className="h-4 w-4" />
                  <span>
                    {gameState.round >= gameState.maxRounds ? 'View Final Results' : 'Next Trial'}
                  </span>
                </button>
              </div>
            ) : (
              /* Active Challenge UI */
              <div className="flex w-full flex-col items-center justify-center">
                {renderChallengeContent(
                  ch,
                  signalReady,
                  gaugeValue,
                  p1.currentRoundAnswer?.answered ?? false,
                  handleAnswer,
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderChallengeContent(
  ch: ChallengeDef | null,
  signalReady: boolean,
  gaugeValue: number,
  answered: boolean,
  handleAnswer: (answer: unknown) => void,
) {
  if (!ch) return null;

  switch (ch.type) {
    case 'tap_target':
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
            {signalReady ? 'STRIKE NOW!' : 'WAIT FOR GREEN SIGNAL...'}
          </span>

          <button
            type="button"
            disabled={answered}
            onClick={() => handleAnswer(signalReady)}
            className={`flex h-44 w-44 items-center justify-center rounded-full text-base font-black transition-all active:scale-95 shadow-2xl ${
              signalReady
                ? 'bg-emerald-500 text-slate-950 animate-pulse border-4 border-emerald-300'
                : 'bg-rose-500/30 text-rose-300 border-2 border-rose-500/40'
            }`}
          >
            {signalReady ? 'TAP NOW!' : 'WAIT...'}
          </button>
        </div>
      );

    case 'color_match': {
      const data = ch.data as { word: string; inkHex: string };
      return (
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
              Does word match ink color?
            </span>
            <span className="text-5xl font-black drop-shadow" style={{ color: data.inkHex }}>
              {data.word}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer(true)}
              className="rounded-xl border border-emerald-500/60 bg-emerald-500/20 px-8 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all shadow-md"
            >
              MATCH (True)
            </button>
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer(false)}
              className="rounded-xl border border-rose-500/60 bg-rose-500/20 px-8 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/30 active:scale-95 transition-all shadow-md"
            >
              DIFFERENT (False)
            </button>
          </div>
        </div>
      );
    }

    case 'quick_math': {
      const data = ch.data as { equation: string };
      return (
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
              Equation Check
            </span>
            <span className="text-4xl font-mono font-black text-white">{data.equation}</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer(true)}
              className="rounded-xl border border-emerald-500/60 bg-emerald-500/20 px-8 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all shadow-md"
            >
              TRUE
            </button>
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer(false)}
              className="rounded-xl border border-rose-500/60 bg-rose-500/20 px-8 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/30 active:scale-95 transition-all shadow-md"
            >
              FALSE
            </button>
          </div>
        </div>
      );
    }

    case 'direction_arrow': {
      const data = ch.data as { targetDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' };
      return (
        <div className="flex flex-col items-center justify-center gap-5 text-center">
          <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
            React Target: <span className="font-bold text-amber-400">{data.targetDirection}</span>
          </span>

          <div className="grid grid-cols-3 gap-2 w-48">
            <div />
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer('UP')}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-deck-700 bg-deck-900 text-white hover:border-amber-400 hover:bg-deck-800 active:scale-95 transition-all"
            >
              <ArrowUp className="h-6 w-6" />
            </button>
            <div />

            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer('LEFT')}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-deck-700 bg-deck-900 text-white hover:border-amber-400 hover:bg-deck-800 active:scale-95 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center text-xs font-bold text-deck-500">
              PAD
            </div>
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer('RIGHT')}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-deck-700 bg-deck-900 text-white hover:border-amber-400 hover:bg-deck-800 active:scale-95 transition-all"
            >
              <ArrowRight className="h-6 w-6" />
            </button>

            <div />
            <button
              type="button"
              disabled={answered}
              onClick={() => handleAnswer('DOWN')}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-deck-700 bg-deck-900 text-white hover:border-amber-400 hover:bg-deck-800 active:scale-95 transition-all"
            >
              <ArrowDown className="h-6 w-6" />
            </button>
            <div />
          </div>
        </div>
      );
    }

    case 'odd_tile': {
      const data = ch.data as { grid: string[]; oddIndex: number };
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
            Spot the Anomaly
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            {data.grid.map((icon, idx) => (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleAnswer(idx)}
                className="flex h-14 w-14 items-center justify-center rounded-xl border border-deck-700 bg-deck-900 text-xl font-bold text-white hover:border-amber-400 hover:bg-deck-800 active:scale-95 transition-all"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'stop_marker': {
      const data = ch.data as { sweetSpotMin: number; sweetSpotMax: number };
      return (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm text-center">
          <span className="text-xs text-deck-400 font-semibold uppercase tracking-wider">
            Stop in the Golden Zone!
          </span>

          {/* Gauge track */}
          <div className="relative h-10 w-full rounded-xl border border-deck-700 bg-deck-900 overflow-hidden">
            {/* Target sweet zone */}
            <div
              className="absolute top-0 bottom-0 bg-amber-500/40 border-x-2 border-amber-400"
              style={{
                left: `${data.sweetSpotMin}%`,
                width: `${data.sweetSpotMax - data.sweetSpotMin}%`,
              }}
            />
            {/* Moving needle indicator */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-white shadow-lg transition-none"
              style={{ left: `${gaugeValue}%` }}
            />
          </div>

          <button
            type="button"
            disabled={answered}
            onClick={() => handleAnswer(gaugeValue)}
            className="rounded-xl border border-amber-500/80 bg-amber-500 px-10 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md"
          >
            STOP NEEDLE
          </button>
        </div>
      );
    }
  }
}
