'use client';

import { ArrowLeft, Bot, Globe, RotateCcw, Sparkles, Users, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@playdeck/ui';
import { TinyIslandVoiceDock } from '@/features/voice/components/TinyIslandVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import {
  useTinyIslandMultiplayerStore,
  type IslandPlayerSeat,
} from '@/stores/tiny-island-multiplayer.store';
import type { GridCoord, IslandPlayer } from '../engine/tiny-island-types';
import { useTinyIslandEngine } from '../hooks/use-tiny-island-engine';
import { useTinyIslandMultiplayer } from '../hooks/use-tiny-island-multiplayer';
import { islandSound } from '../services/island-sound.service';
import { TinyIslandCanvas, type CanvasInteractionMode } from './TinyIslandCanvas';
import { TinyIslandHUD } from './TinyIslandHUD';
import { TinyIslandRoomLobby } from './TinyIslandRoomLobby';

type ScreenState = 'menu' | 'lobby' | 'playing';

export function TinyIslandGame() {
  const { player } = usePlayerStore();
  const [screen, setScreen] = useState<ScreenState>('menu');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [interactionMode, setInteractionMode] = useState<CanvasInteractionMode>('select');
  const [isMuted, setIsMuted] = useState(false);

  const { roomCode, isHost, localSeatIndex, createRoom, joinRoomByCode, leaveRoom, error } =
    useTinyIslandMultiplayerStore();

  const { gameState, startMatch, performAction, applyRemoteAction, applyRemoteState } =
    useTinyIslandEngine({
      onActionBroadcast: (action) => broadcastAction(action),
      onStateBroadcast: (state) => broadcastSyncState(state),
      isHost: roomCode ? isHost : true,
    });

  const { broadcastAction, broadcastSyncState, broadcastStartGame } = useTinyIslandMultiplayer({
    onRemoteAction: (action) => applyRemoteAction(action),
    onRemoteSyncState: (state) => applyRemoteState(state),
    onRemoteStartGame: () => setScreen('playing'),
  });

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    islandSound.setMuted(next);
  };

  const handleStartSolo = (botCount: number = 3) => {
    const configs = [
      {
        id: player?.id || 'player-1',
        displayName: player?.displayName || 'Survivor',
        avatar: player?.avatar || '🌴',
        isBot: false,
      },
      ...Array.from({ length: botCount }, (_, i) => ({
        id: `bot-${i + 1}`,
        displayName: ['Chuck', 'Barnaby', 'Shelly', 'Gulliver', 'Pegleg'][i],
        avatar: ['🦜', '🦀', '🥥', '⛵', '🦈'][i],
        isBot: true,
      })),
    ];
    startMatch(configs);
    setScreen('playing');
  };

  const handleStartLocal2P = () => {
    const configs = [
      {
        id: 'player-1',
        displayName: 'Player 1 (North)',
        avatar: '🌴',
        isBot: false,
      },
      {
        id: 'player-2',
        displayName: 'Player 2 (South)',
        avatar: '🦀',
        isBot: false,
      },
    ];
    startMatch(configs);
    setScreen('playing');
  };

  const handleCreateOnlineRoom = async () => {
    if (!player) return;
    await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
    });
    setScreen('lobby');
  };

  const handleJoinOnlineRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player || !joinCodeInput) return;
    const ok = await joinRoomByCode(joinCodeInput, {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
    });
    if (ok) setScreen('lobby');
  };

  const handleLobbyStartGame = (seats: IslandPlayerSeat[]) => {
    const activeSeats = seats.filter((s) => s.playerId !== null || s.isBot);
    const configs = activeSeats.map((s) => ({
      id: s.playerId || `bot-${s.seatIndex}`,
      displayName: s.displayName || `Survivor ${s.seatIndex + 1}`,
      avatar: s.avatar,
      color: s.color,
      isBot: s.isBot,
    }));

    startMatch(configs);
    broadcastStartGame();
    setScreen('playing');
  };

  // Keyboard navigation for active player
  useEffect(() => {
    if (screen !== 'playing' || gameState.phase !== 'playing') return;

    const activePlayer = gameState.players.find(
      (p) => p.seatIndex === gameState.currentTurnSeatIndex,
    );
    const isLocalTurn =
      activePlayer &&
      (localSeatIndex === null || activePlayer.seatIndex === localSeatIndex) &&
      !activePlayer.isBot;

    if (!isLocalTurn) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        performAction({
          type: 'MOVE',
          seatIndex: activePlayer.seatIndex,
          targetCoord: { x: activePlayer.x, y: activePlayer.y - 1 },
        });
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        performAction({
          type: 'MOVE',
          seatIndex: activePlayer.seatIndex,
          targetCoord: { x: activePlayer.x, y: activePlayer.y + 1 },
        });
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        performAction({
          type: 'MOVE',
          seatIndex: activePlayer.seatIndex,
          targetCoord: { x: activePlayer.x - 1, y: activePlayer.y },
        });
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        performAction({
          type: 'MOVE',
          seatIndex: activePlayer.seatIndex,
          targetCoord: { x: activePlayer.x + 1, y: activePlayer.y },
        });
      } else if (e.code === 'KeyG') {
        performAction({
          type: 'GATHER',
          seatIndex: activePlayer.seatIndex,
        });
      } else if (e.code === 'Space') {
        e.preventDefault();
        performAction({
          type: 'PASS',
          seatIndex: activePlayer.seatIndex,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, gameState, localSeatIndex, performAction]);

  const handleTileClick = (coord: GridCoord) => {
    const activePlayer = gameState.players.find(
      (p) => p.seatIndex === gameState.currentTurnSeatIndex,
    );
    if (!activePlayer || activePlayer.isBot) return;

    if (interactionMode === 'move') {
      performAction({
        type: 'MOVE',
        seatIndex: activePlayer.seatIndex,
        targetCoord: coord,
      });
      setInteractionMode('select');
    } else if (interactionMode === 'build_bridge') {
      performAction({
        type: 'BUILD_BRIDGE',
        seatIndex: activePlayer.seatIndex,
        targetCoord: coord,
      });
      setInteractionMode('select');
    } else if (interactionMode === 'build_barrier') {
      performAction({
        type: 'BUILD_BARRIER',
        seatIndex: activePlayer.seatIndex,
        targetCoord: coord,
      });
      setInteractionMode('select');
    }
  };

  const handlePlayerClick = (clickedPlayer: IslandPlayer) => {
    const activePlayer = gameState.players.find(
      (p) => p.seatIndex === gameState.currentTurnSeatIndex,
    );
    if (!activePlayer || activePlayer.isBot) return;
    if (clickedPlayer.seatIndex === activePlayer.seatIndex) return;

    if (interactionMode === 'push') {
      performAction({
        type: 'PUSH',
        seatIndex: activePlayer.seatIndex,
        targetPlayerId: clickedPlayer.id,
      });
      setInteractionMode('select');
    } else if (interactionMode === 'steal') {
      performAction({
        type: 'STEAL',
        seatIndex: activePlayer.seatIndex,
        targetPlayerId: clickedPlayer.id,
      });
      setInteractionMode('select');
    }
  };

  // 1. Lobby screen in an active room
  if (roomCode && screen === 'lobby') {
    return (
      <TinyIslandRoomLobby onStartGame={handleLobbyStartGame} onLeave={() => setScreen('menu')} />
    );
  }

  // 2. Active Game screen
  if (screen === 'playing') {
    const isOver = gameState.phase === 'game_over';
    const winner =
      gameState.winnerSeatIndex !== null
        ? gameState.players.find((p) => p.seatIndex === gameState.winnerSeatIndex)
        : null;

    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 py-3">
        {/* Top Header bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (roomCode) leaveRoom();
              setScreen('menu');
            }}
            className="gap-2 text-deck-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Abandon Island</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMute}
              className="text-deck-400 hover:text-white p-2"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Room Voice Dock if in an online match */}
        {roomCode && <TinyIslandVoiceDock defaultOpen={false} />}

        {/* Main Game Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <TinyIslandCanvas
              gameState={gameState}
              localSeatIndex={localSeatIndex}
              interactionMode={interactionMode}
              onTileClick={handleTileClick}
              onPlayerClick={handlePlayerClick}
            />
          </div>

          {/* HUD & Control Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <TinyIslandHUD
              gameState={gameState}
              localSeatIndex={localSeatIndex}
              interactionMode={interactionMode}
              setInteractionMode={setInteractionMode}
              onGather={() => {
                const active = gameState.players.find(
                  (p) => p.seatIndex === gameState.currentTurnSeatIndex,
                );
                if (active) performAction({ type: 'GATHER', seatIndex: active.seatIndex });
              }}
              onCraftRaft={() => {
                const active = gameState.players.find(
                  (p) => p.seatIndex === gameState.currentTurnSeatIndex,
                );
                if (active) performAction({ type: 'CRAFT_RAFT', seatIndex: active.seatIndex });
              }}
              onCraftSpear={() => {
                const active = gameState.players.find(
                  (p) => p.seatIndex === gameState.currentTurnSeatIndex,
                );
                if (active) performAction({ type: 'CRAFT_SPEAR', seatIndex: active.seatIndex });
              }}
              onPass={() => {
                const active = gameState.players.find(
                  (p) => p.seatIndex === gameState.currentTurnSeatIndex,
                );
                if (active) performAction({ type: 'PASS', seatIndex: active.seatIndex });
              }}
            />
          </div>
        </div>

        {/* Game Over Modal Overlay */}
        {isOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <Card className="w-full max-w-md border-amber-500/40 bg-surface-raised shadow-2xl">
              <CardContent className="pt-6 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                  {winner ? '🏆' : '🌊'}
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white font-display">
                    {winner ? `${winner.displayName} Wins!` : 'Swallowed by the Deep!'}
                  </h3>
                  <p className="text-xs text-deck-400 mt-1">
                    {winner
                      ? 'The last castaway standing on Tiny Island.'
                      : 'All survivors were claimed by the rising tides.'}
                  </p>
                </div>

                {winner && (
                  <div className="w-full bg-surface-sunken/80 rounded-xl p-3 border border-surface-border text-xs flex justify-around text-deck-300">
                    <div>
                      <div className="text-deck-500 text-[10px] uppercase">Harvested</div>
                      <div className="font-bold text-deck-100 text-sm">
                        {winner.stats.resourcesGathered} 🪵
                      </div>
                    </div>
                    <div>
                      <div className="text-deck-500 text-[10px] uppercase">Fortified</div>
                      <div className="font-bold text-deck-100 text-sm">
                        {winner.stats.structuresBuilt} 🛠️
                      </div>
                    </div>
                    <div>
                      <div className="text-deck-500 text-[10px] uppercase">Pushes</div>
                      <div className="font-bold text-deck-100 text-sm">
                        {winner.stats.playersPushed} 💨
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 w-full mt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setScreen('menu')}>
                    Main Menu
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 gap-1.5"
                    onClick={() => handleStartSolo(3)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // 3. Menu Screen
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6">
      {/* Hero Header */}
      <div className="text-center flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sinking Island Survival</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display tracking-tight">
          Tiny Island
        </h1>
        <p className="text-sm text-deck-400 max-w-lg">
          The tropical island loses tiles to the ocean every round. Collect wood and stone,
          construct wooden bridges, erect barricades, and shove rivals into the deep!
        </p>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solo vs Bots */}
        <Card className="hover:border-amber-500/40 transition-all bg-surface-raised/80">
          <CardContent className="pt-6 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-3">
                🤖
              </div>
              <h3 className="font-bold text-lg text-white">Solo Survival</h3>
              <p className="text-xs text-deck-400 mt-1">
                Test your wits against 3 tactical AI bots that gather, fortify, and push.
              </p>
            </div>
            <Button variant="primary" onClick={() => handleStartSolo(3)} className="w-full gap-2">
              <Bot className="w-4 h-4" />
              <span>Play vs Bots</span>
            </Button>
          </CardContent>
        </Card>

        {/* Local 2-Player Pass & Play */}
        <Card className="hover:border-sky-500/40 transition-all bg-surface-raised/80">
          <CardContent className="pt-6 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-3">
                👥
              </div>
              <h3 className="font-bold text-lg text-white">Local Duels</h3>
              <p className="text-xs text-deck-400 mt-1">
                2 players on one keyboard or touch screen. North vs South island showdown.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleStartLocal2P}
              className="w-full gap-2 border-sky-500/30 hover:border-sky-500/60"
            >
              <Users className="w-4 h-4" />
              <span>Pass & Play</span>
            </Button>
          </CardContent>
        </Card>

        {/* Online Multiplayer with Voice */}
        <Card className="hover:border-purple-500/40 transition-all bg-surface-raised/80">
          <CardContent className="pt-6 flex flex-col justify-between h-full gap-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-3">
                🎙️
              </div>
              <h3 className="font-bold text-lg text-white">Online Expeditions</h3>
              <p className="text-xs text-deck-400 mt-1">
                2–6 players with integrated WebRTC voice chat for alliances and betrayals.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleCreateOnlineRoom}
                className="w-full gap-2 border-purple-500/30 hover:border-purple-500/60"
              >
                <Globe className="w-4 h-4" />
                <span>Create Room</span>
              </Button>

              <form onSubmit={handleJoinOnlineRoom} className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit code"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="flex-1 bg-[#111827] border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-deck-500 focus:outline-none focus:border-purple-500"
                />
                <Button type="submit" variant="ghost" size="sm" className="text-xs">
                  Join
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && <div className="text-center text-xs text-rose-400 font-medium">{error}</div>}
    </div>
  );
}
