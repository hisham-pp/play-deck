import assert from 'node:assert/strict';
import test, { describe } from 'node:test';
import { CONVEYOR_LAYOUTS, getLayoutById } from '../engine/conveyor-layouts';

describe('Conveyor Layouts — Configuration & Validity', () => {
  test('provides 4 distinct machine configurations with progressive difficulty', () => {
    assert.equal(CONVEYOR_LAYOUTS.length, 4);
    assert.equal(CONVEYOR_LAYOUTS[0].id, 'induction-chute');
    assert.equal(CONVEYOR_LAYOUTS[1].id, 'clockwork-gearworks');
    assert.equal(CONVEYOR_LAYOUTS[2].id, 'magnetic-foundry');
    assert.equal(CONVEYOR_LAYOUTS[3].id, 'rube-goldberg');
  });

  test('each layout has valid coordinates for spawn point and delivery hopper', () => {
    for (const layout of CONVEYOR_LAYOUTS) {
      assert.ok(
        layout.spawnPoint.x >= 0 && layout.spawnPoint.x < 200,
        `${layout.id} spawn point x`,
      );
      assert.ok(
        layout.targetZone.x > 700 && layout.targetZone.x < 960,
        `${layout.id} target zone x`,
      );
      assert.ok(layout.hazardY > 500, `${layout.id} hazard floor`);
      assert.ok(layout.targetDeliveries >= 10, `${layout.id} target deliveries`);
      assert.ok(layout.defaultPlatforms.length >= layout.minPlayers);
    }
  });

  test('getLayoutById returns layout or falls back to first layout', () => {
    const found = getLayoutById('magnetic-foundry');
    assert.equal(found.id, 'magnetic-foundry');

    const fallback = getLayoutById('non-existent');
    assert.equal(fallback.id, 'induction-chute');
  });
});
