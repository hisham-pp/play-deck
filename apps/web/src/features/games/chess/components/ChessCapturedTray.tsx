'use client';

import { PIECE_VALUES } from '../engine/chess-constants';
import { collectCaptures, materialAdvantage } from '../engine/chess-status';
import type { ChessMoveRecord, PieceColor, PieceType } from '../types/chess.types';
import { colorName, pieceName } from '../utils/chess-labels';

/** Outline glyphs read clearly at small sizes against either tray colour. */
const GLYPHS: Record<PieceType, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

/** Heaviest first, so a tray of captures reads as a ranking. */
const ORDER: PieceType[] = ['q', 'r', 'b', 'n', 'p'];

export interface ChessCapturedTrayProps {
  history: readonly ChessMoveRecord[];
  /** The side whose captures are shown. */
  color: PieceColor;
}

export function ChessCapturedTray({ history, color }: ChessCapturedTrayProps) {
  const captured = collectCaptures(history.map((record) => record.move));
  const taken = color === 'w' ? captured.byWhite : captured.byBlack;
  const lead = materialAdvantage(captured, color, PIECE_VALUES);

  const counts = ORDER.map((type) => ({
    type,
    count: taken.filter((piece) => piece === type).length,
  })).filter((entry) => entry.count > 0);

  const summary = counts.map((entry) => `${entry.count} ${pieceName(entry.type)}`).join(', ');

  return (
    <div
      className="flex items-center gap-1.5 min-h-[1.5rem]"
      aria-label={
        counts.length === 0
          ? `${colorName(color)} has captured nothing`
          : `${colorName(color)} has captured ${summary}`
      }
    >
      <span className="flex items-center gap-0.5 text-lg leading-none text-deck-400" aria-hidden>
        {counts.map((entry) => (
          <span key={entry.type} className="flex items-center">
            {GLYPHS[entry.type]}
            {entry.count > 1 && (
              <span className="text-[10px] font-bold text-deck-500 ml-0.5">{entry.count}</span>
            )}
          </span>
        ))}
      </span>

      {lead > 0 && (
        <span className="text-[11px] font-bold text-emerald-400 tabular-nums" aria-hidden>
          +{lead}
        </span>
      )}
    </div>
  );
}
