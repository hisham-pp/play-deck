import { BODY_DYNAMIC, BODY_KINEMATIC, type RigidBody } from './body';
import { collide, type Manifold } from './collision';
import { correctPositions, prepareManifolds, solveManifolds } from './solver';
import { add, scale, type Vec2 } from './vector';

export interface WorldOptions {
  gravity: Vec2;
  /** Solver passes per step. Ten is enough for a stack a dozen crates tall. */
  iterations?: number;
  linearDamping?: number;
  angularDamping?: number;
}

const DEFAULT_ITERATIONS = 10;
const DEFAULT_LINEAR_DAMPING = 0.0015;
const DEFAULT_ANGULAR_DAMPING = 0.004;

/**
 * A small fixed-step rigid-body world. It only ever holds the platform, the
 * shaft walls and the stacked objects, so a quadratic broad phase is cheaper
 * than the bookkeeping a grid would cost.
 */
export class PhysicsWorld {
  readonly bodies: RigidBody[] = [];
  gravity: Vec2;

  private readonly iterations: number;
  private readonly linearDamping: number;
  private readonly angularDamping: number;
  private lastManifolds: Manifold[] = [];

  constructor(options: WorldOptions) {
    this.gravity = { ...options.gravity };
    this.iterations = options.iterations ?? DEFAULT_ITERATIONS;
    this.linearDamping = options.linearDamping ?? DEFAULT_LINEAR_DAMPING;
    this.angularDamping = options.angularDamping ?? DEFAULT_ANGULAR_DAMPING;
  }

  add(body: RigidBody): RigidBody {
    this.bodies.push(body);
    return body;
  }

  remove(id: string): void {
    const index = this.bodies.findIndex((body) => body.id === id);
    if (index >= 0) this.bodies.splice(index, 1);
  }

  get(id: string): RigidBody | undefined {
    return this.bodies.find((body) => body.id === id);
  }

  /** Contacts from the most recent step, for impact sounds and dust puffs. */
  get contacts(): Manifold[] {
    return this.lastManifolds;
  }

  /** Adds an acceleration (wind, shake) to a body for one step. */
  applyAcceleration(body: RigidBody, acceleration: Vec2, dt: number): void {
    if (body.type !== BODY_DYNAMIC) return;
    body.velocity = add(body.velocity, scale(acceleration, dt));
  }

  step(dt: number): void {
    this.integrateVelocities(dt);

    const manifolds = this.broadPhase();
    const bounceTargets = prepareManifolds(manifolds);
    solveManifolds(manifolds, bounceTargets, this.iterations);

    this.integratePositions(dt);
    correctPositions(manifolds);

    this.lastManifolds = manifolds;
  }

  private integrateVelocities(dt: number): void {
    for (const body of this.bodies) {
      if (body.type !== BODY_DYNAMIC) continue;
      body.velocity = add(body.velocity, scale(this.gravity, dt));
      body.velocity = scale(body.velocity, 1 - this.linearDamping);
      body.angularVelocity *= 1 - this.angularDamping;
    }
  }

  private integratePositions(dt: number): void {
    for (const body of this.bodies) {
      if (body.type !== BODY_DYNAMIC && body.type !== BODY_KINEMATIC) continue;
      body.position = add(body.position, scale(body.velocity, dt));
      body.angle += body.angularVelocity * dt;
    }
  }

  private broadPhase(): Manifold[] {
    const manifolds: Manifold[] = [];
    for (let i = 0; i < this.bodies.length; i += 1) {
      const a = this.bodies[i];
      for (let j = i + 1; j < this.bodies.length; j += 1) {
        const b = this.bodies[j];
        // Two immovable bodies can never resolve anything between them.
        if (a.invMass === 0 && b.invMass === 0) continue;
        const manifold = collide(a, b);
        if (manifold) manifolds.push(manifold);
      }
    }
    return manifolds;
  }
}
