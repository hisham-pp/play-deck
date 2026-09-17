import {
  AIR_ANGULAR_DAMPING,
  AIR_CONTROL_TORQUE,
  BUMP_STOP_STIFFNESS,
  CHASSIS_INERTIA,
  CHASSIS_LINEAR_DRAG,
  CHASSIS_MASS,
  clamp,
  DRIVE_REACTION_SHARE,
  FRONT_MOUNT,
  GRAVITY,
  GROUND_ANGULAR_DAMPING,
  HEAD_OFFSET,
  HEAD_RADIUS,
  HULL_FRICTION,
  HULL_POINTS,
  HULL_RESTITUTION,
  LATERAL_DAMPING,
  LATERAL_STIFFNESS,
  MAX_ANGULAR_VELOCITY,
  REAR_DRIVE_SHARE,
  REAR_MOUNT,
  ROLLING_RESISTANCE,
  rotate,
  toWorld,
  WHEEL_INERTIA,
  WHEEL_MASS,
  WHEEL_RADIUS,
  WHEEL_RESTITUTION,
  WHEEL_SPIN_DRAG,
} from './summit-constants';
import type { Terrain, Vec2, Vehicle, VehicleSpec, Wheel } from './summit-types';
import { circleContact, pointContact } from './terrain-query';

export interface DriveInput {
  gas: boolean;
  brake: boolean;
  hasFuel: boolean;
}

export interface StepContact {
  wheelsGrounded: number;
  headHit: boolean;
  /** Largest closing speed against the ground this step (m/s). */
  impact: number;
}

const cross = (r: Vec2, f: Vec2) => r.x * f.y - r.y * f.x;
const dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y;

function createWheel(mount: Vec2, pos: Vec2): Wheel {
  return {
    pos,
    vel: { x: 0, y: 0 },
    mount,
    radius: WHEEL_RADIUS,
    spin: 0,
    angle: 0,
    grounded: false,
    contactPoint: { x: pos.x, y: pos.y - WHEEL_RADIUS },
    contactNormal: { x: 0, y: 1 },
    slip: 0,
    normalImpulse: 0,
  };
}

export function createVehicle(spec: VehicleSpec, x: number, groundY: number): Vehicle {
  const pos = { x, y: groundY + WHEEL_RADIUS + spec.suspensionRest - REAR_MOUNT.y - 0.08 };
  const wheelAt = (m: Vec2) =>
    createWheel(m, toWorld(pos, 0, { x: m.x, y: m.y - spec.suspensionRest }));
  return {
    pos,
    vel: { x: 0, y: 0 },
    angle: 0,
    angVel: 0,
    wheels: [wheelAt(REAR_MOUNT), wheelAt(FRONT_MOUNT)],
    spec,
    hullContact: false,
    squash: 0,
  };
}

/** Pointer velocity of a chassis point offset `r` from the centre of mass. */
function pointVelocity(v: Vehicle, r: Vec2): Vec2 {
  return { x: v.vel.x - v.angVel * r.y, y: v.vel.y + v.angVel * r.x };
}

