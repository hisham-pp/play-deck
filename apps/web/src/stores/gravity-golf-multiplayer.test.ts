import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { useGravityGolfMultiplayerStore } from './gravity-golf-multiplayer.store';

describe('Gravity Golf Multiplayer Store', () => {
  it('initializes with default state', () => {
    const state = useGravityGolfMultiplayerStore.getState();
    assert.equal(state.status, 'idle');
    assert.equal(state.roomCode, null);
    assert.equal(state.activeHoleNumber, 1);
    assert.deepEqual(state.placedObjects, []);
  });

  it('places and removes gravity objects locally in store', () => {
    const { placeObject, removeObject, clearObjects } = useGravityGolfMultiplayerStore.getState();

    placeObject({
      id: 'test-obj-1',
      type: 'attractor',
      position: { x: 200, y: 200 },
      radius: 20,
      strength: 1,
    });

    let current = useGravityGolfMultiplayerStore.getState();
    assert.equal(current.placedObjects.length, 1);
    assert.equal(current.placedObjects[0].id, 'test-obj-1');

    removeObject('test-obj-1');
    current = useGravityGolfMultiplayerStore.getState();
    assert.equal(current.placedObjects.length, 0);

    placeObject({
      id: 'test-obj-2',
      type: 'repeller',
      position: { x: 300, y: 300 },
      radius: 25,
      strength: 1,
    });
    clearObjects();
    current = useGravityGolfMultiplayerStore.getState();
    assert.equal(current.placedObjects.length, 0);
  });

  it('selects hole and updates active hole number', () => {
    const { selectHole } = useGravityGolfMultiplayerStore.getState();
    selectHole(3);
    assert.equal(useGravityGolfMultiplayerStore.getState().activeHoleNumber, 3);
  });
});
