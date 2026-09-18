import { Bot, Play, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import React, { useRef, useState } from 'react';
import type { GameMode } from '../engine/mini-golf-types';
import { useMiniGolfControls } from '../hooks/use-mini-golf-controls';
import { useMiniGolfEngine } from '../hooks/use-mini-golf-engine';
import { MiniGolfCanvas } from './MiniGolfCanvas';
import { MiniGolfHoleClearModal } from './MiniGolfHoleClearModal';
import { MiniGolfHUD } from './MiniGolfHUD';
import { MiniGolfScorecardModal } from './MiniGolfScorecardModal';
import { MiniGolfStatsModal } from './MiniGolfStatsModal';

export const MiniGolfGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    state,
    shotPreview,
    shoot,
    updateAimPreview,
    clearAimPreview,
    nextHole,
    restart,
    toggleMute,
    changeMode,
  } = useMiniGolfEngine();

  const activePlayer = state.players[state.activePlayerIndex];
  const isAiTurn = activePlayer?.isAi && state.phase === 'aiming';

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
    disabled: isAiTurn || isScorecardOpen || isStatsOpen,
    onShoot: shoot,
    onAimUpdate: updateAimPreview,
    onAimCancel: clearAimPreview,
    onToggleFullscreen: toggleFullscreen,
    onResetHole: restart,
  });

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
              {(['solo', 'vs-ai', 'pass-and-play'] as GameMode[]).map((m) => {
                const isActive = state.mode === m;
                const labels: Record<GameMode, { label: string; icon: React.ReactNode }> = {
                  solo: { label: 'Solo', icon: <Play className="w-3.5 h-3.5" /> },
                  'vs-ai': { label: 'vs AI', icon: <Bot className="w-3.5 h-3.5" /> },
                  'pass-and-play': {
                    label: 'Pass & Play',
                    icon: <Users className="w-3.5 h-3.5" />,
                  },
                };
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => changeMode(m)}
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

      {/* Main HUD overlay */}
      <div className="w-full mb-2">
        <MiniGolfHUD
          state={state}
          shotPreview={shotPreview}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onToggleMute={toggleMute}
          onOpenScorecard={() => setIsScorecardOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onRestartHole={restart}
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
      </div>

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
            <p className="text-xs text-slate-400 mb-6">You finished all 9 championship holes.</p>

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
                      <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 1}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
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
              <button
                type="button"
                onClick={restart}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MiniGolfHoleClearModal
        state={state}
        onNextHole={nextHole}
        onViewScorecard={() => setIsScorecardOpen(true)}
      />

      <MiniGolfScorecardModal
        state={state}
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        onRestart={() => {
          setIsScorecardOpen(false);
          restart();
        }}
      />

      <MiniGolfStatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
};
