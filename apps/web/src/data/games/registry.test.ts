import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GAME_DEFINITIONS } from './index';

describe('game registry', () => {
    it('includes the stickman climber as an available arcade game', () => {
        const game = GAME_DEFINITIONS.find((entry) => entry.id === 'stickman-climber');

        assert.ok(game, 'stickman climber should be registered');
        assert.equal(game?.slug, 'stickman-climber');
        assert.equal(game?.category, 'arcade');
        assert.equal(game?.status, 'available');
        assert.equal(game?.name, 'Stickman Climber');
    });
});
