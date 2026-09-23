'use client';

<<<<<<< HEAD
import React, { useEffect, useState } from 'react';

import { useTrustMultiplayerStore } from '@/stores/trust-or-betray-multiplayer.store';

import { useTrustGame } from '../hooks/use-trust-game';
import { TrustChoicePhase } from './TrustChoicePhase';
import { TrustDiscussionPanel } from './TrustDiscussionPanel';
import { TrustMissionCard } from './TrustMissionCard';
import { TrustOrBetrayLobby } from './TrustOrBetrayLobby';
import { TrustOrBetrayRoomLobby } from './TrustOrBetrayRoomLobby';
import { TrustRevealStage } from './TrustRevealStage';
import { TrustTrialVoteModal } from './TrustTrialVoteModal';
import { TrustVictoryModal } from './TrustVictoryModal';

export interface TrustOrBetrayGameProps {
  onGameOver?: (score: number) => void;
}

export function TrustOrBetrayGame({ onGameOver }: TrustOrBetrayGameProps) {
  const mpStore = useTrustMultiplayerStore();
  const [showRules, setShowRules] = useState(false);

  const {
    phase,
    currentRound,
    totalRounds,
    timeRemaining,
    activeMission,
    groupPot,
    cooperationStreak,
    players,
    history,
    chat,
    careerStats,
    config,
    setConfig,
    startSoloMatch,
    lockInChoice,
    submitVote,
    sendChatMessage,
    advanceNextRound,
  } = useTrustGame();

  // Notify parent on match completion
  useEffect(() => {
    if (phase === 'match_over' && onGameOver) {
      const human = players.find((p) => !p.isBot);
      onGameOver(human?.score ?? 0);
    }
  }, [onGameOver, phase, players]);

  const handleCreateRoom = async () => {
    const code = await mpStore.createRoom({
      id: `player-${Date.now()}`,
      displayName: 'Host Agent',
      avatar: '⭐',
    });
    if (code) {
      mpStore.setStatus('lobby');
    }
  };

  const handleJoinRoom = async (code: string) => {
    const success = await mpStore.joinRoomByCode(code, {
      id: `player-${Date.now()}`,
      displayName: 'Operative',
      avatar: '🕵️',
    });
    if (success) {
      mpStore.setStatus('lobby');
    }
  };

  const handleStartMultiplayerMatch = () => {
    mpStore.setStatus('playing');
    startSoloMatch({
      botCount: Math.max(2, mpStore.players.length - 1),
      roundCount: mpStore.roundCount,
    });
  };

  const currentRoundResult = history[history.length - 1];
  const humanPlayer = players.find((p) => !p.isBot);

  return (
    <div className="w-full min-h-[600px] flex flex-col items-center justify-start py-6 px-4 max-w-6xl mx-auto select-none">
      {/* Top Utility Bar */}
      <div className="w-full flex items-center justify-between gap-4 mb-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-200">TRUST OR BETRAY PROTOCOL</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            [ RULES & INTEL ]
          </button>
          <button
            type="button"
            onClick={() => setConfig((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            {config.soundEnabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: MUTED'}
          </button>
        </div>
      </div>

      {/* Main Phase Router */}
      {phase === 'lobby' ? (
        mpStore.status === 'lobby' ? (
          <TrustOrBetrayRoomLobby
            onStartMatch={handleStartMultiplayerMatch}
            onBackToLobby={() => mpStore.leaveRoom()}
          />
        ) : (
          <TrustOrBetrayLobby
            careerStats={careerStats}
            onStartSolo={startSoloMatch}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        )
      ) : phase === 'match_over' ? (
        <TrustVictoryModal
          players={players}
          onRematch={() =>
            startSoloMatch({ botCount: players.length - 1, roundCount: totalRounds })
          }
          onReturnToLobby={() => window.location.reload()}
        />
      ) : (
        <div className="w-full flex flex-col gap-6">
          {/* Active Mission HUD */}
          <TrustMissionCard
            round={currentRound}
            totalRounds={totalRounds}
            mission={activeMission}
            groupPot={groupPot}
            streak={cooperationStreak}
            timeRemaining={timeRemaining}
            phaseLabel={phase.replace('_', ' ')}
          />

          {/* Phase Content */}
          {(phase === 'briefing' || phase === 'choosing') && (
            <TrustChoicePhase
              onLockIn={lockInChoice}
              hasLockedIn={humanPlayer?.hasLockedIn ?? false}
              timeRemaining={timeRemaining}
            />
          )}

          {phase === 'reveal' && (
            <TrustRevealStage
              roundResult={currentRoundResult}
              players={players}
              timeRemaining={timeRemaining}
            />
          )}

          {phase === 'discussion' && (
            <div className="flex flex-col gap-6">
              <TrustRevealStage
                roundResult={currentRoundResult}
                players={players}
                timeRemaining={timeRemaining}
              />
              <TrustDiscussionPanel
                chat={chat}
                players={players}
                timeRemaining={timeRemaining}
                onSendMessage={sendChatMessage}
              />
            </div>
          )}

          {phase === 'trial_vote' && (
            <>
              <TrustRevealStage
                roundResult={currentRoundResult}
                players={players}
                timeRemaining={timeRemaining}
              />
              <TrustTrialVoteModal
                players={players}
                localPlayerId={humanPlayer?.id ?? 'player-local'}
                timeRemaining={timeRemaining}
                onVote={submitVote}
              />
            </>
          )}

          {phase === 'round_summary' && (
            <div className="flex flex-col gap-6">
              <TrustRevealStage
                roundResult={currentRoundResult}
                players={players}
                timeRemaining={timeRemaining}
              />
              <div className="text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <p className="text-xs text-slate-400">
                  Advancing to Round {currentRound + 1} of {totalRounds} in {timeRemaining}s...
                </p>
                <button
                  type="button"
                  onClick={advanceNextRound}
                  className="mt-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Continue Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rules Intel Dialog */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black tracking-tight">Trust or Betray — Directive</h3>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-300 flex flex-col gap-3 leading-relaxed max-h-[400px] overflow-y-auto">
              <p>
                <strong>1. Secret Simultaneous Decisions:</strong> Each round has a shared mission
                with a group point pot. You secretly choose: <em>COOPERATE</em> or <em>BETRAY</em>.
              </p>
              <p>
                <strong>2. All Cooperate:</strong> Everyone receives an equal share of the pot, and
                the team cooperation streak multiplier builds (up to x2.0).
              </p>
              <p>
                <strong>3. Solo Betrayal:</strong> If exactly one operative betrays, they steal the
                entire pot plus a 50 PT solo bonus! Cooperators get 0.
              </p>
              <p>
                <strong>4. Sabotage Collision:</strong> If two or more operatives betray, the
                mission implodes. Saboteurs receive 0 and the pot is lost.
              </p>
              <p>
                <strong>5. Exile Trials:</strong> Periodic trials allow the team to vote to exile a
                suspected saboteur, docking 80 points and penalizing them for 1 round.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer mt-2"
            >
              Understood
            </button>
          </div>
        </div>
      )}
=======
import { ArrowLeft, Shield, Sparkles, UserRound, Vote, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { calculateRoundOutcome, nextRoundNumber, resolvePlayerChoice } from '../game-logic';

const roundSteps = [1, 2, 3, 4, 5];

export function TrustOrBetrayGame() {
  const [round, setRound] = useState(1);
  const [groupPool, setGroupPool] = useState(120);
  const [personalScore, setPersonalScore] = useState(0);
  const [trustScore, setTrustScore] = useState(3);
  const [selectedChoice, setSelectedChoice] = useState<'cooperate' | 'betray'>('cooperate');
  const [paused, setPaused] = useState(false);

  const currentRound = useMemo(
    () => roundSteps[Math.min(round - 1, roundSteps.length - 1)],
    [round],
  );

  const handleResolve = () => {
    const resolved = resolvePlayerChoice(selectedChoice, currentRound, trustScore);
    const outcome = calculateRoundOutcome({
      coopCount: selectedChoice === 'cooperate' ? 3 : 2,
      betrayCount: selectedChoice === 'betray' ? 1 : 0,
      round: currentRound,
    });

    setPersonalScore((value) => value + resolved + outcome.betrayBonus);
    setGroupPool((value) => Math.max(0, value + outcome.groupReward));
    setTrustScore((value) =>
      selectedChoice === 'betray' ? Math.max(0, value - 1) : Math.min(5, value + 1),
    );
    setRound((value) => nextRoundNumber(value));
  };

  const handleRestart = () => {
    setRound(1);
    setGroupPool(120);
    setPersonalScore(0);
    setTrustScore(3);
    setSelectedChoice('cooperate');
    setPaused(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to catalog</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          <UserRound className="h-3.5 w-3.5" />
          <span>Trust or Betray</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-surface-border bg-surface-raised p-3 shadow-arcade">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-surface-border bg-surface-base/80 px-3 py-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-violet-400">
                Round {round}
              </div>
              <div className="text-lg font-black text-white">Secret action phase</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaused((value) => !value)}
                className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-deck-200 transition hover:border-violet-500"
              >
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleRestart}
                className="rounded-lg bg-violet-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-violet-400"
              >
                Restart
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-[#111827]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_40%),linear-gradient(180deg,_rgba(17,24,39,0.4),_rgba(2,6,23,0.95))]" />
            <div className="relative h-[420px] w-full p-4">
              <div className="absolute left-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Shield className="h-4 w-4 text-violet-400" />
                <span>Group pool {groupPool}</span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-2 text-sm font-semibold text-deck-200">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{personalScore} pts</span>
              </div>

              <div className="absolute inset-x-4 top-20 flex items-center justify-between gap-3 rounded-xl border border-violet-500/40 bg-slate-900/80 p-3 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-deck-400">Trust</div>
                <div className="text-sm font-bold text-white">{trustScore}/5</div>
              </div>

              <div className="absolute inset-x-8 bottom-24 grid grid-cols-2 gap-3">
                {(['cooperate', 'betray'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedChoice(option)}
                    className={`rounded-2xl border px-4 py-5 text-left transition ${
                      selectedChoice === option
                        ? 'border-violet-500 bg-violet-500/15 text-white'
                        : 'border-surface-border bg-slate-900/70 text-deck-200 hover:border-violet-500/50'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-deck-400">
                      {option === 'cooperate' ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <Vote className="h-3.5 w-3.5" />
                      )}
                      <span>{option}</span>
                    </div>
                    <div className="text-lg font-black uppercase">
                      {option === 'cooperate' ? 'Team play' : 'Selfish play'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-5 right-5 flex gap-2">
                <button
                  onClick={handleResolve}
                  className="rounded-xl bg-violet-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-violet-400"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-surface-border bg-surface-raised p-4 shadow-arcade">
          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-violet-400">
              Round state
            </div>
            <div className="space-y-2">
              {roundSteps.map((step) => (
                <button
                  key={step}
                  onClick={() => setRound(step)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                    step === round
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-surface-border bg-surface-base/80 text-deck-300'
                  }`}
                >
                  <span className="font-bold">Round {step}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-deck-500">
                    {step === round ? 'Active' : 'Idle'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-base/80 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-violet-400">
              Status
            </div>
            <ul className="space-y-2 text-sm text-deck-300">
              <li>Players: 3–8</li>
              <li>Voice sync: Ready</li>
              <li>Choice timer: 12s</li>
              <li>Risk: {selectedChoice === 'betray' ? 'High' : 'Low'}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-dashed border-violet-500/50 bg-violet-500/5 p-3 text-sm text-violet-200">
            <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-violet-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Social tension</span>
            </div>
            Choose wisely: cooperation builds trust, but one selfish move can flip the table.
          </div>
        </aside>
      </div>
>>>>>>> 0a57c0e (feat(trust-or-betray): add social deception shell)
    </div>
  );
}
