import { Bot, Globe, LogOut, Play, Radio, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';
import { MiniGolfVoiceDock } from '@/features/voice/components/MiniGolfVoiceDock';
import {
  useMiniGolfMultiplayerStore,
  type GolfPlayerSeat,
} from '@/stores/mini-golf-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { CoursePreset, GameMode } from '../engine/mini-golf-types';
import { useMiniGolfControls } from '../hooks/use-mini-golf-controls';
import { useMiniGolfEngine } from '../hooks/use-mini-golf-engine';
import { useMiniGolfMultiplayer } from '../hooks/use-mini-golf-multiplayer';
import { MiniGolfCanvas } from './MiniGolfCanvas';
import { MiniGolfHoleClearModal } from './MiniGolfHoleClearModal';
import { MiniGolfHUD } from './MiniGolfHUD';
import { MiniGolfRoomLobby } from './MiniGolfRoomLobby';
import { MiniGolfScorecardModal } from './MiniGolfScorecardModal';
import { MiniGolfStatsModal } from './MiniGolfStatsModal';

export const MiniGolfGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const localPlayer = usePlayerStore((s) => s.player);

  const roomCode = useMiniGolfMultiplayerStore((s) => s.roomCode);
  const roomStatus = useMiniGolfMultiplayerStore((s) => s.status);
  const createRoom = useMiniGolfMultiplayerStore((s) => s.createRoom);
  const joinRoomByCode = useMiniGolfMultiplayerStore((s) => s.joinRoomByCode);
  const leaveRoom = useMiniGolfMultiplayerStore((s) => s.leaveRoom);
  const setRoomStatus = useMiniGolfMultiplayerStore((s) => s.setStatus);
  const isRoomHost = useMiniGolfMultiplayerStore((s) => s.isHost());
  const adoptSeats = useMiniGolfMultiplayerStore((s) => s.adoptSeats);
  const setStorePreset = useMiniGolfMultiplayerStore((s) => s.setCoursePreset);

  const {
    state,
    shotPreview,
    shoot,
    executeRemoteShot,
    updateAimPreview,
    clearAimPreview,
    nextHole,
    restart,
    toggleMute,
    changeMode,
    startCustomMatch,
  } = useMiniGolfEngine();

  const isOnline = state.mode === 'online';
  const activePlayer = state.players[state.activePlayerIndex];
  const isAiTurn = activePlayer?.isAi && state.phase === 'aiming';

  const isMyTurn = !isOnline || (localPlayer ? activePlayer?.id === localPlayer.id : false);
  const controlsDisabled =
    !isMyTurn || isAiTurn || isScorecardOpen || isStatsOpen || state.phase !== 'aiming';

  // Remote multiplayer hooks
  const { broadcastShot, broadcastNextHole, broadcastRestart, broadcastStart } =
    useMiniGolfMultiplayer({
      enabled: isOnline && roomStatus === 'playing',
      state,
      localPlayerId: localPlayer?.id ?? null,
      onRemoteShot: (playerId, angle, power) => {
        executeRemoteShot(playerId, angle, power);
      },
      onRemoteNextHole: () => {
        nextHole();
      },
      onRemoteRestart: () => {
        restart();
      },
      onStartMatch: (seats, preset) => {
        startCustomMatch('online', seats, preset);
        setRoomStatus('playing');
      },
      onSeatsUpdate: (seats) => {
        adoptSeats(seats);
      },
      onPresetUpdate: (preset) => {
        setStorePreset(preset);
      },
    });

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const handleShoot = useCallback(
    (angle: number, power: number) => {
      if (isOnline) {
        broadcastShot(angle, power);
      }
      shoot(angle, power);
    },
    [isOnline, broadcastShot, shoot],
  );

  const handleNextHole = useCallback(() => {
    if (isOnline) {
      if (isRoomHost) {
        broadcastNextHole();
        nextHole();
      }
      return;
    }
    nextHole();
  }, [isOnline, isRoomHost, broadcastNextHole, nextHole]);

  const handleRestart = useCallback(() => {
    if (isOnline) {
      if (isRoomHost) {
        broadcastRestart();
        restart();
      }
      return;
    }
    restart();
  }, [isOnline, isRoomHost, broadcastRestart, restart]);

  const handleStartOnlineMatch = useCallback(
    (seats: GolfPlayerSeat[], preset: CoursePreset) => {
      broadcastStart(seats, preset);
      startCustomMatch('online', seats, preset);
      setRoomStatus('playing');
    },
    [broadcastStart, startCustomMatch, setRoomStatus],
  );

  const handleHostRoom = async () => {
    if (!localPlayer) return;
    const code = await createRoom({
      id: localPlayer.id,
      displayName: localPlayer.displayName,
      avatar: localPlayer.avatar || '⛳',
    });
    if (code) {
      changeMode('online');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPlayer || !joinCodeInput.trim()) return;
    setIsJoining(true);
    setJoinError(null);
    const ok = await joinRoomByCode(joinCodeInput, {
      id: localPlayer.id,
      displayName: localPlayer.displayName,
      avatar: localPlayer.avatar || '⛳',
    });
    setIsJoining(false);
    if (ok) {
      changeMode('online');
    } else {
      setJoinError('Could not join room. Please check the code.');
    }
  };

  const handleLeaveOnlineRoom = () => {
    leaveRoom();
    changeMode('solo');
  };

  const {
    canvasRef,
    isDragging,
    dragCurrent,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useMiniGolfControls({
    ball: state.ball,
    isAiming: state.phase === 'aiming',
    disabled: controlsDisabled,
    onShoot: handleShoot,
    onAimUpdate: updateAimPreview,
    onAimCancel: clearAimPreview,
    onToggleFullscreen: toggleFullscreen,
    onResetHole: handleRestart,
  });

  // If arriving into an online room lobby
  if (isOnline && roomStatus === 'lobby') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] w-full p-4">
        <MiniGolfRoomLobby onStartGame={handleStartOnlineMatch} onLeave={handleLeaveOnlineRoom} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-between w-full h-full p-2 sm:p-4 bg-[#090d16] text-white select-none ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 max-w-none' : 'max-w-4xl mx-auto'
      }`}
    >
      {/* Mode Switcher Tabs */}
      {!isFullscreen && (
        <div className="w-full flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Mode:</span>
            <div className="flex rounded-lg bg-[#121929] p-1 border border-[#212c42]">
              {(['solo', 'vs-ai', 'pass-and-play', 'online'] as GameMode[]).map((m) => {
                const isActive = state.mode === m;
                const labels: Record<GameMode, { label: string; icon: React.ReactNode }> = {
                  solo: { label: 'Solo', icon: <Play className="w-3.5 h-3.5" /> },
                  'vs-ai': { label: 'vs AI', icon: <Bot className="w-3.5 h-3.5" /> },
                  'pass-and-play': {
                    label: 'Pass & Play',
                    icon: <Users className="w-3.5 h-3.5" />,
                  },
                  online: {
                    label: 'Online',
                    icon: <Globe className="w-3.5 h-3.5" />,
                  },
                };
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (m === 'online') {
                        if (!roomCode) {
                          // Open setup
                          changeMode('online');
                        }
                      } else {
                        if (roomCode) leaveRoom();
                        changeMode(m);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {labels[m].icon}
                    {labels[m].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Drag back to aim</span>
            <span>•</span>
            <span>[A] / [D] & [Space] to putt</span>
            <span>•</span>
            <span>[F] Fullscreen</span>
          </div>
        </div>
      )}

      {/* Online Connect Screen when Online mode chosen without an active room */}
      {isOnline && !roomCode && (
        <div className="w-full my-auto max-w-md mx-auto p-4">
          <Card className="border-amber-500/20 bg-slate-900/90 shadow-2xl backdrop-blur">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-black text-slate-100 flex items-center justify-center gap-2">
                <span>⛳</span>
                <span>Mini Golf Online</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Putt with friends in real-time with live WebRTC voice chat!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="primary"
                onClick={handleHostRoom}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Radio className="w-4 h-4" />
                Host New Online Match
              </Button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider absolute">
                  Or Join Match
                </span>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <Input
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Enter 6-character room code"
                  className="bg-slate-950/80 border-slate-700 text-center font-mono font-bold tracking-widest uppercase text-white"
                  maxLength={8}
                />
                {joinError && (
                  <p className="text-xs text-rose-400 text-center font-medium">{joinError}</p>
                )}
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!joinCodeInput.trim() || isJoining}
                  className="w-full border-slate-700 text-slate-200 hover:text-white"
                >
                  {isJoining ? 'Connecting…' : 'Join Room'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Game Stage (Active when not in online room setup) */}
      {(!isOnline || roomCode) && (
        <>
          {/* Main HUD overlay */}
          <div className="w-full mb-2">
            <MiniGolfHUD
              state={state}
              shotPreview={shotPreview}
              isFullscreen={isFullscreen}
              localPlayerId={localPlayer?.id}
              onToggleFullscreen={toggleFullscreen}
              onToggleMute={toggleMute}
              onOpenScorecard={() => setIsScorecardOpen(true)}
              onOpenStats={() => setIsStatsOpen(true)}
              onRestartHole={handleRestart}
            />
          </div>

          {/* Interactive Golf Course Stage */}
          <div className="relative flex-1 w-full flex items-center justify-center min-h-[360px] max-h-[78vh]">
            <MiniGolfCanvas
              state={state}
              shotPreview={shotPreview}
              canvasRef={canvasRef}
              isDragging={isDragging}
              dragCurrent={dragCurrent}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />

            {/* AI Bot thinking indicator */}
            {isAiTurn && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/40 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-amber-300 animate-pulse">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Ace Bot is reading the green...</span>
              </div>
            )}

            {/* Online Spectator Banner (when waiting for opponent) */}
            {isOnline && !isMyTurn && state.phase === 'aiming' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-bold text-slate-200">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: activePlayer?.color }}
                />
                <span>Waiting for {activePlayer?.name} to shoot...</span>
              </div>
            )}
          </div>

          {/* Voice Chat Dock in Online Mode */}
          {isOnline && roomCode && (
            <div className="mt-2 w-full max-w-sm">
              <MiniGolfVoiceDock anchorClassName="!static !w-full" />
            </div>
          )}

          {/* Course Complete Screen */}
          {state.phase === 'course-complete' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="w-full max-w-md rounded-2xl bg-[#0d1526] border-2 border-amber-500/40 shadow-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-1">
                  Course Complete!
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  {state.coursePreset === 'full-18'
                    ? 'You completed all 18 Championship holes.'
                    : `You completed all 9 holes of the ${state.coursePreset === 'back-9' ? 'Back 9' : 'Front 9'}.`}
                </p>

                {/* Final Standings */}
                <div className="space-y-2 mb-6">
                  {state.players.map((p, idx) => {
                    const card = state.scorecards[p.id];
                    const diff = card ? card.totalParDiff : 0;
                    const diffStr = diff > 0 ? `+${diff}` : diff === 0 ? 'E' : `${diff}`;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#141f36] border border-[#212f4c]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            #{idx + 1}
                          </span>
                          <span
                            className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.glyph === 'diamond' ? '◆' : p.glyph === 'star' ? '★' : '●'}
                          </span>
                          <span className="text-sm font-bold text-white">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-white">
                            {card?.totalStrokes ?? 0} strokes
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${diff < 0 ? 'text-emerald-400' : diff === 0 ? 'text-slate-300' : 'text-rose-400'}`}
                          >
                            ({diffStr})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsScorecardOpen(true)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-[#19243c] hover:bg-[#202f4e] transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Scorecard
                  </button>

                  {isOnline ? (
                    isRoomHost ? (
                      <button
                        type="button"
                        onClick={handleRestart}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Rematch
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleLeaveOnlineRoom}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Leave Room
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <MiniGolfHoleClearModal
            state={state}
            onNextHole={handleNextHole}
            onViewScorecard={() => setIsScorecardOpen(true)}
          />

          <MiniGolfScorecardModal
            state={state}
            isOpen={isScorecardOpen}
            onClose={() => setIsScorecardOpen(false)}
            onRestart={() => {
              setIsScorecardOpen(false);
              handleRestart();
            }}
          />

          <MiniGolfStatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
        </>
      )}
    </div>
  );
};