/** Spring-damper along the strut axis plus a stiff lateral link. */
function applySuspension(v: Vehicle, w: Wheel, dt: number, torque: { value: number }): void {
  const { spec } = v;
  const anchor = toWorld(v.pos, v.angle, w.mount);
  const axis = rotate({ x: 0, y: -1 }, v.angle);
  const side = { x: -axis.y, y: axis.x };
  const r = { x: anchor.x - v.pos.x, y: anchor.y - v.pos.y };
  const delta = { x: w.pos.x - anchor.x, y: w.pos.y - anchor.y };
  const mountVel = pointVelocity(v, r);
  const rel = { x: w.vel.x - mountVel.x, y: w.vel.y - mountVel.y };

  const extension = dot(delta, axis);
  const extRate = dot(rel, axis);
  let axial = spec.springK * (extension - spec.suspensionRest) + spec.springDamping * extRate;
  if (extension < spec.suspensionMin) {
    axial +=
      BUMP_STOP_STIFFNESS * (extension - spec.suspensionMin) + spec.springDamping * 2 * extRate;
  } else if (extension > spec.suspensionMax) {
    axial += BUMP_STOP_STIFFNESS * (extension - spec.suspensionMax);
  }
  const lateral = LATERAL_STIFFNESS * dot(delta, side) + LATERAL_DAMPING * dot(rel, side);

  const force = {
    x: -axial * axis.x - lateral * side.x,
    y: -axial * axis.y - lateral * side.y,
  };
  w.vel.x += (force.x / WHEEL_MASS) * dt;
  w.vel.y += (force.y / WHEEL_MASS) * dt;
  v.vel.x -= (force.x / CHASSIS_MASS) * dt;
  v.vel.y -= (force.y / CHASSIS_MASS) * dt;
  torque.value -= cross(r, force);
}

function wheelTorque(spec: VehicleSpec, w: Wheel, share: number, input: DriveInput): number {
  if (input.gas && !input.brake && input.hasFuel) {
    return spec.driveTorque * share * Math.max(0, 1 - w.spin / spec.maxWheelSpin);
  }
  if (input.brake && !input.gas) {
    if (w.spin > 1) return -spec.brakeTorque * share;
    if (!input.hasFuel) return -w.spin * 40;
    return -spec.driveTorque * 0.55 * share * Math.max(0, 1 + w.spin / spec.reverseSpin);
  }
  return 0;
}

function applyDrive(v: Vehicle, input: DriveInput, airborne: boolean, dt: number): number {
  let reaction = 0;
  v.wheels.forEach((w, i) => {
    const share = i === 0 ? REAR_DRIVE_SHARE : 1 - REAR_DRIVE_SHARE;
    const torque = wheelTorque(v.spec, w, share, input);
    const before = w.spin;
    w.spin += (torque / WHEEL_INERTIA) * dt;
    // Brakes stop the wheel; they never spin it backwards.
    if (torque < 0 && before > 1 && w.spin < 0) w.spin = 0;
    w.spin *= 1 - WHEEL_SPIN_DRAG * dt;
    if (w.grounded)
      w.spin -= Math.sign(w.spin) * Math.min(Math.abs(w.spin), ROLLING_RESISTANCE * dt);
    reaction += torque * DRIVE_REACTION_SHARE;
  });
  if (airborne) {
    const dir = (input.gas ? 1 : 0) - (input.brake ? 1 : 0);
    reaction += dir * AIR_CONTROL_TORQUE;
  }
  return reaction;
}

function collideWheel(w: Wheel, terrain: Terrain, grip: number): number {
  const c = circleContact(terrain, w.pos, w.radius);
  w.grounded = false;
  w.normalImpulse = 0;
  if (!c) return 0;
  const n = c.normal;
  w.pos.x += n.x * c.depth;
  w.pos.y += n.y * c.depth;
  const vn = dot(w.vel, n);
  let jn = 0;
  if (vn < 0) {
    jn = -vn * (1 + WHEEL_RESTITUTION) * WHEEL_MASS;
    w.vel.x -= n.x * vn * (1 + WHEEL_RESTITUTION);
    w.vel.y -= n.y * vn * (1 + WHEEL_RESTITUTION);
  }
  const tangent = { x: n.y, y: -n.x };
  const slip = dot(w.vel, tangent) - w.spin * w.radius;
  const effMass = 1 / (1 / WHEEL_MASS + (w.radius * w.radius) / WHEEL_INERTIA);
  const jt = clamp(-slip * effMass, -grip * jn, grip * jn);
  w.vel.x += (tangent.x * jt) / WHEEL_MASS;
  w.vel.y += (tangent.y * jt) / WHEEL_MASS;
  w.spin -= (jt * w.radius) / WHEEL_INERTIA;

  w.grounded = true;
  w.normalImpulse = jn;
  w.slip = slip;
  w.contactPoint = c.point;
  w.contactNormal = n;
  return Math.max(0, -vn);
}

