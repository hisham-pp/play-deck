import {
  ClipboardList,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import type { MiniGolfState, ShotPreview } from '../engine/mini-golf-types';

interface MiniGolfHUDProps {
  state: MiniGolfState;
  shotPreview: ShotPreview | null;
  isFullscreen: boolean;
  localPlayerId?: string | null;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onOpenScorecard: () => void;
  onOpenStats: () => void;
  onRestartHole: () => void;
}

export const MiniGolfHUD: React.FC<MiniGolfHUDProps> = ({
  state,
  shotPreview,
  isFullscreen,
  localPlayerId,
  onToggleFullscreen,
  onToggleMute,
  onOpenScorecard,
  onOpenStats,
  onRestartHole,
}) => {
  const currentHole = state.holes[state.currentHoleIndex];
  const activePlayer = state.players[state.activePlayerIndex];
  const strokes = state.currentStrokes;
  const par = currentHole?.par ?? 3;

  const isMyTurn = localPlayerId ? activePlayer?.id === localPlayerId : true;

  const strokeColor =
    strokes === 0
      ? 'text-slate-300'
      : strokes <= par
        ? 'text-emerald-400'
        : strokes === par + 1
          ? 'text-amber-400'
          : 'text-rose-400';

  const powerPercent = shotPreview ? Math.round(shotPreview.power * 100) : 0;

  const presetLabel =
    state.coursePreset === 'front-9'
      ? 'Front 9'
      : state.coursePreset === 'back-9'
        ? 'Back 9'
        : '18 Holes';

  return (
    <div className="w-full flex flex-col gap-2 pointer-events-none select-none">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#111827]/90 border border-[#232f45] backdrop-blur-md shadow-lg pointer-events-auto flex-wrap gap-2">
        {/* Left: Hole & Par info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Hole {currentHole ? currentHole.id : 1} of {state.holes.length}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                {presetLabel}
              </span>
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              {currentHole?.name}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-600/40 text-emerald-400">
              Par {par}
            </span>
            <span className={`text-sm font-bold ${strokeColor}`}>
              {strokes} {strokes === 1 ? 'Stroke' : 'Strokes'}
            </span>
          </div>
        </div>

        {/* Center: Turn Banner for multiplayer */}
        {activePlayer && state.players.length > 1 && (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              isMyTurn
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm'
                : 'bg-[#1c2438] border-[#2b3852] text-slate-300'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: activePlayer.color }}
            />
            <span>
              {state.mode === 'online'
                ? isMyTurn
                  ? 'Your Turn to Putt!'
                  : `${activePlayer.name}'s Turn`
                : `${activePlayer.name}'s Turn`}
            </span>
          </div>
        )}

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenScorecard}
            title="View Scorecard"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#1c2438] transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenStats}
            title="Career Stats"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#1c2438] transition-colors"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title={state.isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2438] transition-colors"
          >
            {state.isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onRestartHole}
            title="Restart Hole"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-[#1c2438] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2438] transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-amber-400" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Live Power Gauge (when aiming/dragging) */}
      {shotPreview && state.phase === 'aiming' && (
        <div className="mx-auto w-72 max-w-full px-4 py-2 rounded-xl bg-[#111827]/90 border border-[#232f45] backdrop-blur-md shadow-xl flex flex-col gap-1 pointer-events-auto animate-fade-in">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Putt Power</span>
            <span className="text-amber-400">{powerPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
              style={{ width: `${powerPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
