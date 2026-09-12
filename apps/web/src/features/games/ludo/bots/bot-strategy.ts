import type { BotStrategy, ScoredAction } from '@playdeck/game-types';
import { finishSteps, globalTrackIndex, resolveLayout } from '../engine/board-layout';
import { findCapturableOpponentPieceIds } from '../engine/capture';
import { computeDestinationSteps, locatePiece } from '../engine/movement';
import type { LudoAction, LudoGameState, LudoPieceState } from '../types/ludo.types';
import type { LudoEvaluationWeights } from './bot-weights';

const OPPONENT_THREAT_RANGE = 6;

function countOpponentThreats(
  state: LudoGameState,
  layout: ReturnType<typeof resolveLayout>,
  color: LudoPieceState['color'],
  targetIndex: number,
): number {
  let threats = 0;
  for (const player of state.players) {
    if (player.color === color) continue;
    for (const piece of player.pieces) {
      if (piece.location !== 'track') continue;
      const opponentIndex = globalTrackIndex(layout, piece.color, piece.steps);
      const distanceAhead = (targetIndex - opponentIndex + layout.trackLength) % layout.trackLength;
      if (distanceAhead >= 1 && distanceAhead <= OPPONENT_THREAT_RANGE) {
        threats += 1;
      }
    }
  }
  return threats;
}

function scoreMoveAction(
  state: LudoGameState,
  action: Extract<LudoAction, { type: 'MOVE_PIECE' }>,
  weights: LudoEvaluationWeights,
): number {
  const piece = locatePiece(state, action.payload.pieceId);
  if (!piece || state.dice.value === null) return -Infinity;

  const layout = resolveLayout(state.players.length);
  const destinationSteps = computeDestinationSteps(piece, state.dice.value, state.settings, layout);
  if (destinationSteps === null) return -Infinity;

  let score = 0;
  const finish = finishSteps(layout);

  // Progress toward home, normalized 0..1.
  score += weights.progress * (destinationSteps / finish);

  if (piece.location === 'base') {
    score += weights.leaveBase;
  }

  if (destinationSteps === finish) {
    // Reaching home outright is always excellent.
    score += weights.progress * 2;
  } else if (destinationSteps <= layout.trackLength) {
    const targetIndex = globalTrackIndex(layout, piece.color, destinationSteps);
    const captured = findCapturableOpponentPieceIds(state, layout, piece.color, targetIndex);
    if (captured.length > 0) {
      score += weights.capture * captured.length;
    }

    const threats = countOpponentThreats(state, layout, piece.color, targetIndex);
    score -= weights.safety * threats;

    // Reward positioning close behind an opponent (within striking range next turn).
    let opportunities = 0;
    for (const opponent of state.players) {
      if (opponent.color === piece.color) continue;
      for (const opponentPiece of opponent.pieces) {
        if (opponentPiece.location !== 'track') continue;
        const opponentIndex = globalTrackIndex(layout, opponentPiece.color, opponentPiece.steps);
        const distanceAhead = (opponentIndex - targetIndex + layout.trackLength) % layout.trackLength;
        if (distanceAhead >= 1 && distanceAhead <= OPPONENT_THREAT_RANGE) {
          opportunities += 1;
        }
      }
    }
    score += weights.attack * opportunities;
  } else {
    // Home stretch - safe from capture by definition, straightforward progress.
    score += weights.safety * 0.5;
  }

  score += (Math.random() - 0.5) * weights.randomJitter;
  return score;
}

function evaluateLegalActions(
  state: LudoGameState,
  legalActions: LudoAction[],
  weights: LudoEvaluationWeights,
): ScoredAction<LudoAction>[] {
  const moveActions = legalActions.filter(
    (action): action is Extract<LudoAction, { type: 'MOVE_PIECE' }> => action.type === 'MOVE_PIECE',
  );
  return moveActions.map((action) => ({
    action,
    score: scoreMoveAction(state, action, weights),
  }));
}

export function createScoredMoveStrategy(
  weights: LudoEvaluationWeights,
): BotStrategy<LudoGameState, LudoAction> {
  return {
    evaluateActions(state, _playerId, legalActions): ScoredAction<LudoAction>[] {
      return evaluateLegalActions(state, legalActions, weights);
    },

    chooseAction(state, _playerId, legalActions): LudoAction {
      if (legalActions.length === 0) {
        return legalActions[0];
      }

      const scored = evaluateLegalActions(state, legalActions, weights);
      let best = scored[0];
      for (const candidate of scored) {
        if (candidate.score > best.score) best = candidate;
      }
      return best.action;
    },
  };
}
