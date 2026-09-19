import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COLLECT_COOLDOWN_MS,
  LULLABY_RELIEF,
  MUFFLE_MS,
  PHASE_ESCAPE,
  PHASE_HEIST,
} from './giant-constants';
import { makeHeistWorld } from './test-helpers';
import {
  allEscaped,
  applyInteract,
  collectTreasure,
  inExit,
  interactTargetFor,
  promptFor,
  spendCharm,
  treasuresLeft,
  tryBank,
} from './treasure';

describe('treasure — reaching for things', () => {
  it('offers nothing when nothing is in arm\u2019s reach', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { x: 480, y: 40 };

    assert.equal(interactTargetFor(world, thief), null);
    assert.equal(promptFor(world, thief), '');
  });

  it('prefers a charm over loot when both are within reach', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    const charm = world.charms[0];
    world.treasures[0].pos = { ...charm.pos };
    thief.pos = { ...charm.pos };

    const target = interactTargetFor(world, thief);
    assert.equal(target?.kind, 'charm');
    assert.match(promptFor(world, thief), /chime|wrap/);
  });

  it('names the loot and its price in the prompt', () => {
    const world = makeHeistWorld();
    const relic = world.treasures.find((item) => item.tier === 'relic');
    assert.ok(relic);
    const thief = world.thieves[0];
    thief.pos = { ...relic.pos };
    world.charms.forEach((charm) => (charm.usedBy = 'someone'));

    const prompt = promptFor(world, thief);
    assert.ok(prompt.includes('relic'), prompt);
    assert.ok(prompt.includes(`+${relic.value}`), prompt);
    assert.ok(prompt.includes(`${relic.noise} noise`), prompt);
  });
});

describe('treasure — lifting', () => {
  it('charges the meter and loads the thief', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    const treasure = world.treasures[0];
    thief.pos = { x: 480, y: 40 };

    collectTreasure(world, thief, treasure);

    assert.equal(treasure.takenBy, thief.id);
    assert.equal(thief.carried, treasure.value);
    assert.equal(thief.carriedCount, 1);
    assert.ok(world.noise > 0);
    assert.equal(treasuresLeft(world), world.treasures.length - 1);
  });

  it('cannot be lifted twice', () => {
    const world = makeHeistWorld(2);
    const [a, b] = world.thieves;
    const treasure = world.treasures[0];

    collectTreasure(world, a, treasure);
    collectTreasure(world, b, treasure);

    assert.equal(treasure.takenBy, a.id);
    assert.equal(b.carriedCount, 0);
  });

  it('rate-limits a mashed interact key', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.pos = { ...world.treasures[0].pos };
    world.charms.forEach((charm) => (charm.usedBy = 'someone'));

    assert.ok(applyInteract(world, thief));
    assert.equal(thief.collectReadyAtMs, world.elapsedMs + COLLECT_COOLDOWN_MS);
    assert.equal(applyInteract(world, thief), null, 'the cooldown should swallow the second press');
  });
});

describe('treasure — charms', () => {
  it('settles the whole room with a lullaby', () => {
    const world = makeHeistWorld();
    world.noise = 60;
    const lullaby = world.charms.find((charm) => charm.kind === 'lullaby');
    assert.ok(lullaby);

    spendCharm(world, world.thieves[0], lullaby);

    assert.equal(world.noise, 60 - LULLABY_RELIEF);
    assert.equal(lullaby.usedBy, world.thieves[0].id);
    assert.equal(world.lastEvent?.source, 'charm');
  });

  it('quiets only its owner with a muffle', () => {
    const world = makeHeistWorld(2);
    const muffle = world.charms.find((charm) => charm.kind === 'muffle');
    assert.ok(muffle);

    spendCharm(world, world.thieves[0], muffle);

    assert.equal(world.thieves[0].muffledUntilMs, world.elapsedMs + MUFFLE_MS);
    assert.equal(world.thieves[1].muffledUntilMs, 0);
  });
});

describe('treasure — getting out', () => {
  it('banks nothing while the heist is still running', () => {
    const world = makeHeistWorld();
    const thief = world.thieves[0];
    thief.carried = 40;
    thief.pos = { x: world.map.exit.x + world.map.exit.w / 2, y: world.map.exit.y + 10 };

    assert.equal(world.phase, PHASE_HEIST);
    assert.equal(tryBank(world, thief), 0);
    assert.equal(thief.escaped, false);
  });

  it('banks a haul carried through the door during the escape', () => {
    const world = makeHeistWorld();
    world.phase = PHASE_ESCAPE;
    const thief = world.thieves[0];
    thief.carried = 40;
    thief.carriedCount = 2;
    thief.pos = { x: world.map.exit.x + world.map.exit.w / 2, y: world.map.exit.y + 10 };

    assert.equal(inExit(thief.pos, world.map.exit), true);
    assert.equal(tryBank(world, thief), 40);
    assert.equal(thief.banked, 40);
    assert.equal(thief.carried, 0);
    assert.equal(thief.carriedCount, 0);
    assert.equal(thief.escaped, true);
    assert.equal(world.bankedTotal, 40);
  });

  it('leaves a haul behind when the thief never reaches the door', () => {
    const world = makeHeistWorld();
    world.phase = PHASE_ESCAPE;
    const thief = world.thieves[0];
    thief.carried = 40;
    thief.pos = { x: 480, y: 40 };

    assert.equal(tryBank(world, thief), 0);
    assert.equal(world.bankedTotal, 0);
  });

  it('waits for everyone still connected before calling it a clean getaway', () => {
    const world = makeHeistWorld(3);
    world.phase = PHASE_ESCAPE;
    world.thieves[0].escaped = true;
    world.thieves[1].escaped = true;
    assert.equal(allEscaped(world), false);

    world.thieves[2].connected = false;
    assert.equal(allEscaped(world), true, 'a dropped player must not strand the crew');
  });
});
