'use client';

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
    </div>
  );
}
