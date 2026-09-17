'use client';

import { RotateCcw, Settings, Sparkles } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import {
  MODE_AI,
  MODE_MULTIPLAYER,
  MODE_SOLO,
  PLAYER_1,
  PLAYER_2,
  STATUS_COMPLETED,
  STATUS_PLAYING,
} from '../engine/runic-memory-constants';
import type { ActivePlayer, RunicGameState } from '../types/runic-memory.types';
import { RunicArenaBanner } from './RunicArenaBanner';
import { RunicMemoryBoard } from './RunicMemoryBoard';
import { RunicPlayerCard } from './RunicPlayerCard';
import { RunicStatsCard } from './RunicStatsCard';
import { RunicVictoryBanner } from './RunicVictoryBanner';
import { RunicVoiceControlsCard } from './RunicVoiceControlsCard';

interface RunicMemoryArenaProps {
  state: RunicGameState;
  focusedIndex: number;
  roomCode?: string | null;
  myRole?: ActivePlayer | null;
  player1Name: string;
  player1Avatar?: string;
  player2Name: string;
  player2Avatar?: string;
  isVoiceCommandsSupported: boolean;
  isListening: boolean;
  lastCommand: string | null;
  onFlipCard: (index: number) => void;
  onResetRound: () => void;
  onOpenSetup: () => void;
  onLeaveRoom?: () => void;
  onToggleVoiceCommands: () => void;
}

const BTN_TYPE = 'button';
const BTN_OUTLINE = 'outline';

export function RunicMemoryArena({
  state,
  focusedIndex,
  roomCode,
  myRole,
  player1Name,
  player1Avatar,
  player2Name,
  player2Avatar,
  isVoiceCommandsSupported,
  isListening,
  lastCommand,
  onFlipCard,
  onResetRound,
  onOpenSetup,
  onLeaveRoom,
  onToggleVoiceCommands,
}: RunicMemoryArenaProps) {
  const isMultiplayer = state.mode === MODE_MULTIPLAYER;
  const isSolo = state.mode === MODE_SOLO;
  const isAI = state.mode === MODE_AI;

  const isMyTurnOnline = !isMultiplayer || Boolean(myRole && state.turn === myRole);
  const isCardFlipDisabled =
    state.status === STATUS_COMPLETED || state.isAiThinking || (isMultiplayer && !isMyTurnOnline);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_280px] items-start justify-center gap-4 lg:gap-6">
      {/* LEFT COLUMN: PLAYER 1 & BRAIN STATS */}
      <div className="flex flex-col gap-3.5 order-2 lg:order-1">
        <RunicPlayerCard
          name={player1Name}
          avatar={player1Avatar}
          score={state.scores.P1}
          matches={isSolo ? state.matches : Math.floor(state.scores.P1 / 100)}
          combo={state.turn === PLAYER_1 ? state.combo : 0}
          isActive={state.status === STATUS_PLAYING && state.turn === PLAYER_1}
          roleTag={isMultiplayer ? (myRole === PLAYER_1 ? 'You (Host)' : 'Host') : 'Rune Seeker'}
          turnLabel={state.turn === PLAYER_1 ? 'Active Turn' : undefined}
        />

        <RunicStatsCard
          mode={state.mode}
          difficulty={state.difficulty}
          moves={state.moves}
          matches={state.matches}
          combo={state.combo}
          maxCombo={state.maxCombo}
          elapsedSeconds={state.elapsedSeconds}
        />
      </div>

      {/* CENTER COLUMN: RUNIC STONE BOARD */}
      <div className="flex flex-col items-center gap-3 order-1 lg:order-2">
        <RunicArenaBanner
          state={state}
          isMultiplayer={isMultiplayer}
          isMyTurnOnline={isMyTurnOnline}
          player1Name={player1Name}
          player2Name={player2Name}
          roomCode={roomCode}
        />

        <RunicMemoryBoard
          board={state.board}
          difficulty={state.difficulty}
          focusedIndex={focusedIndex}
          disabled={isCardFlipDisabled}
          onFlip={onFlipCard}
        />

        {state.status === STATUS_COMPLETED && (
          <RunicVictoryBanner
            state={state}
            player1Name={player1Name}
            player2Name={player2Name}
            onResetRound={onResetRound}
            onOpenSetup={onOpenSetup}
          />
        )}
      </div>

      {/* RIGHT COLUMN: OPPONENT / VOICE & QUICK ACTIONS */}
      <div className="flex flex-col gap-3.5 order-3">
        {!isSolo ? (
          <RunicPlayerCard
            name={player2Name}
            avatar={player2Avatar}
            score={state.scores.P2}
            matches={Math.floor(state.scores.P2 / 100)}
            combo={state.turn === PLAYER_2 ? state.combo : 0}
            isActive={state.status === STATUS_PLAYING && state.turn === PLAYER_2}
            isAI={isAI}
            isAiThinking={state.isAiThinking}
            roleTag={isAI ? 'Cognitive AI' : isMultiplayer ? 'Guest' : 'Player 2'}
            turnLabel={state.turn === PLAYER_2 ? 'Active Turn' : undefined}
          />
        ) : (
          <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-deck-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Solitaire Goal</span>
            </div>
            <p className="text-xs text-deck-400 leading-relaxed">
              Match all ancient sigil pairs with maximum accuracy and the fewest possible turns.
              Build consecutive combo streaks to achieve Elder Sage rating!
            </p>
          </div>
        )}

        <RunicVoiceControlsCard
          isVoiceCommandsSupported={isVoiceCommandsSupported}
          isListening={isListening}
          lastCommand={lastCommand}
          onToggleVoiceCommands={onToggleVoiceCommands}
        />

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type={BTN_TYPE}
            variant={BTN_OUTLINE}
            size="sm"
            onClick={onResetRound}
            className="flex items-center justify-center gap-1.5"
            disabled={state.isAiThinking}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            type={BTN_TYPE}
            variant={BTN_OUTLINE}
            size="sm"
            onClick={onOpenSetup}
            className="flex items-center justify-center gap-1.5"
            disabled={state.isAiThinking}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Button>

          {isMultiplayer && onLeaveRoom && (
            <Button
              type={BTN_TYPE}
              variant={BTN_OUTLINE}
              size="sm"
              onClick={onLeaveRoom}
              className="col-span-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            >
              Leave Room
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
