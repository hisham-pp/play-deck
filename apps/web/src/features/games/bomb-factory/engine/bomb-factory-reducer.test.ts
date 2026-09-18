import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type {
  AssemblySubmission,
  BombFactorySeat,
  Dossier,
  DossierFact,
  MachineSpec,
} from '../types/bomb-factory.types';
import { verdictsFromAll } from './assembly-validator';
import { buildMachineSpec } from './blueprint';
import { partById } from './bomb-factory-constants';
import { BombFactoryEngine } from './bomb-factory-engine';
import { createSeededRandom } from './bomb-factory-rng';
import { buildDistributionPlan, generateDossier } from './information-splitter';

const SEED = 2024;
const START_AT = 1_000_000;

function seat(id: string, seatIndex: number): BombFactorySeat {
  return { id, displayName: id.toUpperCase(), avatar: '🔧', seatIndex, status: 'connected' };
}

function buildLine(seatCount = 4) {
  const seats = Array.from({ length: seatCount }, (_, i) => seat(`s${i + 1}`, i));
  const spec = buildMachineSpec('trainee', 0, SEED);
  const plan = buildDistributionPlan(
    spec,
    seats.map((s) => s.id),
    SEED,
  );
  const random = createSeededRandom(SEED + 1);
  const dossiers = seats.map((s) => generateDossier(spec, plan, s.id, random));

  const engine = new BombFactoryEngine();
  engine.setupShift({ mode: 'local', difficulty: 'trainee', seats, machinesInShift: 3 });
  engine.dealMachine(spec, plan);
  engine.startMachine(START_AT);

  return { engine, seats, spec, plan, dossiers };
}

/** Reads the one correct move for a step back out of the shared dossiers. */
function correctMove(dossiers: Dossier[], spec: MachineSpec, stepIndex: number) {
  const facts = dossiers.flatMap((dossier) => dossier.facts);
  const orderFact = facts.find(
    (f): f is Extract<DossierFact, { kind: 'order' }> =>
      f.kind === 'order' && f.stepIndex === stepIndex,
  )!;
  const partId = orderFact.partId;

  const routingFact = facts.find(
    (f): f is Extract<DossierFact, { kind: 'routing' }> =>
      f.kind === 'routing' && f.partId === partId,
  )!;
  const stationId = routingFact.stationId;

  const calFact = facts.find(
    (f): f is Extract<DossierFact, { kind: 'calibration' }> =>
      f.kind === 'calibration' && f.partId === partId,
  )!;
  const dial = calFact.dial;

  const material = partById(partId)!.material;
  const notice = facts.find(
    (f): f is Extract<DossierFact, { kind: 'safety' }> =>
      f.kind === 'safety' && f.material === material,
  );
  const toolId = spec.toolIds.find((id) => !notice?.forbiddenToolIds.includes(id))!;

  return { partId, stationId, dial, toolId };
}

function attempt(
  engine: BombFactoryEngine,
  dossiers: Dossier[],
  submission: AssemblySubmission,
  at = START_AT + 1000,
): void {
  engine.submit(submission);
  for (const verdict of verdictsFromAll(dossiers, engine.getState().plan, submission)) {
    engine.recordVerdict(verdict, at);
  }
}

function moveFor(
  engine: BombFactoryEngine,
  dossiers: Dossier[],
  spec: MachineSpec,
  stepIndex: number,
  override: Partial<AssemblySubmission> = {},
): AssemblySubmission {
  const operator = engine.currentOperator();
  return {
    attemptId: `a${stepIndex}-${JSON.stringify(override)}`,
    stepIndex,
    operatorSeatId: operator?.id ?? 's1',
    ...correctMove(dossiers, spec, stepIndex),
    ...override,
  };
}

describe('Bomb Factory — assembling a machine', () => {
  it('clears the machine when every channel agrees on every step', () => {
    const { engine, spec, dossiers } = buildLine();

    for (let step = 0; step < spec.partIds.length; step++) {
      attempt(engine, dossiers, moveFor(engine, dossiers, spec, step));
    }

    const state = engine.getState();
    assert.equal(state.phase, 'machine-cleared');
    assert.equal(state.completedSteps.length, spec.partIds.length);
    assert.equal(state.machinesCleared, 1);
    assert.ok(state.score > 0);
  });

  it('charges the clock and holds the step when a channel refuses', () => {
    const { engine, spec, dossiers } = buildLine();
    const wrongDial = correctMove(dossiers, spec, 0).dial === 1 ? 2 : 1;

    attempt(engine, dossiers, moveFor(engine, dossiers, spec, 0, { dial: wrongDial }));

    const state = engine.getState();
    assert.equal(state.currentStep, 0);
    assert.equal(state.faults.length, 1);
    assert.deepEqual(state.faults[0].failedChannels, ['calibration']);
    assert.equal(state.penaltySeconds, spec.faultPenaltySeconds);
  });

  it('names every channel that refused, so the room knows who to re-read', () => {
    const { engine, spec, dossiers } = buildLine();
    const wrongPart = spec.partIds.find((id) => id !== correctMove(dossiers, spec, 0).partId)!;

    attempt(engine, dossiers, moveFor(engine, dossiers, spec, 0, { partId: wrongPart }));

    const [fault] = engine.getState().faults;
    assert.ok(fault.failedChannels.includes('order'));
  });

  it('refuses a step taken out of order', () => {
    const { engine, spec, dossiers } = buildLine();
    engine.submit(moveFor(engine, dossiers, spec, 2));
    assert.equal(engine.getState().pendingAttempt, null);
  });

  it('waits for every channel before it rules', () => {
    const { engine, spec, dossiers } = buildLine();
    const submission = moveFor(engine, dossiers, spec, 0);
    engine.submit(submission);

    const [first] = verdictsFromAll(dossiers, engine.getState().plan, submission);
    engine.recordVerdict(first, START_AT + 500);
    engine.recordVerdict(first, START_AT + 600);

    assert.equal(engine.getState().pendingAttempt?.verdicts.length, 1);
    assert.equal(engine.getState().currentStep, 0);
  });

  it('only lets the seat holding the wrench engage', () => {
    const { engine, seats } = buildLine();
    const operator = engine.currentOperator();

    assert.equal(operator?.id, seats[0].id);
    assert.equal(engine.canSubmit(seats[0].id), true);
    assert.equal(engine.canSubmit(seats[1].id), false);
  });

  it('voids an attempt that never got its verdicts back', () => {
    const { engine, spec, dossiers } = buildLine();
    const submission = moveFor(engine, dossiers, spec, 0);
    engine.submit(submission);
    engine.voidAttempt(submission.attemptId);

    assert.equal(engine.getState().pendingAttempt, null);
    assert.equal(engine.getState().faults.length, 0);
  });

  it('fails the machine when the clock runs out', () => {
    const { engine, spec } = buildLine();
    engine.timeout(spec.index, START_AT + 200_000);

    assert.equal(engine.getState().phase, 'machine-failed');
    assert.equal(engine.getState().machinesCleared, 0);
  });

  it('ends the shift once the last machine is cleared', () => {
    const { engine, spec, plan, seats, dossiers } = buildLine();
    engine.setupShift({ mode: 'local', difficulty: 'trainee', seats, machinesInShift: 1 });
    engine.dealMachine(spec, plan);
    engine.startMachine(START_AT);

    for (let step = 0; step < spec.partIds.length; step++) {
      attempt(engine, dossiers, moveFor(engine, dossiers, spec, step));
    }

    assert.equal(engine.getState().phase, 'shift-complete');
  });
});
