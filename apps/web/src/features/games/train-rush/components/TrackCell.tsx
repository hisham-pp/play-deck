'use client';

import React from 'react';

import type { GridCell, TrackPiece } from '../engine/train-rush-engine';

interface TrackCellProps {
  cell: GridCell;
  previewPiece?: TrackPiece | null;
  onClick: (x: number, y: number) => void;
  onRightClick: (x: number, y: number) => void;
  disabled?: boolean;
}

export const TrackCell: React.FC<TrackCellProps> = ({
  cell,
  previewPiece,
  onClick,
  onRightClick,
  disabled = false,
}) => {
  const { x, y, type, piece, isPartOfRoute, isObstacle, isStart, isDestination, bonusPoints } =
    cell;

  // Determine what piece to render (either placed piece, or ghost preview if hovered)
  const activePiece = piece || (type === 'empty' && previewPiece ? previewPiece : null);
  const isGhost = !piece && activePiece !== null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onClick(x, y);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    onRightClick(x, y);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      disabled={disabled || (isObstacle && !(type === 'water' && previewPiece?.type === 'bridge'))}
      aria-label={`Cell ${x},${y} ${type}`}
      className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-lg border transition-all duration-150 select-none overflow-hidden ${
        isStart
          ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10'
          : isDestination
            ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
            : isPartOfRoute
              ? 'bg-[#152338] border-amber-400/90 shadow-md shadow-amber-400/20'
              : type === 'water'
                ? 'bg-sky-950/60 border-sky-800/60'
                : type === 'mountain' || type === 'obstacle'
                  ? 'bg-stone-900/80 border-stone-700/60 cursor-not-allowed'
                  : 'bg-[#101827] border-[#1f2c42] hover:border-slate-500/80 hover:bg-[#162236]'
      }`}
    >
      {/* Background terrain details */}
      {type === 'water' && !piece && (
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
          <svg
            className="w-6 h-6 text-sky-400 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15c3-1.5 6-1.5 9 0s6 1.5 9 0M3 9c3-1.5 6-1.5 9 0s6 1.5 9 0"
            />
          </svg>
        </div>
      )}

      {(type === 'obstacle' || type === 'mountain') && (
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <span className="text-sm sm:text-base">{type === 'mountain' ? '⛰️' : '🪨'}</span>
        </div>
      )}

      {/* Start depot badge */}
      {isStart && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <span className="text-base sm:text-lg">🚂</span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-400 tracking-wider">
            START
          </span>
        </div>
      )}

      {/* Destination station badge */}
      {isDestination && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <span className="text-base sm:text-lg">🏁</span>
          <span className="text-[8px] sm:text-[9px] font-black uppercase text-amber-400 tracking-wider">
            GOAL
          </span>
        </div>
      )}

      {/* Track piece SVG rendering */}
      {activePiece && !isStart && !isDestination && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isGhost ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <svg
            className="w-full h-full p-0.5"
            viewBox="0 0 100 100"
            style={{
              transform: `rotate(${activePiece.rotation}deg)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* Straight Piece */}
            {(activePiece.type === 'straight' ||
              activePiece.type === 'bridge' ||
              activePiece.type === 'station') && (
              <g>
                {/* Ties / Sleepers */}
                <line
                  x1="30"
                  y1="20"
                  x2="70"
                  y2="20"
                  stroke="#5c4033"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="30"
                  y1="40"
                  x2="70"
                  y2="40"
                  stroke="#5c4033"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="30"
                  y1="60"
                  x2="70"
                  y2="60"
                  stroke="#5c4033"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="30"
                  y1="80"
                  x2="70"
                  y2="80"
                  stroke="#5c4033"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                {/* Steel Rails */}
                <line
                  x1="38"
                  y1="0"
                  x2="38"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <line
                  x1="62"
                  y1="0"
                  x2="62"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                {/* Glowing power rail if connected */}
                {isPartOfRoute && (
                  <line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="100"
                    stroke="#fef08a"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                )}
                {/* Station platform icon */}
                {activePiece.type === 'station' && (
                  <rect
                    x="22"
                    y="32"
                    width="56"
                    height="36"
                    rx="4"
                    fill="#0f172a"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                )}
              </g>
            )}

            {/* Curved Piece (N-E corner) */}
            {activePiece.type === 'curve' && (
              <g>
                {/* Ties */}
                <path
                  d="M 40 0 A 50 50 0 0 1 100 60"
                  fill="none"
                  stroke="#5c4033"
                  strokeWidth="6"
                  strokeDasharray="8 12"
                />
                {/* Rails */}
                <path
                  d="M 38 0 A 62 62 0 0 1 100 62"
                  fill="none"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <path
                  d="M 62 0 A 38 38 0 0 1 100 38"
                  fill="none"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                {isPartOfRoute && (
                  <path
                    d="M 50 0 A 50 50 0 0 1 100 50"
                    fill="none"
                    stroke="#fef08a"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                )}
              </g>
            )}

            {/* T-Junction (N-E-S) */}
            {activePiece.type === 't-junction' && (
              <g>
                {/* Straight N-S */}
                <line
                  x1="38"
                  y1="0"
                  x2="38"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <line
                  x1="62"
                  y1="0"
                  x2="62"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                {/* Right Branch E */}
                <line
                  x1="62"
                  y1="38"
                  x2="100"
                  y2="38"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <line
                  x1="62"
                  y1="62"
                  x2="100"
                  y2="62"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
              </g>
            )}

            {/* Crossroad (4-way) */}
            {activePiece.type === 'crossroad' && (
              <g>
                {/* N-S */}
                <line
                  x1="38"
                  y1="0"
                  x2="38"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <line
                  x1="62"
                  y1="0"
                  x2="62"
                  y2="100"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                {/* E-W */}
                <line
                  x1="0"
                  y1="38"
                  x2="100"
                  y2="38"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
                <line
                  x1="0"
                  y1="62"
                  x2="100"
                  y2="62"
                  stroke={isPartOfRoute ? '#f59e0b' : '#94a3b8'}
                  strokeWidth="4"
                />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Bonus station badge */}
      {bonusPoints && !isStart && !isDestination && !piece && (
        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[8px] font-bold">
          +{bonusPoints}
        </div>
      )}
    </button>
  );
};
