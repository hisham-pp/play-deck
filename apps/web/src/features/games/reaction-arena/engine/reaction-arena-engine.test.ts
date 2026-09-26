import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createInitialReactionArenaState,
  evaluatePlayerResponse,
  generateChallenge,
  getBotResponse,
  nextArenaRound,
  startArenaMatch,
} from './reaction-arena-engine';

describe('Reaction Arena Engine', () => {
  it('initializes in idle state with default players and 5 rounds', () => {
    const state = createInitialReactionArenaState();
    assert.equal(state.status, 'idle');
    assert.equal(state.round, 1);
    assert.equal(state.maxRounds, 5);
    assert.equal(state.players.length, 2);
    assert.equal(state.players[0].name, 'You');
    assert.equal(state.players[1].name, 'Reflex-Bot');
    assert.equal(state.players[0].totalScore, 0);
  });

  it('generates challenges for each challenge type with valid data structure', () => {
    const types = [
      'tap_target',
      'color_match',
      'quick_math',
      'stop_marker',
      'direction_arrow',
      'odd_tile',
    ] as const;
    types.forEach((type) => {
      const ch = generateChallenge(type, 1);
      assert.equal(ch.type, type);
      assert.ok(ch.title.length > 0);
      assert.ok(ch.instructions.length > 0);
      assert.ok(ch.durationMs > 0);
      assert.ok(typeof ch.data === 'object');
    });
  });

  it('starts match and transitions into challenge state', () => {
    let state = createInitialReactionArenaState();
    state = startArenaMatch(state);
    assert.equal(state.status, 'challenge');
    assert.equal(state.round, 1);
    assert.ok(state.currentChallenge !== null);
  });

  it('evaluates correct player response and awards speed bonus', () => {
    let state = startArenaMatch(createInitialReactionArenaState());
    // Force quick_math challenge
    state.currentChallenge = {
      id: 'test-ch',
      type: 'quick_math',
      title: 'Speed Math',
      instructions: 'True or False',
      durationMs: 3000,
      data: { isCorrect: true },
    };

    // Player answers correctly in 500ms
    state = evaluatePlayerResponse(state, 'p-1', true, 500);

    const p1 = state.players[0];
    assert.ok(p1.currentRoundAnswer?.answered);
    assert.equal(p1.currentRoundAnswer?.correct, true);
    assert.ok(p1.totalScore > 50); // Base 50 + speed bonus
  });

  it('penalizes incorrect responses with zero points', () => {
    let state = startArenaMatch(createInitialReactionArenaState());
    state.currentChallenge = {
      id: 'test-ch',
      type: 'quick_math',
      title: 'Speed Math',
      instructions: 'True or False',
      durationMs: 3000,
      data: { isCorrect: true },
    };

    state = evaluatePlayerResponse(state, 'p-1', false, 500);
    const p1 = state.players[0];
    assert.equal(p1.currentRoundAnswer?.correct, false);
    assert.equal(p1.currentRoundAnswer?.points, 0);
  });

  it('advances through rounds to match completion', () => {
    let state = startArenaMatch(createInitialReactionArenaState());
    state.round = 4;
    state = nextArenaRound(state);
    assert.equal(state.round, 5);
    assert.equal(state.status, 'challenge');

    // Final round transition to game_over
    state = nextArenaRound(state);
    assert.equal(state.status, 'game_over');
  });

  it('generates plausible human-like bot responses', () => {
    const ch = generateChallenge('direction_arrow', 1);
    const bot = getBotResponse(ch);
    assert.ok(bot.reactionMs >= 300);
    assert.equal(bot.answer, ch.data.targetDirection);
  });
});
