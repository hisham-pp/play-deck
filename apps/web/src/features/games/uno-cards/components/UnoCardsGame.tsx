'use client';

import {
  Bot,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  callLastCard,
  chooseWildColor,
  createInitialUnoState,
  drawCardFromDeck,
  getBotAction,
  isCardPlayable,
  passTurn,
  playCard,
  COLOR_NAMES,
  COLOR_SYMBOLS,
  type CardColor,
  type UnoGameState,
} from '../engine/uno-cards-engine';
import { UnoCardView } from './UnoCardView';

export function UnoCardsGame() {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const [gameState, setGameState] = useState<UnoGameState>(() =>
    createInitialUnoState({ playerCount: 4 }),
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Synthesizer via Web Audio API
  const playSound = useCallback(
    (type: 'deal' | 'play' | 'action' | 'wild' | 'draw' | 'last_card' | 'win') => {
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

        if (type === 'play') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
          osc.start(now);
          osc.stop(now + 0.09);
        } else if (type === 'action') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (type === 'draw') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'wild') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554, now + 0.08);
          osc.frequency.setValueAtTime(659, now + 0.16);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'last_card') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.setValueAtTime(783.99, now + 0.12);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.start(now);
          osc.stop(now + 0.32);
        } else if (type === 'win') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.12);
          osc.frequency.setValueAtTime(783, now + 0.24);
          osc.frequency.setValueAtTime(1046, now + 0.36);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.start(now);
          osc.stop(now + 0.55);
        }
      } catch {
        // Ignore audio failures if browser blocks autoplay
      }
    },
    [soundEnabled],
  );

  const handleRestart = useCallback(
    (count = playerCount) => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      setGameState(createInitialUnoState({ playerCount: count }));
      playSound('play');
    },
    [playerCount, playSound],
  );

  const handlePlayerPlay = (cardId: string) => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    const res = playCard(gameState, activePlayer.id, cardId);
    if (res.success) {
      playSound('play');
      setGameState({ ...gameState });
    }
  };

  const handlePlayerDraw = () => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    const drawn = drawCardFromDeck(gameState, activePlayer.id);
    if (drawn) {
      playSound('draw');
      setGameState({ ...gameState });
    }
  };

  const handlePlayerPass = () => {
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer.isBot) return;

    const passed = passTurn(gameState, activePlayer.id);
    if (passed) {
      setGameState({ ...gameState });
    }
  };

  const handleCallLastCard = (playerId: string) => {
    const ok = callLastCard(gameState, playerId);
    if (ok) {
      playSound('last_card');
      setGameState({ ...gameState });
    }
  };

  const handleColorChoice = (color: CardColor) => {
    if (!gameState.pendingWildPlayerId) return;
    const ok = chooseWildColor(gameState, gameState.pendingWildPlayerId, color);
    if (ok) {
      playSound('wild');
      setGameState({ ...gameState });
    }
  };

  // Bot Turn Automation
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (!activePlayer.isBot) return;

    botTimerRef.current = setTimeout(() => {
      const decision = getBotAction(gameState, activePlayer.id);

      if (decision.action === 'play') {
        if (gameState.pendingWildPlayerId === activePlayer.id && decision.chosenColor) {
          chooseWildColor(gameState, activePlayer.id, decision.chosenColor);
          playSound('wild');
        } else if (decision.cardId) {
          playCard(gameState, activePlayer.id, decision.cardId, decision.chosenColor);
          playSound('play');
        }
      } else if (decision.action === 'draw') {
        drawCardFromDeck(gameState, activePlayer.id);
        playSound('draw');
      } else if (decision.action === 'pass') {
        passTurn(gameState, activePlayer.id);
      }

      setGameState({ ...gameState });
    }, 900);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameState, playSound]);

  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const humanPlayer = gameState.players[0];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[#070b14] px-3 py-6 text-slate-100 sm:px-6">
      {/* Top Header Bar */}
      <div className="mb-4 flex w-full max-w-5xl items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90 transition-colors hover:text-amber-300"
          >
            ← Arcade Catalog
          </Link>
          <span className="text-slate-600">/</span>
          <h1 className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-400" />
            UNO-Style Cards
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/50 text-slate-300 transition-colors hover:bg-slate-700"
            title={soundEnabled ? 'Mute' : 'Unmute'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            Rules
          </button>
          <button
            onClick={() => handleRestart()}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Deal
          </button>
        </div>
      </div>

      {/* Seating / Player Count Bar */}
      <div className="mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Users className="h-4 w-4 text-amber-400" />
          <span>Table Seats:</span>
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => {
                setPlayerCount(count);
                handleRestart(count);
              }}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                playerCount === count
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {count} Players
            </button>
          ))}
        </div>

        {/* Turn & Action Toast */}
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{gameState.lastActionMessage}</span>
        </div>
      </div>

      {/* Main Card Arena Felt Table */}
      <div className="relative flex w-full max-w-5xl flex-col items-center justify-between rounded-3xl border-4 border-slate-800 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0f1d38] via-[#091222] to-[#040812] p-4 sm:p-8 shadow-2xl shadow-black">
        {/* Opponents Section */}
        <div className="flex w-full items-start justify-around gap-2 pb-4">
          {gameState.players.slice(1).map((bot, idx) => {
            const isTurn = gameState.currentTurnIndex === idx + 1;
            return (
              <div
                key={bot.id}
                className={`flex flex-col items-center rounded-2xl border p-2.5 transition-all duration-200 ${
                  isTurn
                    ? 'border-amber-400 bg-amber-950/20 shadow-lg shadow-amber-500/20 scale-105 ring-2 ring-amber-400'
                    : 'border-slate-800 bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Bot className="h-3.5 w-3.5 text-slate-400" />
                  <span>{bot.name}</span>
                </div>

                <div className="mt-2 flex -space-x-4">
                  {bot.hand.map((_, cIdx) => (
                    <div key={cIdx} className="scale-75 origin-top">
                      <UnoCardView card={topDiscard} isFaceDown size="sm" />
                    </div>
                  ))}
                </div>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {bot.hand.length} {bot.hand.length === 1 ? 'card' : 'cards'}
                  </span>
                  {bot.hand.length === 1 && (
                    <span className="rounded bg-rose-500/30 px-1 py-0.2 text-[9px] font-black uppercase text-rose-300 animate-bounce">
                      1 Left!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Arena: Draw Pile & Discard Pile */}
        <div className="my-6 flex items-center justify-center gap-8 sm:gap-14">
          {/* Draw Deck */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handlePlayerDraw}
              disabled={activePlayer.isBot || gameState.hasDrawnThisTurn}
              className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none group"
            >
              {/* Stack shadow visual */}
              <div className="absolute top-1 left-1 h-full w-full rounded-xl bg-slate-800" />
              <div className="absolute top-2 left-2 h-full w-full rounded-xl bg-slate-900" />
              <UnoCardView card={topDiscard} isFaceDown size="lg" />
              <span className="absolute -bottom-2 -right-2 rounded-full border border-amber-400 bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-black text-amber-400 shadow">
                {gameState.deck.length}
              </span>
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Draw Pile
            </span>
          </div>

          {/* Active Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {/* Active Color Ambient Glow Ring */}
              <div
                className={`absolute -inset-3 rounded-2xl opacity-40 blur-lg transition-colors ${
                  gameState.activeColor === 'red'
                    ? 'bg-rose-500'
                    : gameState.activeColor === 'blue'
                      ? 'bg-sky-500'
                      : gameState.activeColor === 'green'
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                }`}
              />
              <UnoCardView card={topDiscard} size="lg" />
            </div>

            {/* Active Color Swatch Indicator */}
            <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-bold text-slate-200">
              <span className="text-sm">{COLOR_SYMBOLS[gameState.activeColor]}</span>
              <span>{COLOR_NAMES[gameState.activeColor]}</span>
              <span className="font-mono text-slate-500">
                ({gameState.direction === 1 ? '↻ CW' : '↺ CCW'})
              </span>
            </div>
          </div>
        </div>

        {/* Player Action Buttons Bar */}
        <div className="mb-3 flex items-center justify-between gap-3 w-full max-w-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayerDraw}
              disabled={activePlayer.isBot || gameState.hasDrawnThisTurn}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-bold text-slate-200 shadow transition-all hover:bg-slate-700 disabled:opacity-40"
            >
              Draw Card
            </button>
            {gameState.hasDrawnThisTurn && !activePlayer.isBot && (
              <button
                onClick={handlePlayerPass}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow transition-all hover:bg-amber-500/30"
              >
                Pass Turn
              </button>
            )}
          </div>

          {/* Last Card Shout Button */}
          {humanPlayer.hand.length <= 2 && (
            <button
              onClick={() => handleCallLastCard(humanPlayer.id)}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-1.5 text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                humanPlayer.hasCalledLastCard
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                  : 'border-rose-500 bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse'
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              {humanPlayer.hasCalledLastCard ? '✓ Last Card Called!' : 'Call "Last Card!"'}
            </button>
          )}
        </div>

        {/* Human Player Hand */}
        <div className="flex w-full flex-col items-center">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
            <span>Your Hand ({humanPlayer.hand.length} cards)</span>
            {!activePlayer.isBot && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                Your Turn!
              </span>
            )}
          </div>

          <div className="flex max-w-full flex-wrap justify-center gap-2 p-2">
            {humanPlayer.hand.map((card) => {
              const playable =
                !activePlayer.isBot && isCardPlayable(card, topDiscard, gameState.activeColor);
              return (
                <div key={card.id}>
                  <UnoCardView
                    card={card}
                    isPlayable={playable}
                    onClick={() => handlePlayerPlay(card.id)}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Wild Color Picker Modal */}
        {gameState.pendingWildPlayerId === humanPlayer.id && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-md">
            <h3 className="mb-2 text-xl font-black text-amber-400">Choose Wild Color</h3>
            <p className="mb-6 text-xs text-slate-300">
              Select the active color for the next player
            </p>

            <div className="grid grid-cols-2 gap-4">
              {(['red', 'blue', 'green', 'yellow'] as CardColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChoice(color)}
                  className={`flex h-20 w-32 flex-col items-center justify-center rounded-2xl border-2 p-3 font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg ${
                    color === 'red'
                      ? 'border-rose-400 bg-rose-600 text-white'
                      : color === 'blue'
                        ? 'border-sky-400 bg-sky-600 text-white'
                        : color === 'green'
                          ? 'border-emerald-400 bg-emerald-600 text-white'
                          : 'border-amber-300 bg-amber-400 text-slate-950 font-black'
                  }`}
                >
                  <span className="text-2xl">{COLOR_SYMBOLS[color]}</span>
                  <span className="text-xs uppercase tracking-wider">{color}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Round / Game Over Victory Overlay */}
        {(gameState.status === 'round_over' || gameState.status === 'game_over') && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-md">
            <Trophy className="mb-3 h-16 w-16 text-amber-400 animate-bounce" />
            <h2 className="text-3xl font-black text-white">
              {gameState.winnerId === humanPlayer.id
                ? 'Victory! You Won!'
                : `${gameState.players.find((p) => p.id === gameState.winnerId)?.name} Won!`}
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-md">{gameState.lastActionMessage}</p>

            <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
              {gameState.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs"
                >
                  <span className="font-bold text-slate-200">{p.name}</span>
                  <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleRestart()}
              className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Next Round
            </button>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400">UNO-Style Cards Rules</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-slate-300">
              <li>
                <strong>Object:</strong> Be the first player to shed all cards in your hand.
              </li>
              <li>
                <strong>Matching:</strong> Match the top discard card by Color, Number, or Action
                symbol.
              </li>
              <li>
                <strong>Action Cards:</strong>
                <ul className="list-circle pl-4 pt-1 space-y-1">
                  <li>
                    <strong>Skip (⊘):</strong> Next player misses their turn.
                  </li>
                  <li>
                    <strong>Reverse (⇄):</strong> Changes the direction of play.
                  </li>
                  <li>
                    <strong>Draw Two (+2):</strong> Next player draws 2 cards and misses their turn.
                  </li>
                  <li>
                    <strong>Wild (★):</strong> Choose the active color for the next player.
                  </li>
                  <li>
                    <strong>Wild Draw Four (+4):</strong> Choose color + victim draws 4 cards and
                    loses turn.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Last Card:</strong> When down to 1 card, announce &quot;Last Card!&quot;
              </li>
              <li>
                <strong>Color-Blind Friendly:</strong> Every color is paired with a distinct
                geometric symbol (◆ Red, ● Blue, ▲ Green, ★ Yellow).
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRules(false)}
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