function resolveHullPoint(v: Vehicle, local: Vec2, terrain: Terrain): number {
  const p = toWorld(v.pos, v.angle, local);
  const c = pointContact(terrain, p);
  if (!c) return 0;
  v.hullContact = true;
  const n = c.normal;
  v.pos.x += n.x * c.depth * 0.8;
  v.pos.y += n.y * c.depth * 0.8;
  const r = { x: p.x - v.pos.x, y: p.y - v.pos.y };
  const vn = dot(pointVelocity(v, r), n);
  if (vn >= 0) return 0;

  const rn = cross(r, n);
  const jn = (-(1 + HULL_RESTITUTION) * vn) / (1 / CHASSIS_MASS + (rn * rn) / CHASSIS_INERTIA);
  applyImpulse(v, r, { x: n.x * jn, y: n.y * jn });

  const t = { x: n.y, y: -n.x };
  const rt = cross(r, t);
  const vt = dot(pointVelocity(v, r), t);
  const jt = clamp(
    -vt / (1 / CHASSIS_MASS + (rt * rt) / CHASSIS_INERTIA),
    -HULL_FRICTION * jn,
    HULL_FRICTION * jn,
  );
  applyImpulse(v, r, { x: t.x * jt, y: t.y * jt });
  return -vn;
}

function applyImpulse(v: Vehicle, r: Vec2, j: Vec2): void {
  v.vel.x += j.x / CHASSIS_MASS;
  v.vel.y += j.y / CHASSIS_MASS;
  v.angVel += cross(r, j) / CHASSIS_INERTIA;
}

/** Advances the vehicle one fixed physics step. */
export function stepVehicle(
  v: Vehicle,
  terrain: Terrain,
  input: DriveInput,
  dt: number,
): StepContact {
  const airborne = !v.wheels[0].grounded && !v.wheels[1].grounded && !v.hullContact;
  const torque = { value: applyDrive(v, input, airborne, dt) };
  for (const w of v.wheels) applySuspension(v, w, dt, torque);

  v.vel.y -= GRAVITY * dt;
  v.angVel += (torque.value / CHASSIS_INERTIA) * dt;
  v.vel.x *= 1 - CHASSIS_LINEAR_DRAG * dt;
  v.angVel *= 1 - (airborne ? AIR_ANGULAR_DAMPING : GROUND_ANGULAR_DAMPING) * dt;
  v.angVel = clamp(v.angVel, -MAX_ANGULAR_VELOCITY, MAX_ANGULAR_VELOCITY);

  v.pos.x += v.vel.x * dt;
  v.pos.y += v.vel.y * dt;
  v.angle += v.angVel * dt;

  let impact = 0;
  let wheelsGrounded = 0;
  for (const w of v.wheels) {
    w.vel.y -= GRAVITY * dt;
    w.pos.x += w.vel.x * dt;
    w.pos.y += w.vel.y * dt;
    impact = Math.max(impact, collideWheel(w, terrain, v.spec.grip));
    if (w.grounded) wheelsGrounded++;
    w.angle -= w.spin * dt;
  }

  v.hullContact = false;
  for (const local of HULL_POINTS) impact = Math.max(impact, resolveHullPoint(v, local, terrain));
  const head = toWorld(v.pos, v.angle, HEAD_OFFSET);
  const headHit = circleContact(terrain, head, HEAD_RADIUS) !== null;

  v.squash = Math.max(0, v.squash - dt * 4);
  return { wheelsGrounded, headHit, impact };
}

/** Forward speed in m/s (negative when reversing). */
export function vehicleSpeed(v: Vehicle): number {
  return v.vel.x;
}
