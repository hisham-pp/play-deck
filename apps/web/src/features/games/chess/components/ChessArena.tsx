'use client';

import { ArrowLeft, PanelRightClose, PanelRightOpen } from 'lucide-react';
import Link from 'next/link';
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ChessGameState, PieceColor } from '../types/chess.types';
import { ChessBoard } from './ChessBoard';
import { ChessControls, type ChessControlsProps } from './ChessControls';
import { ChessHelpCard } from './ChessHelpCard';
import { ChessMoveList } from './ChessMoveList';
import { ChessPlayerCard } from './ChessPlayerCard';
import { ChessStatusBanner, type ChessStatusBannerProps } from './ChessStatusBanner';
import type { BoardHighlights } from './three/ChessBoard3D';

const HUD_SURFACE = 'backdrop-blur-md';

export interface ChessArenaProps {
  /** The live game, which drives every panel. */
  state: ChessGameState;
  /** What the board shows, which differs from `state` while reviewing. */
  boardState: ChessGameState;
  names: Record<PieceColor, string>;
  orientation: PieceColor;
  highlights: BoardHighlights;
  cursor: number;
  reviewPly: number | null;
  isOnline: boolean;
  onSelectSquare: (square: number) => void;
  onFocusSquare: (square: number) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onReviewPly: (ply: number | null) => void;
  banner: Omit<ChessStatusBannerProps, 'state'>;
  controls: Omit<ChessControlsProps, 'state' | 'isOnline'>;
  /** Room chat and voice. They must live inside the stage to stack above it. */
  children?: ReactNode;
}

/** A HUD region that takes clicks while the stage around it passes them through. */
function Hud({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('pointer-events-auto', className)}>{children}</div>;
}

/**
 * The full-screen match stage, laid out the way Ludo and Pen Fight are: the 3D
 * board fills the viewport and the HUD floats over it. The far player's card
 * sits at the top and the near player's at the bottom, so the screen matches
 * where the two players are sitting.
 */
export function ChessArena({
  state,
  boardState,
  names,
  orientation,
  highlights,
  cursor,
  reviewPly,
  isOnline,
  onSelectSquare,
  onFocusSquare,
  onKeyDown,
  onReviewPly,
  banner,
  controls,
  children,
}: ChessArenaProps) {
  // The side panel starts open on wide screens only; phones get the board first.
  const [panelOpen, setPanelOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches,
  );
  const near = orientation;
  const far: PieceColor = orientation === 'w' ? 'b' : 'w';
  const PanelIcon = panelOpen ? PanelRightClose : PanelRightOpen;

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen select-none bg-[#070b14]">
      <ChessBoard
        state={boardState}
        orientation={orientation}
        highlights={highlights}
        cursor={cursor}
        onSelectSquare={onSelectSquare}
        onFocusSquare={onFocusSquare}
        onKeyDown={onKeyDown}
        // Beside an open side panel the board takes only the space left of it.
        className={cn('absolute inset-0', panelOpen && 'sm:right-[22rem]')}
      />

      <div className="pointer-events-none absolute inset-0 flex gap-3 p-3 sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="flex flex-col gap-2 sm:max-w-sm">
            <div className="flex items-center gap-2">
              <Hud>
                <Link
                  href="/games"
                  className={`inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised/80 px-3 py-2 text-xs font-medium text-deck-400 transition-colors hover:text-white ${HUD_SURFACE}`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back to games</span>
                </Link>
              </Hud>
              <Hud className="ml-auto sm:hidden">
                <button
                  type="button"
                  onClick={() => setPanelOpen((open) => !open)}
                  aria-expanded={panelOpen}
                  aria-controls="chess-side-panel"
                  className={`rounded-lg border border-surface-border bg-surface-raised/80 p-2 text-deck-300 ${HUD_SURFACE}`}
                >
                  <PanelIcon className="h-4 w-4" />
                  <span className="sr-only">{panelOpen ? 'Hide' : 'Show'} game panel</span>
                </button>
              </Hud>
            </div>
            <Hud className={HUD_SURFACE}>
              <ChessPlayerCard state={state} color={far} name={names[far]} />
            </Hud>
            {reviewPly !== null && (
              <Hud>
                <p className="rounded-lg border border-amber-500/40 bg-amber-950/80 px-3 py-1.5 text-[11px] font-semibold text-amber-300">
                  Reviewing move {reviewPly}. Touch the board to return to the game.
                </p>
              </Hud>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:max-w-sm">
            {/* On narrow screens the status sits with the near player, always in view. */}
            <Hud className="lg:hidden">
              <ChessStatusBanner state={state} {...banner} />
            </Hud>
            <Hud className={HUD_SURFACE}>
              <ChessPlayerCard state={state} color={near} name={names[near]} />
            </Hud>
          </div>
        </div>

        <aside
          id="chess-side-panel"
          aria-label="Game panel"
          className={cn(
            'pointer-events-auto absolute inset-x-3 top-16 flex max-h-[calc(100dvh-12rem)] flex-col gap-3 overflow-y-auto rounded-2xl border border-surface-border bg-surface-base/90 p-3 sm:static sm:w-80 sm:max-h-none sm:shrink-0 sm:border-0 sm:bg-transparent sm:p-0',
            HUD_SURFACE,
            !panelOpen && 'hidden sm:flex',
            // Leave the bottom corner to the room chat's header.
            isOnline && 'sm:pb-16',
          )}
        >
          <div className="hidden lg:block">
            <ChessStatusBanner state={state} {...banner} />
          </div>
          <ChessControls state={state} isOnline={isOnline} {...controls} />
          <ChessMoveList history={state.history} reviewPly={reviewPly} onReviewPly={onReviewPly} />
          <div className="hidden md:block">
            <ChessHelpCard />
          </div>
        </aside>
      </div>

      {children}
    </div>
  );
}
