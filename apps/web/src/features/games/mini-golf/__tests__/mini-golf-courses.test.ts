import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BACK_NINE_COURSES,
  FRONT_NINE_COURSES,
  FULL_18_COURSES,
  MINI_GOLF_COURSES,
  getCourseHoles,
} from '../engine/mini-golf-courses';

describe('Mini Golf Courses — Configuration & Playability', () => {
  it('defines exactly 18 championship holes across Front and Back 9', () => {
    assert.equal(MINI_GOLF_COURSES.length, 18);
    assert.equal(FRONT_NINE_COURSES.length, 9);
    assert.equal(BACK_NINE_COURSES.length, 9);
    assert.equal(FULL_18_COURSES.length, 18);
  });

  it('correctly resolves course holes from preset selectors', () => {
    assert.equal(getCourseHoles('front-9').length, 9);
    assert.equal(getCourseHoles('front-9')[0].id, 1);
    assert.equal(getCourseHoles('back-9').length, 9);
    assert.equal(getCourseHoles('back-9')[0].id, 10);
    assert.equal(getCourseHoles('full-18').length, 18);
  });

  it('assigns sequential IDs from 1 to 18', () => {
    MINI_GOLF_COURSES.forEach((hole, idx) => {
      assert.equal(hole.id, idx + 1);
      assert.ok(hole.name.length > 0, `Hole ${hole.id} has no name`);
      assert.ok(hole.par >= 2 && hole.par <= 5, `Hole ${hole.id} par is out of range: ${hole.par}`);
    });
  });

  it('keeps tee and cup within standard canvas boundaries', () => {
    MINI_GOLF_COURSES.forEach((hole) => {
      // Tee bounds
      assert.ok(hole.tee.x >= 40 && hole.tee.x <= 760, `Hole ${hole.id} tee.x out of bounds`);
      assert.ok(hole.tee.y >= 40 && hole.tee.y <= 560, `Hole ${hole.id} tee.y out of bounds`);

      // Cup bounds
      assert.ok(hole.cup.x >= 40 && hole.cup.x <= 760, `Hole ${hole.id} cup.x out of bounds`);
      assert.ok(hole.cup.y >= 40 && hole.cup.y <= 560, `Hole ${hole.id} cup.y out of bounds`);
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
