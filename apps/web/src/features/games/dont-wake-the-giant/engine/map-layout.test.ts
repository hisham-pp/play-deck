import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { MapDefinition, Vec2 } from '../types/giant.types';
import { distanceToBox, distanceToSegment } from './geometry';
import { limbSegment } from './giant-ai';
import { MAP_HEIGHT, MAP_WIDTH, THIEF_RADIUS, TREASURE_RADIUS } from './giant-constants';
import { createMap, MAP_IDS, mapName, mapTreasureValue } from './map-layout';

/** How far a point has to be from anything solid for a thief to stand on it. */
const CLEARANCE = THIEF_RADIUS + 1;

function blockedBy(map: MapDefinition, point: Vec2, clearance: number): string | null {
  for (const [index, box] of map.obstacles.entries()) {
    if (distanceToBox(box, point) < clearance) return `obstacle ${index}`;
  }
  if (distanceToBox(map.giant.torso, point) < clearance) return 'the giant torso';

  const { head } = map.giant;
  const headGap = Math.hypot(point.x - head.pos.x, point.y - head.pos.y) - head.radius;
  if (headGap < clearance) return 'the giant head';

  for (const limb of map.giant.limbs) {
    const { a, b } = limbSegment(limb);
    if (distanceToSegment(a, b, point) - limb.radius < clearance) return `limb ${limb.id}`;
  }

  if (point.x < clearance || point.y < clearance) return 'the room edge';
  if (point.x > map.width - clearance || point.y > map.height - clearance) return 'the room edge';

  return null;
}

describe('map blueprints', () => {
  it('ships more than one chamber, each with its own name', () => {
    assert.ok(MAP_IDS.length >= 2);
    const names = MAP_IDS.map(mapName);
    assert.equal(new Set(names).size, names.length);
  });

  it('falls back to the first chamber for an unknown id', () => {
    assert.equal(createMap('nonsense').id, createMap().id);
    assert.equal(mapName('nonsense'), mapName(MAP_IDS[0]));
  });

  it('hands out a fresh mutable copy each time', () => {
    const a = createMap('hearth');
    const b = createMap('hearth');
    a.treasures[0].takenBy = 'p1';
    a.giant.limbs[0].angle = 99;

    assert.equal(b.treasures[0].takenBy, null, 'one round must not leak into the next');
    assert.notEqual(b.giant.limbs[0].angle, 99);
  });
});

for (const mapId of MAP_IDS) {
  describe(`map ${mapId} — placement`, () => {
    const map = createMap(mapId);

    it('fills the declared room size', () => {
      assert.equal(map.width, MAP_WIDTH);
      assert.equal(map.height, MAP_HEIGHT);
    });

    it('seats a full crew of six without anyone starting inside something', () => {
      assert.ok(map.spawns.length >= 6, 'six seats need six spawns');
      for (const [index, spawn] of map.spawns.entries()) {
        const blocker = blockedBy(map, spawn, CLEARANCE);
        assert.equal(blocker, null, `spawn ${index} starts inside ${blocker}`);
      }
    });

    it('spaces the spawns far enough apart not to collide on the first frame', () => {
      for (let i = 0; i < map.spawns.length; i++) {
        for (let j = i + 1; j < map.spawns.length; j++) {
          const gap = Math.hypot(
            map.spawns[i].x - map.spawns[j].x,
            map.spawns[i].y - map.spawns[j].y,
          );
          assert.ok(gap > THIEF_RADIUS * 2, `spawns ${i} and ${j} overlap`);
        }
      }
    });

    it('puts every piece of treasure somewhere a thief can reach it', () => {
      for (const treasure of map.treasures) {
        const blocker = blockedBy(map, treasure.pos, CLEARANCE);
        assert.equal(blocker, null, `${treasure.id} is buried in ${blocker}`);
      }
    });

    it('puts every charm somewhere a thief can reach it', () => {
      for (const charm of map.charms) {
        const blocker = blockedBy(map, charm.pos, CLEARANCE);
        assert.equal(blocker, null, `${charm.id} is buried in ${blocker}`);
      }
    });

    it('keeps the door clear so a loaded crew can actually leave', () => {
      const centre = { x: map.exit.x + map.exit.w / 2, y: map.exit.y + map.exit.h / 2 };
      for (const box of map.obstacles) {
        assert.ok(distanceToBox(box, centre) > THIEF_RADIUS, 'the door is walled off');
      }
      assert.ok(distanceToBox(map.giant.torso, centre) > THIEF_RADIUS);
    });

    it('does not stack two pieces of loot on the same spot', () => {
      const points = [...map.treasures.map((t) => t.pos), ...map.charms.map((c) => c.pos)];
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const gap = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          assert.ok(
            gap > TREASURE_RADIUS * 2,
            `two pickups overlap at ${points[i].x},${points[i].y}`,
          );
        }
      }
    });

    it('offers all three tiers, and totals what the blueprint says', () => {
      const tiers = new Set(map.treasures.map((treasure) => treasure.tier));
      assert.deepEqual([...tiers].sort(), ['goblet', 'relic', 'trinket']);

      const total = map.treasures.reduce((sum, treasure) => sum + treasure.value, 0);
      assert.equal(total, mapTreasureValue(mapId));
    });

    it('offers both kinds of charm', () => {
      const kinds = new Set(map.charms.map((charm) => charm.kind));
      assert.deepEqual([...kinds].sort(), ['lullaby', 'muffle']);
    });
  });
}
