import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceToNextHole,
  classifyScore,
  computeAiShot,
  createInitialMiniGolfState,
  executeShot,
  restartGame,
  tickGame,
} from '../engine/mini-golf-engine';

describe('Mini Golf Engine — Core State & Rules', () => {
  it('correctly classifies score types relative to par', () => {
    // Par 3 hole
    assert.equal(classifyScore(1, 3), 'ace'); // Any hole-in-one is an Ace
    assert.equal(classifyScore(2, 5), 'albatross'); // -3
    assert.equal(classifyScore(2, 4), 'eagle'); // -2
    assert.equal(classifyScore(2, 3), 'birdie'); // -1
    assert.equal(classifyScore(3, 3), 'par'); // 0
    assert.equal(classifyScore(4, 3), 'bogey'); // +1
    assert.equal(classifyScore(5, 3), 'double-bogey'); // +2
    assert.equal(classifyScore(8, 3), 'limit'); // par + 5
  });

  it('initializes game state with appropriate mode and player scorecards', () => {
    const soloState = createInitialMiniGolfState('solo');
    assert.equal(soloState.players.length, 1);
    assert.equal(soloState.currentHoleIndex, 0);
    assert.equal(soloState.phase, 'aiming');
    assert.ok(soloState.scorecards['p1']);

    const vsAiState = createInitialMiniGolfState('vs-ai');
    assert.equal(vsAiState.players.length, 2);
    assert.ok(vsAiState.players.some((p) => p.isAi));

    const pnpState = createInitialMiniGolfState('pass-and-play');
    assert.equal(pnpState.players.length, 2);
    assert.equal(pnpState.players[1].id, 'p2');
  });

  it('executes a shot, sets velocity, increments strokes, and transitions phase', () => {
    let state = createInitialMiniGolfState('solo');
    assert.equal(state.currentStrokes, 0);
    assert.equal(state.phase, 'aiming');

    state = executeShot(state, 0, 0.5); // shoot to the right with 50% power

    assert.equal(state.currentStrokes, 1);
    assert.equal(state.phase, 'rolling');
    assert.ok(state.ball.vx > 0);
    assert.equal(state.ball.isResting, false);
  });

  it('handles hole completion and records scorecard', () => {
    let state = createInitialMiniGolfState('solo');
    state = executeShot(state, 0, 0.5);

    // Simulate ball landing in cup
    const hole = state.holes[0];
    state.ball.x = hole.cup.x;
    state.ball.y = hole.cup.y;
    state.ball.vx = 20;
    state.ball.vy = 0;

    const { state: updatedState, events } = tickGame(state, 1 / 60);

    assert.equal(events.inHole, true);
    assert.equal(updatedState.phase, 'hole-clear');

    const p1Card = updatedState.scorecards['p1'];
    assert.equal(p1Card.holeScores.length, 1);
    assert.equal(p1Card.holeScores[0].holeNumber, 1);
    assert.equal(p1Card.holeScores[0].strokes, 1);
    assert.equal(p1Card.holeScores[0].classification, 'ace');
  });

  it('advances through holes until course complete', () => {
    let state = createInitialMiniGolfState('solo');

    for (let i = 0; i < 8; i++) {
      state = advanceToNextHole(state);
      assert.equal(state.currentHoleIndex, i + 1);
      assert.equal(state.phase, 'aiming');
    }

    // Advance past the 9th hole
    state = advanceToNextHole(state);
    assert.equal(state.phase, 'course-complete');
  });

  it('restarts game cleanly back to hole 1', () => {
    let state = createInitialMiniGolfState('solo');
    state = advanceToNextHole(state);
    state = executeShot(state, 0, 0.5);

    const restarted = restartGame(state);
    assert.equal(restarted.currentHoleIndex, 0);
    assert.equal(restarted.currentStrokes, 0);
    assert.equal(restarted.phase, 'aiming');
  });

  it('computes realistic AI shot within valid angle and power ranges', () => {
    const state = createInitialMiniGolfState('vs-ai');
    const aiShot = computeAiShot(state);

    assert.ok(typeof aiShot.angle === 'number');
    assert.ok(aiShot.power >= 0.1 && aiShot.power <= 1.0);
  });
});
