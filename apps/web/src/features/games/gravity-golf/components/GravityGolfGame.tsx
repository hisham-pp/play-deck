'use client';

import React, { useEffect, useState } from 'react';
import { GravityGolfVoiceDock } from '@/features/voice/components/GravityGolfVoiceDock';
import { useGravityGolfMultiplayerStore } from '@/stores/gravity-golf-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { COSMIC_HOLES } from '../engine/holes-catalog';
import { useGravityGolfGame } from '../hooks/use-gravity-golf-game';
import type { GameMode } from '../types/gravity-golf.types';
import { GravityGolfCanvas } from './GravityGolfCanvas';
import { GravityGolfHud } from './GravityGolfHud';
import { GravityGolfLobby } from './GravityGolfLobby';
import { GravityGolfRoomLobby } from './GravityGolfRoomLobby';
import { GravityGolfScorecard } from './GravityGolfScorecard';
import { GravityGolfToolbar } from './GravityGolfToolbar';
import { GravityGolfVictoryModal } from './GravityGolfVictoryModal';

export function GravityGolfGame() {
  const { player } = usePlayerStore();
  const multiplayer = useGravityGolfMultiplayerStore();

  const [activeMode, setActiveMode] = useState<GameMode>('solo');
  const [inLobbyMenu, setInLobbyMenu] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  const game = useGravityGolfGame(multiplayer.activeHoleNumber, activeMode);

  // If multiplayer room updates active hole or placed objects from remote
  useEffect(() => {
    if (multiplayer.roomCode && multiplayer.status === 'playing') {
      if (multiplayer.activeHoleNumber !== game.hole.number) {
        game.goToHole(multiplayer.activeHoleNumber);
      }
    }
  }, [multiplayer.roomCode, multiplayer.status, multiplayer.activeHoleNumber, game]);

  // Sync multiplayer remote launch
  useEffect(() => {
    if (multiplayer.lastLaunchTrigger) {
      game.launch();
    }
  }, [multiplayer.lastLaunchTrigger, game]);

  // Handle solo start
  const handleStartSolo = () => {
    multiplayer.leaveRoom();
    setActiveMode('solo');
    setInLobbyMenu(false);
  };

  // Handle pass & play start
  const handleStartPassAndPlay = (_playerCount: number) => {
    multiplayer.leaveRoom();
    setActiveMode('pass-and-play');
    setInLobbyMenu(false);
  };

  // Handle create online room
  const handleCreateOnlineRoom = async () => {
    if (!player) return;
    const code = await multiplayer.createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '⛳',
    });
    if (code) {
      setActiveMode('multiplayer');
      setInLobbyMenu(false);
    }
  };

  // Handle join online room
  const handleJoinOnlineRoom = async (code: string) => {
    if (!player) return;
    setIsJoiningRoom(true);
    const ok = await multiplayer.joinRoomByCode(code, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '⛳',
    });
    setIsJoiningRoom(false);
    if (ok) {
      setActiveMode('multiplayer');
      setInLobbyMenu(false);
    }
  };

  // Start game from room lobby
  const handleStartMultiplayerGame = () => {
    multiplayer.setStatus('playing');
  };

  // Leave room
  const handleLeaveRoom = () => {
    multiplayer.leaveRoom();
    setActiveMode('solo');
    setInLobbyMenu(true);
  };

  // If in online room lobby
  if (multiplayer.roomCode && multiplayer.status === 'lobby') {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-6">
        <GravityGolfRoomLobby
          onStartGame={handleStartMultiplayerGame}
          onLeaveRoom={handleLeaveRoom}
        />
        <GravityGolfVoiceDock anchorClassName="fixed bottom-6 right-6 z-50" />
      </div>
    );
  }

  // If viewing main menu / lobby
  if (inLobbyMenu) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 flex flex-col gap-6">
        <GravityGolfLobby
          onStartSolo={handleStartSolo}
          onStartPassAndPlay={handleStartPassAndPlay}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
          isJoining={isJoiningRoom}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Top HUD */}
      <GravityGolfHud
        hole={game.hole}
        strokes={game.placedObjects.length}
        scoreTerm={game.scoreTerm}
        soundEnabled={game.soundEnabled}
        onToggleSound={game.toggleSound}
        showTrajectory={game.showTrajectory}
        onToggleTrajectory={() => game.setShowTrajectory(!game.showTrajectory)}
        highContrast={game.highContrast}
        onToggleHighContrast={() => game.setHighContrast(!game.highContrast)}
        reducedMotion={game.reducedMotion}
        onToggleReducedMotion={() => game.setReducedMotion(!game.reducedMotion)}
        onSelectHole={(hNum) => {
          if (multiplayer.roomCode) {
            multiplayer.selectHole(hNum);
          }
          game.goToHole(hNum);
        }}
      />

      {/* Interactive Arena Canvas */}
      <GravityGolfCanvas
        ball={game.ball}
        objects={game.allObjects}
        hazards={game.hole.hazards}
        walls={game.hole.walls}
        cup={game.hole.cup}
        trajectoryPoints={game.trajectoryPoints}
        selectedTool={game.selectedTool}
        selectedObjectId={game.selectedObjectId}
        previewHoverPos={game.previewHoverPos}
        reducedMotion={game.reducedMotion}
        highContrast={game.highContrast}
        showTrajectory={game.showTrajectory}
        onTick={game.stepSimulation}
        onPlaceObject={(pos, type) => {
          game.placeObject(pos, type);
          if (multiplayer.roomCode) {
            const newObj = {
              id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              type,
              position: { ...pos },
              radius: type === 'orbit-ring' ? 55 : 24,
              strength: 1,
            };
            multiplayer.placeObject(newObj);
          }
        }}
        onSelectObject={game.setSelectedObjectId}
        onMoveObject={(id, pos) => {
          game.updateObject(id, { position: pos });
          const updated = game.placedObjects.find((o) => o.id === id);
          if (updated && multiplayer.roomCode) {
            multiplayer.placeObject({ ...updated, position: pos });
          }
        }}
        onHoverPosChange={game.setPreviewHoverPos}
      />

      {/* Bottom Placement & Action Toolbar */}
      <GravityGolfToolbar
        selectedTool={game.selectedTool}
        onSelectTool={game.setSelectedTool}
        allowedItems={game.hole.allowedItems}
        itemCounts={game.itemCounts}
        selectedObjectId={game.selectedObjectId}
        onDeleteSelected={() => {
          if (game.selectedObjectId) {
            if (multiplayer.roomCode) {
              multiplayer.removeObject(game.selectedObjectId);
            }
            game.removeObject(game.selectedObjectId);
          }
        }}
        ballStatus={game.ball.status}
        onLaunch={() => {
          if (multiplayer.roomCode) {
            multiplayer.broadcastLaunch();
          }
          game.launch();
        }}
        onResetBall={game.resetBall}
        onClearAll={() => {
          if (multiplayer.roomCode) {
            multiplayer.clearObjects();
          }
          game.resetHole();
        }}
      />

      {/* Galactic Scorecard */}
      <GravityGolfScorecard
        scores={game.holeScores}
        currentHoleNumber={game.hole.number}
        onSelectHole={(hNum) => {
          if (multiplayer.roomCode) {
            multiplayer.selectHole(hNum);
          }
          game.goToHole(hNum);
        }}
      />

      {/* Mode Switcher / Flight Terminal Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-deck-400">
        <button
          type="button"
          onClick={() => setInLobbyMenu(true)}
          className="hover:text-white transition-colors cursor-pointer"
        >
          ← Game Mode Menu (
          {activeMode === 'solo'
            ? 'Solo Campaign'
            : activeMode === 'pass-and-play'
              ? 'Pass & Play'
              : 'Online Room'}
          )
        </button>

        {multiplayer.roomCode && (
          <span className="font-mono text-amber-400 font-bold">
            Room Code: {multiplayer.roomCode}
          </span>
        )}
      </div>

      {/* Victory Modal */}
      <GravityGolfVictoryModal
        isOpen={game.isVictoryModalOpen}
        hole={game.hole}
        strokes={game.placedObjects.length}
        onNextHole={() => {
          if (multiplayer.roomCode) {
            multiplayer.selectHole(game.hole.number + 1);
          }
          game.nextHole();
        }}
        onReplay={() => {
          game.setIsVictoryModalOpen(false);
          game.resetBall();
        }}
        onClose={() => game.setIsVictoryModalOpen(false)}
        hasNextHole={game.holeIndex < COSMIC_HOLES.length - 1}
      />

      {/* Voice Chat Dock in Online Room */}
      {multiplayer.roomCode && (
        <GravityGolfVoiceDock anchorClassName="fixed bottom-6 right-6 z-50" />
      )}
    </div>
  );
}
