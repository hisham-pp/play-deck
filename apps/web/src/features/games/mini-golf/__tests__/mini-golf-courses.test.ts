import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MINI_GOLF_COURSES } from '../engine/mini-golf-courses';

describe('Mini Golf Courses — Configuration & Playability', () => {
  it('defines exactly 9 championship holes', () => {
    assert.equal(MINI_GOLF_COURSES.length, 9);
  });

  it('assigns sequential IDs from 1 to 9', () => {
    MINI_GOLF_COURSES.forEach((hole, idx) => {
      assert.equal(hole.id, idx + 1);
      assert.ok(hole.name.length > 0, `Hole ${hole.id} has no name`);
      assert.ok(hole.par >= 2 && hole.par <= 5, `Hole ${hole.id} par is out of range: ${hole.par}`);
    });
  });

  it('keeps tee and cup within standard canvas boundaries', () => {
    MINI_GOLF_COURSES.forEach((hole) => {
      // Tee bounds
      assert.ok(hole.tee.x >= 60 && hole.tee.x <= 740, `Hole ${hole.id} tee.x out of bounds`);
      assert.ok(hole.tee.y >= 60 && hole.tee.y <= 540, `Hole ${hole.id} tee.y out of bounds`);

      // Cup bounds
      assert.ok(hole.cup.x >= 60 && hole.cup.x <= 740, `Hole ${hole.id} cup.x out of bounds`);
      assert.ok(hole.cup.y >= 60 && hole.cup.y <= 540, `Hole ${hole.id} cup.y out of bounds`);
      assert.ok(hole.cup.radius >= 12, `Hole ${hole.id} cup radius too small`);

      // Minimum distance between tee and cup
      const dist = Math.hypot(hole.cup.x - hole.tee.x, hole.cup.y - hole.tee.y);
      assert.ok(dist >= 200, `Hole ${hole.id} distance between tee and cup is too short: ${dist}`);
    });
  });

  it('includes enclosing boundary walls for all holes', () => {
    MINI_GOLF_COURSES.forEach((hole) => {
      assert.ok(hole.walls.length >= 4, `Hole ${hole.id} has fewer than 4 walls`);
    });
  });
});
