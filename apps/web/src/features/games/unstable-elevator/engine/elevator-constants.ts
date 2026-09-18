/**
 * The simulation runs in metres with y pointing up, in the elevator's own
 * frame: the platform stays near the origin and the shaft scrolls past it.
 * Rising is modelled as extra pseudo-gravity, which is what makes a sudden
 * stop throw the stack into the air.
 */

export const GRAVITY = 16;
export const PHYSICS_STEP = 1 / 120;
/** Ceiling on catch-up steps, so a backgrounded tab never simulates a minute. */
export const MAX_STEPS_PER_FRAME = 8;

export const SHAFT_WIDTH = 9;
export const SHAFT_HEIGHT = 11;
export const PLATFORM_WIDTH = 5.2;
export const PLATFORM_THICKNESS = 0.36;
/** Top surface of the platform when it is level and centred. */
export const PLATFORM_SURFACE_Y = 0;
export const PLATFORM_CENTRE_Y = PLATFORM_SURFACE_Y - PLATFORM_THICKNESS / 2;

/** Height the claw releases from, and the highest a tower may grow. */
export const DROP_HEIGHT = 7.2;
export const CLAW_RANGE = PLATFORM_WIDTH / 2 + 0.6;
/** Anything below this has left the platform for good. */
export const FALL_LINE_Y = -3.2;
/** Anything beyond this sideways is out of the shaft. */
export const SIDE_LINE_X = SHAFT_WIDTH / 2 + 1.5;

export const PHASE_IDLE = 'idle';
export const PHASE_COUNTDOWN = 'countdown';
export const PHASE_PLACING = 'placing';
export const PHASE_SETTLING = 'settling';
export const PHASE_ASCENDING = 'ascending';
export const PHASE_COLLAPSE = 'collapse';
export const PHASE_SCORES = 'scores';

export const COUNTDOWN_MS = 3200;
export const PLACING_MS = 14000;
/** Grace after a drop for the stack to stop moving before the lift sets off. */
export const SETTLE_MAX_MS = 3500;
export const COLLAPSE_MS = 2600;

export const MIN_SEATS = 2;
export const MAX_SEATS = 4;
/** Objects the crew may lose before the run ends. */
export const DEFAULT_SLIPS = 5;

export const REST_LINEAR_EPSILON = 0.22;
export const REST_ANGULAR_EPSILON = 0.4;

/** Seat colours, ordered so neighbouring seats never share a hue. */
export const SEAT_COLORS = ['amber', 'sky', 'emerald', 'rose'] as const;
export type SeatColor = (typeof SEAT_COLORS)[number];

export const SEAT_TYPE_HUMAN = 'human';
export const SEAT_TYPE_BOT = 'bot';

export const GAME_ID = 'unstable-elevator';
export const GAME_NAME = 'Unstable Elevator';
export const CHANNEL_NAMESPACE = 'unstable-elevator';
