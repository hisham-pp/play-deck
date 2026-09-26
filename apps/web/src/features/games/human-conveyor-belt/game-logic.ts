export type RouteScoreInput = {
  target: number;
  streak: number;
  objectValue: number;
};

export function createRouteScore({ target, streak, objectValue }: RouteScoreInput) {
  return target + streak * 2 + objectValue;
}

export function nextPhaseIndex(currentPhase: number, totalPhases: number) {
  return (currentPhase + 1) % totalPhases;
}

export function scoreForDrop(currentScore: number, penalty: number) {
  return Math.max(0, currentScore - penalty);
}
