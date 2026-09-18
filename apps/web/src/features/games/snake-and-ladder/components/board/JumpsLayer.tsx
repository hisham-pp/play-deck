'use client';

import { ALL_JUMPS } from '../../engine/snake-ladder-constants';
import type { SnakeLadderJump } from '../../types/snake-and-ladder.types';
import { BOARD_VIEWBOX, CELL_WIDTH, squareCenter } from '../../utils/board-geometry';

const RAIL_GAP = CELL_WIDTH * 0.26;
const RUNG_SPACING = CELL_WIDTH * 0.62;
const SNAKE_WIDTH = CELL_WIDTH * 0.34;

/** Unit vector along the jump, plus the perpendicular the rails ride on. */
function axes(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    length,
    ux: dx / length,
    uy: dy / length,
    px: -dy / length,
    py: dx / length,
  };
}

function Ladder({ jump }: { jump: SnakeLadderJump }) {
  const from = squareCenter(jump.from);
  const to = squareCenter(jump.to);
  const { length, ux, uy, px, py } = axes(from, to);

  const railOffset = RAIL_GAP / 2;
  const rungCount = Math.max(2, Math.floor(length / RUNG_SPACING));

  const rungs = Array.from({ length: rungCount - 1 }, (_, index) => {
    const t = ((index + 1) / rungCount) * length;
    const cx = from.x + ux * t;
    const cy = from.y + uy * t;
    return (
      <line
        key={t}
        x1={cx + px * railOffset}
        y1={cy + py * railOffset}
        x2={cx - px * railOffset}
        y2={cy - py * railOffset}
      />
    );
  });

  return (
    <g
      className="snake-ladder-ladder"
      stroke="url(#sl-ladder-rail)"
      strokeWidth={CELL_WIDTH * 0.09}
      strokeLinecap="round"
      fill="none"
    >
      <line
        x1={from.x + px * railOffset}
        y1={from.y + py * railOffset}
        x2={to.x + px * railOffset}
        y2={to.y + py * railOffset}
      />
      <line
        x1={from.x - px * railOffset}
        y1={from.y - py * railOffset}
        x2={to.x - px * railOffset}
        y2={to.y - py * railOffset}
      />
      <g strokeWidth={CELL_WIDTH * 0.07}>{rungs}</g>
    </g>
  );
}

function Snake({ jump }: { jump: SnakeLadderJump }) {
  const head = squareCenter(jump.from);
  const tail = squareCenter(jump.to);
  const { length, ux, uy, px, py } = axes(head, tail);

  // Two opposing control points give the body its slither without any physics.
  const wave = Math.min(length * 0.28, CELL_WIDTH * 2.2);
  const c1 = {
    x: head.x + ux * length * 0.3 + px * wave,
    y: head.y + uy * length * 0.3 + py * wave,
  };
  const c2 = {
    x: head.x + ux * length * 0.7 - px * wave,
    y: head.y + uy * length * 0.7 - py * wave,
  };

  const eyeOffset = SNAKE_WIDTH * 0.32;

  return (
    <g className="snake-ladder-snake">
      <path
        d={`M ${head.x} ${head.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${tail.x} ${tail.y}`}
        stroke="url(#sl-snake-body)"
        strokeWidth={SNAKE_WIDTH}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M ${head.x} ${head.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${tail.x} ${tail.y}`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={SNAKE_WIDTH * 0.28}
        strokeLinecap="round"
        strokeDasharray={`${CELL_WIDTH * 0.2} ${CELL_WIDTH * 0.34}`}
        fill="none"
      />
      <circle cx={head.x} cy={head.y} r={SNAKE_WIDTH * 0.78} fill="#166534" />
      <circle
        cx={head.x - px * eyeOffset}
        cy={head.y - py * eyeOffset}
        r={SNAKE_WIDTH * 0.18}
        fill="#fef9c3"
      />
      <circle
        cx={head.x + px * eyeOffset}
        cy={head.y + py * eyeOffset}
        r={SNAKE_WIDTH * 0.18}
        fill="#fef9c3"
      />
    </g>
  );
}

/**
 * Draws every snake and ladder over the grid. Purely decorative: the reducer
 * owns where a token actually lands, and the jump table drives both.
 */
export function JumpsLayer() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${BOARD_VIEWBOX} ${BOARD_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sl-ladder-rail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="sl-snake-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>

      {ALL_JUMPS.filter((jump) => jump.kind === 'ladder').map((jump) => (
        <Ladder key={`ladder-${jump.from}`} jump={jump} />
      ))}
      {ALL_JUMPS.filter((jump) => jump.kind === 'snake').map((jump) => (
        <Snake key={`snake-${jump.from}`} jump={jump} />
      ))}
    </svg>
  );
}
