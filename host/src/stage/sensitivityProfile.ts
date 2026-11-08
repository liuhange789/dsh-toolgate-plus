import type { Sensitivity } from '../model/types.ts';
import { isSensitivity } from '../model/types.ts';

export interface StageThresholds {
  /** Number of most recent tool calls considered. Spec fixes this at 5. */
  windowSize: number;
  /** Exploration when explore-like share is strictly greater than this. */
  exploreShare: number;
  /** Editing when edit-like share is strictly greater than this. */
  editShare: number;
  /** Debugging when this many debug-like calls appear consecutively. */
  debugStreak: number;
}

export const DEFAULT_THRESHOLDS: StageThresholds = {
  windowSize: 5,
  exploreShare: 0.6,
  editShare: 0.5,
  debugStreak: 2,
};

export const SENSITIVITY_PROFILES: Record<Sensitivity, StageThresholds> = {
  loose: { windowSize: 5, exploreShare: 0.8, editShare: 0.6, debugStreak: 4 },
  standard: { ...DEFAULT_THRESHOLDS },
  aggressive: { windowSize: 5, exploreShare: 0.5, editShare: 0.4, debugStreak: 2 },
};

export function resolveProfile(sensitivity: unknown): StageThresholds {
  return isSensitivity(sensitivity)
    ? { ...SENSITIVITY_PROFILES[sensitivity] }
    : { ...DEFAULT_THRESHOLDS };
}
