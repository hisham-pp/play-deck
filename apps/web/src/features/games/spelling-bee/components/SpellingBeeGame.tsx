'use client';

import React, { useEffect } from 'react';

import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useSpellingBeeMultiplayerStore } from '@/stores/spelling-bee-multiplayer.store';

import { SpellingBeeLobby } from './SpellingBeeLobby';
import { SpellingBeePlayingView } from './SpellingBeePlayingView';

export function SpellingBeeGame() {
  const player = usePlayerStore((s) => s.player);
  const {
    status,
    mode,
    puzzle,
    outerLetters,
    roomCode,
    players,
    foundWords,
    score,
    rank,
    currentInput,
    feedbackMessage,
    feedbackType,
    isHost,
    setMode,
    shuffleOuter,
    addLetter,
    deleteLetter,
    submitWord,
    startGame,
    addBot,
    removeBot,
    createRoom,
  } = useSpellingBeeMultiplayerStore();

  // Keyboard handler for typing letters directly
  useEffect(() => {
    if (status !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLetter();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        submitWord();
        return;
      }

      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        shuffleOuter();
        return;
      }

      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        const allowed = new Set([puzzle.centerLetter, ...puzzle.outerLetters]);
        if (allowed.has(char)) {
          e.preventDefault();
          addLetter(char);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, puzzle, addLetter, deleteLetter, submitWord, shuffleOuter]);

  const handleCreateRoom = () => {
    void createRoom(
      {
        id: player?.id ?? 'player-local',
        displayName: player?.displayName || 'Player',
        avatar: player?.avatar || '🐝',
      },
      mode,
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full py-6">
      {status === 'lobby' || status === 'idle' ? (
        <SpellingBeeLobby
          mode={mode}
          roomCode={roomCode}
          players={players}
          isHost={isHost()}
          onSetMode={setMode}
          onStartGame={startGame}
          onAddBot={addBot}
          onRemoveBot={removeBot}
          onCreateRoom={handleCreateRoom}
        />
      ) : (
        <SpellingBeePlayingView
          puzzle={puzzle}
          outerLetters={outerLetters}
          currentInput={currentInput}
          feedbackMessage={feedbackMessage}
          feedbackType={feedbackType}
          score={score}
          rank={rank}
          foundWords={foundWords}
          onLetterClick={addLetter}
          onDelete={deleteLetter}
          onShuffle={shuffleOuter}
          onSubmit={submitWord}
        />
      )}

      {/* Voice Chat Dock for multiplayer rooms */}
      {roomCode && <RoomVoiceDock anchorClassName="!static" />}
    </div>
  );
}
