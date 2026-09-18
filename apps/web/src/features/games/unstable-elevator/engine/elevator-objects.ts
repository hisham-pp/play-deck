import {
  boxVertices,
  regularPolygonVertices,
  trapezoidVertices,
  triangleVertices,
} from './physics/shapes';
import type { Vec2 } from './physics/vector';

/** One entry in the cargo catalogue: a hull plus how it behaves and scores. */
export interface ElevatorShape {
  id: string;
  label: string;
  /** Short line shown on the claw card while the player lines the drop up. */
  hint: string;
  build: () => Vec2[];
  density: number;
  friction: number;
  restitution: number;
  /** Multiplier on how hard a gust pushes this shape sideways. */
  windFactor: number;
  /** Base points for landing it, before the floor multiplier. */
  points: number;
  /** First floor this shape can appear on. */
  fromFloor: number;
  /** Rough footprint, used by the bots and the claw's clearance check. */
  width: number;
  height: number;
  tint: string;
}

export const ELEVATOR_SHAPES: ElevatorShape[] = [
  {
    id: 'crate',
    label: 'Crate',
    hint: 'Square, honest, forgiving. Build your base with it.',
    build: () => boxVertices(1.1, 1.1),
    density: 1,
    friction: 0.72,
    restitution: 0.02,
    windFactor: 1,
    points: 10,
    fromFloor: 1,
    width: 1.1,
    height: 1.1,
    tint: '#c2703a',
  },
  {
    id: 'plank',
    label: 'Plank',
    hint: 'Wide and flat. Bridges a gap, or seesaws off the edge.',
    build: () => boxVertices(2.5, 0.3),
    density: 0.7,
    friction: 0.66,
    restitution: 0.02,
    windFactor: 1.35,
    points: 14,
    fromFloor: 1,
    width: 2.5,
    height: 0.3,
    tint: '#a3732f',
  },
  {
    id: 'slab',
    label: 'Slab',
    hint: 'Heavy, low, steady. It squashes a wobble flat.',
    build: () => boxVertices(1.8, 0.52),
    density: 1.9,
    friction: 0.82,
    restitution: 0.01,
    windFactor: 0.6,
    points: 13,
    fromFloor: 1,
    width: 1.8,
    height: 0.52,
    tint: '#6b7280',
  },
  {
    id: 'wedge',
    label: 'Wedge',
    hint: 'Flat base, pointed top. Nothing stacks on it.',
    build: () => triangleVertices(1.35, 1.05),
    density: 0.95,
    friction: 0.74,
    restitution: 0.02,
    windFactor: 0.95,
    points: 15,
    fromFloor: 2,
    width: 1.35,
    height: 1.05,
    tint: '#d97706',
  },
  {
    id: 'cabinet',
    label: 'Cabinet',
    hint: 'Tall and proud, and one good tilt from going over.',
    build: () => boxVertices(0.84, 1.95),
    density: 0.9,
    friction: 0.7,
    restitution: 0.02,
    windFactor: 1.5,
    points: 18,
    fromFloor: 3,
    width: 0.84,
    height: 1.95,
    tint: '#7c4d2a',
  },
  {
    id: 'barrel',
    label: 'Barrel',
    hint: 'Rolls the moment the floor leans. Wedge it in.',
    build: () => regularPolygonVertices(8, 0.62, Math.PI / 8),
    density: 1.15,
    friction: 0.3,
    restitution: 0.08,
    windFactor: 1.05,
    points: 16,
    fromFloor: 3,
    width: 1.24,
    height: 1.24,
    tint: '#b45309',
  },
  {
    id: 'anvil',
    label: 'Anvil',
    hint: 'Tiny and brutally heavy. Put it low or regret it.',
    build: () => trapezoidVertices(0.95, 0.58, 0.62),
    density: 3.4,
    friction: 0.85,
    restitution: 0.01,
    windFactor: 0.35,
    points: 20,
    fromFloor: 4,
    width: 0.95,
    height: 0.62,
    tint: '#334155',
  },
  {
    id: 'crate-light',
    label: 'Hollow Crate',
    hint: 'Barely weighs a thing, so the wind owns it.',
    build: () => boxVertices(1.05, 1.05),
    density: 0.28,
    friction: 0.6,
    restitution: 0.05,
    windFactor: 2.8,
    points: 12,
    fromFloor: 5,
    width: 1.05,
    height: 1.05,
    tint: '#eab308',
  },
  {
    id: 'pipe',
    label: 'Pipe',
    hint: 'Smooth steel. It will find the edge on its own.',
    build: () => regularPolygonVertices(10, 0.52),
    density: 1.5,
    friction: 0.22,
    restitution: 0.14,
    windFactor: 0.8,
    points: 17,
    fromFloor: 6,
    width: 1.04,
    height: 1.04,
    tint: '#94a3b8',
  },
];

const SHAPES_BY_ID = new Map(ELEVATOR_SHAPES.map((shape) => [shape.id, shape]));

export function getShape(id: string): ElevatorShape {
  const shape = SHAPES_BY_ID.get(id);
  if (!shape) throw new Error(`Unknown elevator cargo shape: ${id}`);
  return shape;
}

/** Everything the catalogue offers by the time the lift reaches `floor`. */
export function shapesForFloor(floor: number): ElevatorShape[] {
  return ELEVATOR_SHAPES.filter((shape) => shape.fromFloor <= floor);
}
