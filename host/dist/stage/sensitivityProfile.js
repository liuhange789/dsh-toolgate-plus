import { isSensitivity } from "../model/types.js";
export const DEFAULT_THRESHOLDS = {
    windowSize: 5,
    exploreShare: 0.6,
    editShare: 0.5,
    debugStreak: 2,
};
export const SENSITIVITY_PROFILES = {
    loose: { windowSize: 5, exploreShare: 0.8, editShare: 0.6, debugStreak: 4 },
    standard: { ...DEFAULT_THRESHOLDS },
    aggressive: { windowSize: 5, exploreShare: 0.5, editShare: 0.4, debugStreak: 2 },
};
export function resolveProfile(sensitivity) {
    return isSensitivity(sensitivity)
        ? { ...SENSITIVITY_PROFILES[sensitivity] }
        : { ...DEFAULT_THRESHOLDS };
}
//# sourceMappingURL=sensitivityProfile.js.map