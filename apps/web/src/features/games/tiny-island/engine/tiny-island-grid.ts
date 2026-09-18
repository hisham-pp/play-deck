import type { GridCoord, IslandTile, ResourceType, TileType } from './tiny-island-types';

export const DEFAULT_GRID_SIZE = 9;
export const CENTER_COORD: GridCoord = { x: 4, y: 4 };

/** Returns Euclidean distance from grid center. */
export function getDistanceFromCenter(x: number, y: number, center = CENTER_COORD): number {
  return Math.hypot(x - center.x, y - center.y);
}

/** Generates a balanced circular tropical island on a 9x9 grid. */
export function generateIslandGrid(size = DEFAULT_GRID_SIZE): IslandTile[][] {
  const center = { x: Math.floor(size / 2), y: Math.floor(size / 2) };
  const maxIslandRadius = 3.9;
  const tiles: IslandTile[][] = [];

  for (let y = 0; y < size; y++) {
    const row: IslandTile[] = [];
    for (let x = 0; x < size; x++) {
      const dist = getDistanceFromCenter(x, y, center);

      if (dist > maxIslandRadius) {
        // Surrounding ocean
        row.push({
          x,
          y,
          type: 'water',
          baseType: 'water',
          sinkingState: 'submerged',
          resource: null,
          resourceCount: 0,
        });
        continue;
      }

      let type: TileType;
      let resource: ResourceType | null = null;
      let resourceCount = 0;

      if (dist > 2.8) {
        // Coastal sandy beaches
        type = 'sand';
        // Beach coconuts or driftwood
        if ((x + y * 3) % 4 === 0) {
          resource = 'food';
          resourceCount = 1;
        } else if ((x * 2 + y) % 5 === 0) {
          resource = 'wood';
          resourceCount = 1;
        }
      } else if (dist <= 1.0) {
        // High ground island peak: stone quarry & jungle canopy
        if (x === center.x && y === center.y) {
          type = 'rock';
          resource = 'stone';
          resourceCount = 3;
        } else {
          type = (x + y) % 2 === 0 ? 'grove' : 'grass';
          resource = type === 'grove' ? 'food' : 'wood';
          resourceCount = 2;
        }
      } else {
        // Mid-ring fertile biome
        const pattern = (x * 7 + y * 13) % 6;
        if (pattern === 0 || pattern === 1) {
          type = 'grass';
          resource = 'wood';
          resourceCount = 2;
        } else if (pattern === 2 || pattern === 3) {
          type = 'rock';
          resource = 'stone';
          resourceCount = 2;
        } else if (pattern === 4) {
          type = 'grove';
          resource = 'food';
          resourceCount = 2;
        } else {
          type = 'sand';
          resource = null;
          resourceCount = 0;
        }
      }

      row.push({
        x,
        y,
        type,
        baseType: type,
        sinkingState: 'dry',
        resource,
        resourceCount,
      });
    }
    tiles.push(row);
  }

  return tiles;
}

/** Check if coordinates are within the grid bounds. */
export function isInBounds(x: number, y: number, size = DEFAULT_GRID_SIZE): boolean {
  return x >= 0 && x < size && y >= 0 && y < size;
}

/** Returns the 4 orthogonal neighbors of a coordinate. */
export function getAdjacentCoords(coord: GridCoord, size = DEFAULT_GRID_SIZE): GridCoord[] {
  const deltas = [
    { x: 0, y: -1 }, // North
    { x: 1, y: 0 }, // East
    { x: 0, y: 1 }, // South
    { x: -1, y: 0 }, // West
  ];

  return deltas
    .map((d) => ({ x: coord.x + d.x, y: coord.y + d.y }))
    .filter((c) => isInBounds(c.x, c.y, size));
}

/** Checks whether two coordinates are orthogonally adjacent. */
export function isAdjacent(a: GridCoord, b: GridCoord): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/** Checks if a tile can be stepped on by a player. */
export function isTileWalkable(tile: IslandTile): boolean {
  // Bridge makes water walkable
  if (tile.type === 'bridge') return true;
  // Barriers block movement
  if (tile.type === 'barrier') return false;
  // Submerged or open water cannot be walked on without a bridge
  if (tile.sinkingState === 'submerged' || tile.type === 'water') return false;
  return true;
}

/** Computes which tiles will sink and which should be warned next round. */
export function calculateNextShrinkWave(
  tiles: IslandTile[][],
  round: number,
  size = DEFAULT_GRID_SIZE,
): { newlySubmerged: GridCoord[]; newlyWarning: GridCoord[] } {
  const newlySubmerged: GridCoord[] = [];
  const newlyWarning: GridCoord[] = [];

  // Thresholds based on round:
  // Round 1: outer perimeter warning
  // Round 2: sink outer perimeter, warn next ring
  // Round 3+: progressively shrink toward center
  const center = { x: Math.floor(size / 2), y: Math.floor(size / 2) };

  // Shrink distance bounds by round
  const maxDryRadius = Math.max(0.9, 3.8 - round * 0.65);
  const warningDistanceBuffer = 0.7;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = tiles[y][x];
      // Bridges on water remain until submerged further or kept as wooden paths
      if (tile.sinkingState === 'submerged') continue;

      const dist = getDistanceFromCenter(x, y, center);

      if (dist > maxDryRadius) {
        // Tile was previously warned or outside survival radius -> Submerge
        newlySubmerged.push({ x, y });
      } else if (dist > maxDryRadius - warningDistanceBuffer && tile.sinkingState === 'dry') {
        // Tile is now on the dangerous perimeter -> Warn
        newlyWarning.push({ x, y });
      }
    }
  }

  return { newlySubmerged, newlyWarning };
}

/** Find initial spawn coordinates for 2-6 players distributed around the island ring. */
export function getSpawnCoordinates(playerCount: number, size = DEFAULT_GRID_SIZE): GridCoord[] {
  const center = { x: Math.floor(size / 2), y: Math.floor(size / 2) };
  const spawnRadius = 2.4;
  const coords: GridCoord[] = [];

  for (let i = 0; i < playerCount; i++) {
    const angle = (i * 2 * Math.PI) / playerCount;
    const x = Math.round(center.x + Math.cos(angle) * spawnRadius);
    const y = Math.round(center.y + Math.sin(angle) * spawnRadius);
    coords.push({
      x: Math.max(1, Math.min(size - 2, x)),
      y: Math.max(1, Math.min(size - 2, y)),
    });
  }

  return coords;
}
