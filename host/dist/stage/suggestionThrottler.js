export const DEFAULT_SUGGESTION_COOLDOWN_MS = 60_000;
/**
 * Per-stage throttle. The first entry into a stage emits immediately; a
 * re-entry inside the cooldown emits nothing, which also damps stage
 * rollback jitter. The cooldown starts per stage, so switching to a different
 * stage is never blocked by the previous stage's suggestion.
 */
export class SuggestionThrottler {
    lastByStage = new Map();
    cooldownMs;
    constructor(cooldownMs = DEFAULT_SUGGESTION_COOLDOWN_MS) {
        this.cooldownMs = cooldownMs;
    }
    shouldEmit(stage, now) {
        const last = this.lastByStage.get(stage);
        if (last === undefined) {
            this.lastByStage.set(stage, now);
            return true;
        }
        if (now - last < this.cooldownMs) {
            return false;
        }
        this.lastByStage.set(stage, now);
        return true;
    }
    reset() {
        this.lastByStage.clear();
    }
}
//# sourceMappingURL=suggestionThrottler.js.map