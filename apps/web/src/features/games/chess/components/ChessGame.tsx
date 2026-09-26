'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { RoomChatBox } from '@/features/chat/components/RoomChatBox';
import { RoomVoiceDock } from '@/features/voice/components/RoomVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { createInitialChessState } from '../engine/chess-state';
import { useChessCommands } from '../hooks/use-chess-commands';
import { useChessEngine } from '../hooks/use-chess-engine';
import { useChessInteraction, type ChessInteraction } from '../hooks/use-chess-interaction';
import { useChessKeyboard } from '../hooks/use-chess-keyboard';
import { useChessOnline, type ChessOnline } from '../hooks/use-chess-online';
import { useChessSession } from '../hooks/use-chess-session';
import type { ChessGameState, ChessMoveRecord, PieceColor } from '../types/chess.types';
import { announceState } from '../utils/chess-labels';
import { homeSquare } from '../utils/chess-navigation';
import { ChessArena } from './ChessArena';
import { ChessPromotionDialog } from './ChessPromotionDialog';
import { ChessSetupModal, type ChessMatchSetup } from './ChessSetupModal';
import type { BoardHighlights } from './three/ChessBoard3D';

const DEFAULT_SETUP: ChessMatchSetup = {
  mode: 'local',
  whiteName: 'White',
  blackName: 'Black',
  orientation: 'w',
  autoFlip: false,
};

/**
 * While a past move is on the board, the live selection and check markers are
 * hidden and the reviewed move is outlined instead.
 */
function buildHighlights(
  interaction: ChessInteraction,
  reviewedMove: ChessMoveRecord | null,
  reviewing: boolean,
  cursor: number,
): BoardHighlights {
  if (!reviewing) {
    return {
      selected: interaction.selected,
      targets: interaction.targets,
      captures: interaction.captures,
      lastMove: interaction.lastMove,
      check: interaction.checkedKing,
      cursor,
    };
  }
  return {
    selected: null,
    targets: [],
    captures: [],
    lastMove: reviewedMove ? { from: reviewedMove.move.from, to: reviewedMove.move.to } : null,
    check: null,
    cursor,
  };
}

/**
 * Past positions are rebuilt from the stored FEN, so reviewing never touches
 * the engine and the live game is exactly where it was on return.
 */
function useReview(state: ChessGameState) {
  const [reviewPly, setReviewPly] = useState<number | null>(null);
  const reviewedMove = reviewPly === null ? null : (state.history[reviewPly - 1] ?? null);

  const boardState = useMemo(() => {
    if (!reviewedMove) return state;
    return createInitialChessState({ fen: reviewedMove.fenAfter, matchId: state.matchId });
  }, [reviewedMove, state]);

  return { reviewPly: reviewedMove ? reviewPly : null, reviewedMove, boardState, setReviewPly };
}

/** Online, names come from the room; at a shared board, from the setup form. */
function usePlayerNames(setup: ChessMatchSetup, online: ChessOnline): Record<PieceColor, string> {
  const player = usePlayerStore((state) => state.player);
  const { localColor, opponent } = online;

  return useMemo(() => {
    if (!online.isOnline || !localColor) {
      return { w: setup.whiteName || 'White', b: setup.blackName || 'Black' };
    }
    const mine = `${player?.displayName ?? 'You'} (you)`;
    const theirs = opponent?.displayName ?? 'Waiting for opponent…';
    return localColor === 'w' ? { w: mine, b: theirs } : { w: theirs, b: mine };
  }, [localColor, online.isOnline, opponent, player, setup.blackName, setup.whiteName]);
}

