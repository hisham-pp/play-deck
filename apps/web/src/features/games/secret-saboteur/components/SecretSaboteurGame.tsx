'use client';

import React, { useEffect } from 'react';

import { useSaboteurMultiplayerStore } from '@/stores/secret-saboteur-multiplayer.store';

import { useSaboteurGame } from '../hooks/use-saboteur-game';
import { SaboteurContributionStage } from './SaboteurContributionStage';
import { SaboteurDiscussionPanel } from './SaboteurDiscussionPanel';
import { SaboteurGameOverModal } from './SaboteurGameOverModal';
import { SaboteurReactorHud } from './SaboteurReactorHud';
import { SaboteurRevealStage } from './SaboteurRevealStage';
import { SaboteurRoleReveal } from './SaboteurRoleReveal';
import { SaboteurTrialModal } from './SaboteurTrialModal';
import { SecretSaboteurLobby } from './SecretSaboteurLobby';

export interface SecretSaboteurGameProps {
  onGameOver?: (score: number) => void;
}

const LOCAL_PLAYER_ID = 'player-local';

export function SecretSaboteurGame({ onGameOver }: SecretSaboteurGameProps) {
  const mpStore = useSaboteurMultiplayerStore();

  const {
    phase,
    currentRound,
    totalRounds,
    timeRemaining,
    reactorProgress,
    meltdownStrikes,
    activeSector,
    players,
    history,
    chat,
    winner,
    winReason,
    careerStats,
    startSoloMatch,
    lockInCard,
    submitVote,
    sendChatMessage,
    advanceNextRound,
  } = useSaboteurGame(LOCAL_PLAYER_ID);

  const localPlayer = players.find((p) => p.id === LOCAL_PLAYER_ID) ?? null;
  const lastRoundSummary = history[history.length - 1] ?? null;

  useEffect(() => {
    if (phase === 'game_over' && onGameOver) {
      onGameOver(reactorProgress);
    }
  }, [onGameOver, phase, reactorProgress]);

  const handleCreateRoom = async () => {
    const code = await mpStore.createRoom({
      id: `player-${Date.now()}`,
      displayName: 'Host Operative',
      avatar: '⭐',
    });
    if (code) mpStore.setStatus('lobby');
  };

  const handleJoinRoom = async (code: string) => {
    const ok = await mpStore.joinRoomByCode(code, {
      id: `player-${Date.now()}`,
      displayName: 'Operative',
      avatar: '🕵️',
    });
    if (ok) mpStore.setStatus('lobby');
  };

  const handleStartMultiplayer = () => {
    mpStore.setStatus('playing');
    startSoloMatch({
      botCount: Math.max(3, mpStore.players.length - 1),
      roundCount: mpStore.roundCount,
    });
  };

  const handleReturnLobby = () => {
    if (mpStore.status !== 'idle') mpStore.leaveRoom();
    window.location.reload();
  };

  // ── Lobby ─────────────────────────────────────────────────────────────────

  if (phase === 'lobby') {
    if (mpStore.status === 'lobby') {
      return (
        <SaboteurRoomLobby
          players={mpStore.players}
          roundCount={mpStore.roundCount}
          onSetRoundCount={mpStore.setRoundCount}
          onAddBot={mpStore.addBot}
          onRemoveBot={mpStore.removeBot}
          onStart={handleStartMultiplayer}
          onLeave={() => mpStore.leaveRoom()}
          roomCode={mpStore.roomCode ?? ''}
        />
      );
    }
    return (
      <SecretSaboteurLobby
        careerStats={careerStats}
        onStartSolo={startSoloMatch}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  // ── Game Over ─────────────────────────────────────────────────────────────

  if (phase === 'game_over') {
    return (
      <SaboteurGameOverModal
        winner={winner}
        winReason={winReason}
        players={players}
        localPlayerId={LOCAL_PLAYER_ID}
        reactorProgress={reactorProgress}
        meltdownStrikes={meltdownStrikes}
        onPlayAgain={() => startSoloMatch({ botCount: players.filter((p) => p.isBot).length })}
        onReturnLobby={handleReturnLobby}
      />
    );
  }

  // ── Active Game ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto p-4">
      <SaboteurReactorHud
        reactorProgress={reactorProgress}
        meltdownStrikes={meltdownStrikes}
        currentRound={currentRound}
        totalRounds={totalRounds}
        timeRemaining={timeRemaining}
        phase={phase}
      />

      <div className="flex-1">
        {phase === 'role_reveal' && (
          <SaboteurRoleReveal localPlayer={localPlayer} timeRemaining={timeRemaining} />
        )}

        {phase === 'briefing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ⚡ Sector Briefing
            </div>
            <h2 className="text-2xl font-black text-slate-100">{activeSector.subsystem}</h2>
            <p className="text-sm text-slate-400 max-w-sm">{activeSector.description}</p>
            <p className="text-xs text-slate-600 font-mono">
              Required: {activeSector.requiredComponents}
            </p>
            <p className="text-xs text-amber-400 font-mono mt-2">
              Contributing in {timeRemaining}s…
            </p>
          </div>
        )}

        {phase === 'contributing' && (
          <SaboteurContributionStage
            localPlayer={localPlayer}
            sector={activeSector}
            timeRemaining={timeRemaining}
            activePlayers={players}
            onLockIn={lockInCard}
          />
        )}

        {phase === 'reveal' && (
          <SaboteurRevealStage
            roundSummary={lastRoundSummary}
            timeRemaining={timeRemaining}
            onContinue={advanceNextRound}
          />
        )}

        {phase === 'discussion' && (
          <SaboteurDiscussionPanel
            players={players}
            chat={chat}
            localPlayerId={LOCAL_PLAYER_ID}
            timeRemaining={timeRemaining}
            onSendMessage={sendChatMessage}
            onAddAccusation={(targetId) => {
              const name = players.find((p) => p.id === targetId)?.name ?? 'Unknown';
              sendChatMessage(`I accuse ${name} of sabotage!`);
            }}
          />
        )}

        {phase === 'trial_vote' && (
          <SaboteurTrialModal
            players={players}
            localPlayerId={LOCAL_PLAYER_ID}
            timeRemaining={timeRemaining}
            onSubmitVote={submitVote}
          />
        )}

        {phase === 'round_summary' && lastRoundSummary && (
          <div className="flex flex-col items-center gap-4 py-6 text-center max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-slate-100">Round {currentRound} Summary</h2>
            <div
              className="text-3xl font-black"
              style={{ color: lastRoundSummary.netPowerDelta >= 0 ? '#10b981' : '#ef4444' }}
            >
              {lastRoundSummary.netPowerDelta >= 0 ? '+' : ''}
              {lastRoundSummary.netPowerDelta}% Power
            </div>
            {lastRoundSummary.meltdownAdded && (
              <div className="text-red-400 font-bold text-sm animate-pulse">
                ☢️ Critical Meltdown Added!
              </div>
            )}
            {lastRoundSummary.detainedPlayerId && (
              <div className="text-amber-400 text-sm font-semibold">
                🔒{' '}
                {players.find((p) => p.id === lastRoundSummary.detainedPlayerId)?.name ?? 'Unknown'}{' '}
                has been detained.
              </div>
            )}
            <div className="text-xs text-slate-500 font-mono">
              Reactor: {reactorProgress}% · Meltdowns: {meltdownStrikes}/3
            </div>
            <button
              id="next-round-btn"
              onClick={advanceNextRound}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all"
            >
              Next Round →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Room Lobby
// ---------------------------------------------------------------------------

interface SaboteurRoomLobbyProps {
  players: Array<{ id: string; name: string; avatar: string; isBot: boolean }>;
  roundCount: number;
  roomCode: string;
  onSetRoundCount: (n: number) => void;
  onAddBot: () => void;
  onRemoveBot: (id: string) => void;
  onStart: () => void;
  onLeave: () => void;
}

function SaboteurRoomLobby({
  players,
  roundCount,
  roomCode,
  onSetRoundCount,
  onAddBot,
  onRemoveBot,
  onStart,
  onLeave,
}: SaboteurRoomLobbyProps) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 text-slate-100 p-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <h2 className="font-black text-xl mb-1">☢️ Room Lobby</h2>
        <div className="text-xs font-mono text-slate-400">
          Code: <span className="text-amber-400 font-bold tracking-widest">{roomCode}</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-sm"
          >
            <span>{p.avatar}</span>
            <span className="flex-1 text-slate-200">{p.name}</span>
            {p.isBot && (
              <button
                id={`remove-bot-${p.id}`}
                onClick={() => onRemoveBot(p.id)}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {players.length < 8 && (
          <button
            id="add-bot-btn"
            onClick={onAddBot}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 border border-dashed border-slate-800 rounded-xl"
          >
            + Add Bot Operative
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-slate-400">
          Rounds: <span className="text-amber-400 font-bold">{roundCount}</span>
        </label>
        <input
          type="range"
          min={4}
          max={10}
          value={roundCount}
          onChange={(e) => onSetRoundCount(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          id="leave-room-btn"
          onClick={onLeave}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all"
        >
          Leave Room
        </button>
        <button
          id="start-match-btn"
          onClick={onStart}
          disabled={players.length < 4}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Start Mission ⚡
        </button>
      </div>
    </div>
  );
}
