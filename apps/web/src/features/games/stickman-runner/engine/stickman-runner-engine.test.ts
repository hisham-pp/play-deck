import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    createInitialStickmanRunnerState,
    stepStickmanRunnerGame,
    triggerJump,
} from './stickman-runner-engine';

describe('Stickman Runner engine', () => {
    it('starts in idle state and allows a jump on input', () => {
        const state = createInitialStickmanRunnerState(10);

        assert.equal(state.status, 'idle');
        assert.equal(state.score, 0);
        assert.equal(state.highScore, 10);

        const jumped = triggerJump(state);
        assert.equal(jumped.status, 'idle');
        assert.ok(jumped.player.y < state.player.y);
    });

    it('spawns obstacles, increases score, and ends the game on collision', () => {
        let state = createInitialStickmanRunnerState(0);
        state = { ...state, status: 'running', player: { ...state.player, y: 240 } };

        state = stepStickmanRunnerGame(state, 0.016, false);
        assert.ok(state.speed > 0);
        assert.ok(state.distance >= 0);

        state.obstacles = [
            {
                id: 99,
                x: state.player.x + 20,
                y: state.player.y + 8,
                width: 34,
                height: 38,
                passed: false,
            },
        ];

        const next = stepStickmanRunnerGame(state, 0.016, false);
        assert.equal(next.status, 'game-over');
        assert.ok(next.score >= 0);
    });
});
