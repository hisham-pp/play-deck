import type { BallBounceHud, BallBounceState } from '../types/ball-bounce.types';
import { comboMultiplier } from './ball-bounce-constants';

export function toHud(state: BallBounceState): BallBounceHud {
  const { score } = state;
  return {
    status: state.status,
    countdown: Math.ceil(state.countdown),
    score: score.score,
    highScore: score.highScore,
    level: state.level.number,
    lives: state.player.lives,
    combo: score.combo,
    multiplier: comboMultiplier(score.combo),
    bestCombo: score.bestCombo,
    blocksBroken: score.blocksBroken,
    wideActive: state.powerUps.wideTimer > 0,
    slowActive: state.powerUps.slowTimer > 0,
    isNewHighScore: score.score > score.startingHighScore && score.score > 0,
  };
}
