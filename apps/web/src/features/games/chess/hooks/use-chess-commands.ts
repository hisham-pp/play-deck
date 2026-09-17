'use client';

import { useMemo } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import type { ChessGameState } from '../types/chess.types';
import type { ChessControls } from './use-chess-engine';
import type { ChessOnline } from './use-chess-online';

/**
 * The player's commands, routed to the right place.
 *
 * At a shared board they act on the engine directly. Online they go through the
 * match, which plays the local half and tells the opponent: a takeback becomes
 * a request, a draw offer can only be answered by the other side, and a move is
 * refused unless it is this player's turn.
 */
export function useChessCommands(
  state: ChessGameState,
  controls: ChessControls,
  online: ChessOnline,
) {
  const { match } = online;
  const turn = state.position.turn;

  const boardControls: ChessControls = useMemo(() => {
    if (!match) return controls;
    return {
      ...controls,
      move: (from, to, promotion) => match.move(from, to, promotion),
    };
  }, [controls, match]);

  const commands = useMemo(() => {
    if (!match) {
      return {
        undo: controls.undo,
        newGame: controls.newGame,
        resign: () => controls.resign(turn),
        offerDraw: () => controls.offerDraw(turn),
        acceptDraw: controls.acceptDraw,
        declineDraw: controls.declineDraw,
        acceptTakeback: () => undefined,
        declineTakeback: () => undefined,
      };
    }
    return {
      undo: () => match.requestTakeback(),
      newGame: () => {
        match.startNewGame();
        playSound('ui-click');
      },
      resign: () => match.resign(),
      offerDraw: () => match.offerDraw(),
      acceptDraw: () => match.replyDraw(true),
      declineDraw: () => match.replyDraw(false),
      acceptTakeback: () => match.replyTakeback(true),
      declineTakeback: () => match.replyTakeback(false),
    };
  }, [controls, match, turn]);

  return { boardControls, commands };
}
