import type { Stage } from '../model/types.ts';
export declare const DEFAULT_SUGGESTION_COOLDOWN_MS = 60000;
/**
 * Per-stage throttle. The first entry into a stage emits immediately; a
 * re-entry inside the cooldown emits nothing, which also damps stage
 * rollback jitter. The cooldown starts per stage, so switching to a different
 * stage is never blocked by the previous stage's suggestion.
 */
export declare class SuggestionThrottler {
    private readonly lastByStage;
    private readonly cooldownMs;
    constructor(cooldownMs?: number);
    shouldEmit(stage: Stage, now: number): boolean;
    reset(): void;
}
//# sourceMappingURL=suggestionThrottler.d.ts.map