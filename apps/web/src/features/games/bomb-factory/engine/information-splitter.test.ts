import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { BlueprintChannel, Dossier } from '../types/bomb-factory.types';
import { verdictsFrom } from './assembly-validator';
import { buildMachineSpec, operatorSeatFor } from './blueprint';
import { CHANNELS, PART_CATALOG } from './bomb-factory-constants';
import { createSeededRandom } from './bomb-factory-rng';
import { buildDistributionPlan, generateDossier, ownerOf } from './information-splitter';

const SEATS = ['s1', 's2', 's3', 's4', 's5', 's6'];

function seatsOf(count: number): string[] {
  return SEATS.slice(0, count);
}

function dossiersFor(
  seatIds: string[],
  seed = 42,
): {
  spec: ReturnType<typeof buildMachineSpec>;
  plan: ReturnType<typeof buildDistributionPlan>;
  dossiers: Dossier[];
} {
  const spec = buildMachineSpec('standard', 1, seed);
  const plan = buildDistributionPlan(spec, seatIds, seed);
  const random = createSeededRandom(seed + 7);
  return { spec, plan, dossiers: seatIds.map((id) => generateDossier(spec, plan, id, random)) };
}

describe('Bomb Factory — machine blueprint', () => {
  it('builds the same public bench from the same seed', () => {
    assert.deepEqual(buildMachineSpec('standard', 0, 99), buildMachineSpec('standard', 0, 99));
  });

  it('puts one part and one bay on the bench per step', () => {
    const spec = buildMachineSpec('overclocked', 4, 5);
    assert.equal(spec.partIds.length, 10);
    assert.equal(spec.stationIds.length, 10);
    assert.equal(new Set(spec.partIds).size, spec.partIds.length);
    assert.equal(new Set(spec.stationIds).size, spec.stationIds.length);
  });

  it('passes the wrench round the room step by step', () => {
    const seats = seatsOf(3).map((id, seatIndex) => ({
      id,
      displayName: id,
      avatar: '🔧',
      seatIndex,
      status: 'connected' as const,
    }));
    const operators = [0, 1, 2, 3].map((step) => operatorSeatFor(seats, 0, step)?.id);
    assert.deepEqual(operators, ['s1', 's2', 's3', 's1']);
  });
});

describe('Bomb Factory — information splitter', () => {
  for (const count of [2, 3, 4, 5, 6]) {
    it(`gives every one of ${count} seats something nobody else has`, () => {
      const seatIds = seatsOf(count);
      const { plan } = dossiersFor(seatIds);

      for (const seatId of seatIds) {
        assert.ok(
          plan.some((entry) => entry.seatId === seatId),
          `${seatId} holds no part of the blueprint`,
        );
      }
    });

    it(`never lets one of ${count} seats hold the whole blueprint`, () => {
      const seatIds = seatsOf(count);
      const { plan } = dossiersFor(seatIds);

      for (const seatId of seatIds) {
        const owned = new Set(
          plan.filter((entry) => entry.seatId === seatId).map((entry) => entry.channel),
        );
        assert.ok(owned.size < CHANNELS.length, `${seatId} can build the machine alone`);
      }
    });
  }

  it('covers every channel exactly once across the room', () => {
    const { spec, plan } = dossiersFor(seatsOf(6));

    for (const stepIndex of spec.partIds.keys()) {
      assert.ok(ownerOf(plan, 'order', String(stepIndex)), `step ${stepIndex} has no run sheet`);
    }
    for (const partId of spec.partIds) {
      assert.ok(ownerOf(plan, 'routing', partId), `${partId} has no bay`);
      assert.ok(ownerOf(plan, 'calibration', partId), `${partId} has no dial`);
    }
  });

  it('keeps a split channel consistent — one part per step, one bay per part', () => {
    const { spec, dossiers } = dossiersFor(seatsOf(6));
    const facts = dossiers.flatMap((dossier) => dossier.facts);

    const orderParts = facts.filter((fact) => fact.kind === 'order').map((fact) => fact.partId);
    assert.equal(orderParts.length, spec.partIds.length);
    assert.equal(new Set(orderParts).size, spec.partIds.length);

    const bays = facts.filter((fact) => fact.kind === 'routing').map((fact) => fact.stationId);
    assert.equal(new Set(bays).size, spec.stationIds.length);
  });

  it('leaves exactly one safe tool for every material in play', () => {
    const { spec, dossiers } = dossiersFor(seatsOf(4));
    const notices = dossiers.flatMap((d) => d.facts).filter((fact) => fact.kind === 'safety');

    assert.ok(notices.length > 0);
    for (const notice of notices) {
      assert.equal(notice.forbiddenToolIds.length, spec.toolIds.length - 1);
    }
  });

  it('draws different answers for different rooms', () => {
    const first = dossiersFor(seatsOf(4), 11).dossiers.flatMap((d) => d.facts);
    const second = dossiersFor(seatsOf(4), 12).dossiers.flatMap((d) => d.facts);
    assert.notDeepEqual(first, second);
  });
});

describe('Bomb Factory — a seat only rules on what it holds', () => {
  it('returns no verdict for a channel it does not own', () => {
    const seatIds = seatsOf(4);
    const { spec, plan, dossiers } = dossiersFor(seatIds);
    const partId = spec.partIds[0];
    const submission = {
      attemptId: 'a1',
      stepIndex: 0,
      operatorSeatId: seatIds[0],
      partId,
      stationId: spec.stationIds[0],
      dial: 1,
      toolId: spec.toolIds[0],
    };

    for (const dossier of dossiers) {
      const ruled = verdictsFrom(dossier, plan, submission).map((v) => v.channel);
      for (const channel of ruled as BlueprintChannel[]) {
        const key =
          channel === 'order'
            ? '0'
            : channel === 'safety'
              ? (PART_CATALOG.find((p) => p.id === partId)?.material ?? '')
              : partId;
        assert.equal(ownerOf(plan, channel, key), dossier.seatId);
      }
    }
  });
});
