'use client';

import React from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useWordSearchMultiplayerStore } from '@/stores/word-search-multiplayer.store';

import { PlayerScoreBoard } from './PlayerScoreBoard';
import { WordList } from './WordList';
import { WordSearchGridView } from './WordSearchGridView';
import { WordSearchLobby } from './WordSearchLobby';
import { WordSearchResults } from './WordSearchResults';

export function WordSearchGame() {
  const player = usePlayerStore((s) => s.player);
  const {
    status,
    mode,
    theme,
    gridSize,
    grid,
    players,
    foundWordSet,
    selection,
    roomCode,
    localPlayerId,
    isHost,
    setMode,
    setTheme,
    setGridSize,
    startSoloGame,
    startGame,
    updateSelection,
    commitSelection,
    addBot,
    removeBot,
    createRoom,
    leaveRoom,
  } = useWordSearchMultiplayerStore();

  const handleCreateRoom = () => {
    void createRoom({
      id: player?.id ?? 'player-local',
      displayName: player?.displayName ?? 'Hunter',
      avatar: player?.avatar ?? '🔍',
    });
  };

  const handleStart = () => {
    if (mode === 'solo') startSoloGame();
    else startGame();
  };

  const handlePlayAgain = () => {
    leaveRoom();
  };

  // ── Lobby ──────────────────────────────────────────────────────────────
  if (status === 'idle' || status === 'lobby') {
    return (
      <div className="flex flex-col items-center w-full py-6 px-4 gap-6">
        {roomCode && (
          <div className="w-full max-w-3xl">
            <RoomVoiceDock anchorClassName="!static" />
          </div>
        )}
        <WordSearchLobby
          mode={mode}
          theme={theme}
          gridSize={gridSize}
          roomCode={roomCode}
          players={players}
          isHost={isHost()}
          onSetMode={setMode}
          onSetTheme={setTheme}
          onSetSize={setGridSize}
          onStartGame={handleStart}
          onAddBot={addBot}
          onRemoveBot={removeBot}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────
  if (status === 'game-over') {
    return (
      <div className="flex flex-col items-center w-full py-6 px-4">
        <WordSearchResults
          players={players}
          localPlayerId={localPlayerId}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────
  if (!grid) return null;

  const placements = grid.placements;
  const found = foundWordSet.size;
  const total = placements.length;

  return (
    <div className="flex flex-col w-full items-center py-4 px-2 gap-4">
      {roomCode && (
        <div className="w-full max-w-5xl">
          <RoomVoiceDock anchorClassName="!static" />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-5xl flex items-center gap-3">
        <span className="text-xs text-slate-400 shrink-0">
          {found}/{total} words
        </span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${(found / Math.max(total, 1)) * 100}%` }}
          />
        </div>
        {selection.text && (
          <span className="text-xs font-mono text-amber-400 tracking-widest min-w-[80px] text-right">
            {selection.text}
          </span>
        )}
      </div>

      {/* Main play area */}
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl">
        {/* Grid */}
        <div className="flex-1 flex justify-center">
          <div className="overflow-auto max-w-full">
            <WordSearchGridView
              grid={grid}
              localPlayerId={localPlayerId}
              onSelectionCommit={(cells) => {
                updateSelection(cells);
                commitSelection();
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-52 flex flex-col gap-3">
          {players.length > 1 && (
            <PlayerScoreBoard players={players} localPlayerId={localPlayerId} />
          )}
          <WordList placements={placements} players={players} localPlayerId={localPlayerId} />
        </div>
      </div>
    </div>
  );
}
