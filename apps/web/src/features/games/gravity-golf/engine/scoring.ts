import type { HoleScore } from '../types/gravity-golf.types';

export interface ScoreTerm {
  label: string;
  badgeColor: string;
  description: string;
}

export function getGolfScoreTerm(strokes: number, par: number): ScoreTerm {
  const diff = strokes - par;

  if (strokes === 1 && par > 1) {
    return {
      label: 'Hole in One!',
      badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      description: 'Cosmic perfection with a single gravity field.',
    };
  }

  if (diff <= -3) {
    return {
      label: 'Albatross',
      badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      description: 'Astronomical precision!',
    };
  }
  if (diff === -2) {
    return {
      label: 'Eagle',
      badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      description: 'Superb orbital slingshot.',
    };
  }
  if (diff === -1) {
    return {
      label: 'Birdie',
      badgeColor: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
      description: 'Under par field deployment.',
    };
  }
  if (diff === 0) {
    return {
      label: 'Par',
      badgeColor: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
      description: 'Solid orbital mechanics.',
    };
  }
  if (diff === 1) {
    return {
      label: 'Bogey',
      badgeColor: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
      description: 'One extra field required.',
    };
  }
  return {
    label: `+${diff} Over`,
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    description: 'A chaotic galactic trajectory.',
  };
}

export function calculateStarRating(strokes: number, par: number): number {
  const diff = strokes - par;
  if (diff <= 0) return 3;
  if (diff === 1) return 2;
  if (diff <= 3) return 1;
  return 1; // Completed counts for at least 1 star
}

export function calculateTotalScore(scores: Record<number, HoleScore>): {
  totalStrokes: number;
  totalParDiff: number;
  completedHoles: number;
  starsEarned: number;
} {
  let totalStrokes = 0;
  let totalParDiff = 0;
  let completedHoles = 0;
  let starsEarned = 0;

  for (const score of Object.values(scores)) {
    if (score.status === 'completed') {
      totalStrokes += score.strokes;
      totalParDiff += score.scoreDifference;
      completedHoles++;
      starsEarned += calculateStarRating(score.strokes, score.par);
    }
  }

  return { totalStrokes, totalParDiff, completedHoles, starsEarned };
}
