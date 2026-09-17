import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { StorageAdapter } from '@playdeck/game-types';
import { StorageService } from '@/lib/storage/storage';
import {
  buildVehicleSpec,
  DEFAULT_UPGRADES,
  MAX_UPGRADE_LEVEL,
  UPGRADES,
  upgradeCost,
} from '../engine/upgrades';
import {
  LocalSummitProgressRepository,
  normalizeProgress,
  purchaseUpgrade,
} from './summit-progress-repository';

class MemoryStorageAdapter implements StorageAdapter {
  private map = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.map.get(key) as T) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.map.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.map.delete(key);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.map.keys());
  }
}

describe('Summit Rush — upgrades', () => {
  it('costs rise with every level and stop at the cap', () => {
    for (const info of UPGRADES) {
      let previous = 0;
      for (let level = 0; level < MAX_UPGRADE_LEVEL; level++) {
        const cost = upgradeCost(info, level);
        assert.ok(cost !== null && cost > previous);
        previous = cost;
      }
      assert.equal(upgradeCost(info, MAX_UPGRADE_LEVEL), null);
    }
  });

  it('each upgrade improves its own stats', () => {
    const base = buildVehicleSpec(DEFAULT_UPGRADES);
    const max = MAX_UPGRADE_LEVEL;
    assert.ok(
      buildVehicleSpec({ ...DEFAULT_UPGRADES, engine: max }).driveTorque > base.driveTorque,
    );
    assert.ok(
      buildVehicleSpec({ ...DEFAULT_UPGRADES, suspension: max }).suspensionMax > base.suspensionMax,
    );
    assert.ok(buildVehicleSpec({ ...DEFAULT_UPGRADES, tires: max }).grip > base.grip);
    assert.ok(
      buildVehicleSpec({ ...DEFAULT_UPGRADES, fuel: max }).fuelCapacity > base.fuelCapacity,
    );
  });

  it('describes the current and next effect in plain words', () => {
    const engine = UPGRADES.find((u) => u.id === 'engine');
    assert.equal(engine?.describe(0), 'Power 100% · Top speed 100%');
    assert.equal(engine?.describe(2), 'Power 120% · Top speed 112%');
  });

  it('purchases only when affordable and below the cap', () => {
    const poor = normalizeProgress({ coins: 10 });
    assert.equal(purchaseUpgrade(poor, 'engine'), null);

    const rich = normalizeProgress({ coins: 1000 });
    const bought = purchaseUpgrade(rich, 'engine');
    assert.equal(bought?.upgrades.engine, 1);
    assert.equal(bought?.coins, 1000 - (upgradeCost(UPGRADES[0], 0) ?? 0));

    const maxed = normalizeProgress({
      coins: 1e9,
      upgrades: { ...DEFAULT_UPGRADES, fuel: MAX_UPGRADE_LEVEL },
    });
    assert.equal(purchaseUpgrade(maxed, 'fuel'), null);
  });
});

describe('Summit Rush — progress repository', () => {
  beforeEach(() => {
    StorageService.setAdapter(new MemoryStorageAdapter());
  });

  it('returns defaults when nothing is saved', async () => {
    const repo = new LocalSummitProgressRepository();
    const progress = await repo.load();
    assert.equal(progress.coins, 0);
    assert.deepEqual(progress.upgrades, DEFAULT_UPGRADES);
  });

  it('persists coins, upgrades and best distance', async () => {
    const repo = new LocalSummitProgressRepository();
    await repo.save(
      normalizeProgress({
        coins: 420,
        bestDistance: 1337,
        upgrades: { ...DEFAULT_UPGRADES, tires: 3 },
      }),
    );
    const loaded = await new LocalSummitProgressRepository().load();
    assert.equal(loaded.coins, 420);
    assert.equal(loaded.bestDistance, 1337);
    assert.equal(loaded.upgrades.tires, 3);
  });

  it('sanitises corrupted saves', () => {
    const cleaned = normalizeProgress({
      coins: -5,
      bestDistance: Number.NaN,
      upgrades: { engine: 99, suspension: -2, tires: 2.7, fuel: undefined as unknown as number },
    });
    assert.equal(cleaned.coins, 0);
    assert.equal(cleaned.bestDistance, 0);
    assert.deepEqual(cleaned.upgrades, {
      engine: MAX_UPGRADE_LEVEL,
      suspension: 0,
      tires: 2,
      fuel: 0,
    });
  });

  it('resets progress', async () => {
    const repo = new LocalSummitProgressRepository();
    await repo.save(normalizeProgress({ coins: 50 }));
    const reset = await repo.reset();
    assert.equal(reset.coins, 0);
    assert.equal((await repo.load()).coins, 0);
  });
});
