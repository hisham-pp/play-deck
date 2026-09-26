import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkWallCollision,
  createInitialHideSeekState,
  inspectHidingSpot,
  movePlayer,
  nextRound,
  stepHideSeekMatch,
  tagHider,
  toggleHidingSpot,
  useDisguise,
  useInvisibility,
  useRadarPulse,
  useSprint,
} from './hide-and-seek-engine';

describe('Hide & Seek Engine', () => {
  describe('Match Initialization', () => {
    it('initializes match with selected map, players, and hiding phase', () => {
      const state = createInitialHideSeekState({
        mapId: 'manor',
        playerCount: 4,
        playerRole: 'hider',
        hidingDuration: 15,
      });

      assert.equal(state.map.id, 'manor');
      assert.equal(state.players.length, 4);
      assert.equal(state.phase, 'hiding_phase');
      assert.equal(state.phaseTimerSeconds, 15);
      assert.equal(state.players[0].role, 'hider');
      assert.equal(state.players[1].role, 'seeker');
    });

    it('assigns user as Seeker when playerRole option is seeker', () => {
      const state = createInitialHideSeekState({ playerRole: 'seeker' });
      assert.equal(state.players[0].role, 'seeker');
      assert.equal(state.players[1].role, 'hider');
    });
  });

  describe('Movement & Wall Collisions', () => {
    it('detects bounding box wall collisions', () => {
      const walls = [{ x: 100, y: 100, w: 50, h: 50 }];
      assert.equal(checkWallCollision({ x: 110, y: 110, w: 10, h: 10 }, walls), true);
      assert.equal(checkWallCollision({ x: 20, y: 20, w: 10, h: 10 }, walls), false);
    });

    it('moves player towards velocity vector without passing through walls', () => {
      const state = createInitialHideSeekState();
      const p = state.players[0];
      p.x = 200;
      p.y = 200;

      movePlayer(p, 1, 0, 0.1, state.map);
      assert.ok(p.x > 200, 'Player moved right');

      // Attempt to walk into outer left wall at x=10
      p.x = 25;
      movePlayer(p, -1, 0, 0.5, state.map);
      assert.ok(p.x >= 20, 'Prevented from penetrating boundary wall');
    });

    it('applies speed boost velocity when sprint active', () => {
      const state = createInitialHideSeekState();
      const p = state.players[0];
      p.x = 300;
      p.y = 300;

      useSprint(p);
      assert.equal(p.speedBoostTimer, 3.0);
      assert.ok(p.dashCooldown > 0);

      movePlayer(p, 1, 0, 0.1, state.map);
      assert.ok(p.x > 315, 'Sprint moved player faster');
    });
  });

  describe('Hiding Spots & Disguises', () => {
    it('allows hider to enter and exit nearby hiding spots', () => {
      const state = createInitialHideSeekState();
      const hider = state.players[0];
      const spot = state.map.hidingSpots[0]; // spot-1 at (50, 50)
      hider.x = spot.x + 10;
      hider.y = spot.y + 10;

      // Enter spot
      const entered = toggleHidingSpot(hider, state.map);
      assert.equal(entered, true);
      assert.equal(hider.isHiddenInSpot, true);
      assert.equal(hider.hidingSpotId, spot.id);
      assert.equal(spot.occupantId, hider.id);

      // Exit spot
      const exited = toggleHidingSpot(hider, state.map);
      assert.equal(exited, true);
      assert.equal(hider.isHiddenInSpot, false);
      assert.equal(spot.occupantId, null);
    });

    it('allows seeker to inspect hiding spots and catch hidden hiders', () => {
      const state = createInitialHideSeekState();
      const hider = state.players[0];
      const seeker = state.players[1];
      const spot = state.map.hidingSpots[0];

      // Hide player
      hider.x = spot.x + 10;
      hider.y = spot.y + 10;
      toggleHidingSpot(hider, state.map);
      assert.equal(hider.isHiddenInSpot, true);

      // Seeker inspects spot
      seeker.x = spot.x + 15;
      seeker.y = spot.y + 15;
      const found = inspectHidingSpot(seeker, state.map, state);

      assert.equal(found, true);
      assert.equal(hider.isHiddenInSpot, false);
      assert.equal(hider.isTagged, true);
      assert.equal(hider.role, 'seeker'); // Converted in infection mode
    });

    it('toggles camouflage disguise and invisibility abilities', () => {
      const state = createInitialHideSeekState();
      const hider = state.players[0];

      // Disguise
      useDisguise(hider, 'box');
      assert.equal(hider.activeDisguise, 'box');

      // Moving cancels disguise
      movePlayer(hider, 1, 0, 0.1, state.map);
      assert.equal(hider.activeDisguise, 'none');

      // Invisibility
      useInvisibility(hider);
      assert.equal(hider.isInvisible, true);
      assert.ok(hider.invisibilityTimer > 0);
    });
  });

  describe('Radar & Tagging Mechanics', () => {
    it('seeker radar pulse locates nearest active hider', () => {
      const state = createInitialHideSeekState();
      const seeker = state.players[1];
      const hider = state.players[0];
      hider.x = 390;
      hider.y = 300;

      const pingSuccess = useRadarPulse(seeker, state);
      assert.equal(pingSuccess, true);
      assert.ok(state.radarPingPosition !== null);
      assert.equal(state.radarPingPosition.x, 390);
      assert.equal(state.radarPingPosition.y, 300);
    });

    it('tags hider and converts them to seeker', () => {
      const state = createInitialHideSeekState({ playerCount: 3 });
      const hider1 = state.players[0];
      const seeker = state.players[1];

      tagHider(state, seeker, hider1);
      assert.equal(hider1.isTagged, true);
      assert.equal(hider1.role, 'seeker');
      assert.equal(seeker.score, 250);
    });
  });

  describe('Round Progression & Match End', () => {
    it('transitions from hiding phase to seeking phase when timer expires', () => {
      const state = createInitialHideSeekState({ hidingDuration: 5 });
      assert.equal(state.phase, 'hiding_phase');

      stepHideSeekMatch(state, 6);
      assert.equal(state.phase, 'seeking_phase');
    });

    it('awards win to hiders if seeking timer expires', () => {
      const state = createInitialHideSeekState({ hidingDuration: 2, seekingDuration: 5 });
      stepHideSeekMatch(state, 3); // entered seeking phase
      assert.equal(state.phase, 'seeking_phase');

      stepHideSeekMatch(state, 6); // seeking timer expired
      assert.equal(state.phase, 'round_over');
      assert.equal(state.winnerTeam, 'hiders');
    });

    it('advances rounds and rotates seeker role', () => {
      const state = createInitialHideSeekState({ maxRounds: 2 });
      assert.equal(state.currentRound, 1);

      nextRound(state);
      assert.equal(state.currentRound, 2);
      assert.equal(state.phase, 'hiding_phase');

      // Next round exceeds maxRounds -> game_over
      nextRound(state);
      assert.equal(state.phase, 'game_over');
    });
  });
});
