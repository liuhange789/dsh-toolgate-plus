import type { Sensitivity } from '../model/types.ts';
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
export declare const DEFAULT_THRESHOLDS: StageThresholds;
export declare const SENSITIVITY_PROFILES: Record<Sensitivity, StageThresholds>;
export declare function resolveProfile(sensitivity: unknown): StageThresholds;
//# sourceMappingURL=sensitivityProfile.d.ts.map