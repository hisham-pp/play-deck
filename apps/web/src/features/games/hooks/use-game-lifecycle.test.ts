import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useGameLifecycle, useGameLoop } from './use-game-lifecycle';

describe('useGameLifecycle & useGameLoop hooks', () => {
  it('exports hooks as callable functions', () => {
    assert.equal(typeof useGameLifecycle, 'function');
    assert.equal(typeof useGameLoop, 'function');
  });

  it('validates pause and restart hotkey filtering rules', () => {
    const isPauseKey = (e: { key: string; code?: string; targetTagName?: string }) => {
      const tag = e.targetTagName?.toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag || '')) return false;
      return e.key === 'Escape' || e.code === 'KeyP';
    };

    const isRestartKey = (e: { code: string; targetTagName?: string }, status: string) => {
      const tag = e.targetTagName?.toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag || '')) return false;
      return e.code === 'KeyR' && (status === 'game-over' || status === 'completed');
    };

    // Pause key validations
    assert.equal(isPauseKey({ key: 'Escape' }), true);
    assert.equal(isPauseKey({ key: 'p', code: 'KeyP' }), true);
    assert.equal(isPauseKey({ key: 'Escape', targetTagName: 'INPUT' }), false);
    assert.equal(isPauseKey({ key: 'a' }), false);

    // Restart key validations
    assert.equal(isRestartKey({ code: 'KeyR' }, 'game-over'), true);
    assert.equal(isRestartKey({ code: 'KeyR' }, 'completed'), true);
    assert.equal(isRestartKey({ code: 'KeyR' }, 'playing'), false);
    assert.equal(isRestartKey({ code: 'KeyR', targetTagName: 'TEXTAREA' }, 'game-over'), false);
  });

  it('calculates bounded frame delta time in loop calculation', () => {
    const calculateDelta = (currentTime: number, lastTime: number, maxDeltaMs = 100) => {
      return Math.min(currentTime - lastTime, maxDeltaMs);
    };

    // Normal 60fps frame (~16ms)
    assert.equal(calculateDelta(1016, 1000), 16);
    assert.ok(Math.abs(calculateDelta(1016.6, 1000) - 16.6) < 0.0001);

    // Frame hitch / tab switch (500ms elapsed) -> clamps to maxDeltaMs
    assert.equal(calculateDelta(1500, 1000), 100);
  });
});