export function ChessGame() {
  const localColorRef = useRef<PieceColor | null>(null);
  const { handleGameOver } = useChessSession(localColorRef);
  const { state, controls, engine } = useChessEngine(handleGameOver);
  const online = useChessOnline(engine);
  localColorRef.current = online.isOnline ? online.localColor : null;

  // A player who arrives already seated (invite or join link) starts in online mode.
  const [setup, setSetup] = useState<ChessMatchSetup>(() =>
    online.roomCode ? { ...DEFAULT_SETUP, mode: 'online' } : DEFAULT_SETUP,
  );
  const [isSetupOpen, setIsSetupOpen] = useState(!online.roomCode);
  const { reviewPly, reviewedMove, boardState, setReviewPly } = useReview(state);
  const { boardControls, commands } = useChessCommands(state, controls, online);
  const names = usePlayerNames(setup, online);

  const interaction = useChessInteraction({
    state,
    controls: boardControls,
    autoFlip: setup.autoFlip,
    playerColor: online.isOnline ? online.localColor : null,
  });
  const { orientation } = interaction;
  const cursor = interaction.cursor ?? homeSquare(orientation);

  const highlights = useMemo(
    () => buildHighlights(interaction, reviewedMove, reviewPly !== null, cursor),
    [interaction, reviewedMove, reviewPly, cursor],
  );

  // Touching the board while reading back returns the player to the live game.
  const selectSquare = useCallback(
    (square: number) => {
      if (reviewPly !== null) {
        setReviewPly(null);
        interaction.moveCursor(square);
        return;
      }
      interaction.selectSquare(square);
    },
    [interaction, reviewPly, setReviewPly],
  );

  const handleKeyDown = useChessKeyboard({
    cursor,
    orientation,
    onMoveCursor: interaction.moveCursor,
    onActivate: selectSquare,
    onCancel: interaction.clearSelection,
    onFlip: interaction.flipBoard,
    onUndo: commands.undo,
  });

  const startLocalMatch = (next: ChessMatchSetup) => {
    if (online.isOnline) online.leaveRoom();
    setSetup(next);
    interaction.setOrientation(next.autoFlip ? 'w' : next.orientation);
    setReviewPly(null);
    controls.newGame();
  };

  // The host starts the game for both boards; the guest is brought in step by
  // the host's resync, so it has nothing to start.
  const startOnlineMatch = () => {
    setSetup((previous) => ({ ...previous, mode: 'online', autoFlip: false }));
    setReviewPly(null);
    if (online.match?.color === 'w') online.match.startNewGame();
  };

  return (
    <>
      {/* Everything that changes on the board is narrated here. */}
      <div role="status" aria-live="polite" className="sr-only">
        {announceState(state)}
      </div>

      <ChessArena
        state={state}
        boardState={boardState}
        names={names}
        orientation={orientation}
        highlights={highlights}
        cursor={cursor}
        reviewPly={reviewPly}
        isOnline={online.isOnline}
        onSelectSquare={selectSquare}
        onFocusSquare={interaction.moveCursor}
        onKeyDown={handleKeyDown}
        onReviewPly={setReviewPly}
        banner={{
          localColor: online.isOnline ? online.localColor : null,
          pendingTakebackFrom: online.pendingTakebackFrom,
          onAcceptDraw: commands.acceptDraw,
          onDeclineDraw: commands.declineDraw,
          onAcceptTakeback: commands.acceptTakeback,
          onDeclineTakeback: commands.declineTakeback,
          onNewGame: commands.newGame,
        }}
        controls={{
          takebackPending: online.pendingTakebackFrom !== null,
          onUndo: commands.undo,
          onFlip: interaction.flipBoard,
          onNewGame: commands.newGame,
          onResign: commands.resign,
          onOfferDraw: commands.offerDraw,
          onOpenSetup: () => setIsSetupOpen(true),
          onLeaveRoom: () => {
            online.leaveRoom();
            setIsSetupOpen(true);
          },
        }}
      >
        {online.isOnline && online.roomCode && (
          <>
            <RoomChatBox roomCode={online.roomCode} />
            {/* Left edge, clear of the player cards at the top and bottom. */}
            <RoomVoiceDock anchorClassName="left-3 top-1/2 -translate-y-1/2 sm:left-5" defaultOpen={false} />
          </>
        )}
      </ChessArena>

      <ChessPromotionDialog
        pending={interaction.pendingPromotion}
        onConfirm={interaction.confirmPromotion}
        onCancel={interaction.cancelPromotion}
      />

      <ChessSetupModal
        isOpen={isSetupOpen}
        current={setup}
        onClose={() => setIsSetupOpen(false)}
        onStart={startLocalMatch}
        onOnlineReady={startOnlineMatch}
      />
    </>
  );
}
