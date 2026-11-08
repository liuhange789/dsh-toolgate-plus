import type { Stage } from '../model/types.ts';
import type { StageThresholds } from './sensitivityProfile.ts';
export interface StageDecision {
    readonly stage: Stage;
    readonly switched: boolean;
    readonly window: readonly string[];
}
export interface StageDetectorOptions {
    readonly initialStage?: Stage;
}
/**
 * Sliding-window stage detector. It keeps only the last `windowSize` tool
 * names and re-classifies the whole window after each call.
 *
 * Priority: a trailing debug streak wins (most specific), then an edit share
 * above threshold, then an explore share above threshold. If no threshold is
 * met the current stage is kept, which provides mild hysteresis against
 * single-call noise.
 */
export declare class StageDetector {
    private readonly window;
    private current;
    private thresholds;
    private readonly maxWindow;
    constructor(thresholds: StageThresholds, options?: StageDetectorOptions);
    setThresholds(thresholds: StageThresholds): void;
    getStage(): Stage;
    getWindow(): readonly string[];
    reset(): void;
    record(toolName: string): StageDecision;
    private classifyWindow;
    private debugStreakAtTail;
    private countCategories;
}
//# sourceMappingURL=stageDetector.d.ts.map