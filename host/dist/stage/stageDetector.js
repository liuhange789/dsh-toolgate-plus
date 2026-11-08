import { classifyTool } from "./toolTaxonomy.js";
/**
 * Sliding-window stage detector. It keeps only the last `windowSize` tool
 * names and re-classifies the whole window after each call.
 *
 * Priority: a trailing debug streak wins (most specific), then an edit share
 * above threshold, then an explore share above threshold. If no threshold is
 * met the current stage is kept, which provides mild hysteresis against
 * single-call noise.
 */
export class StageDetector {
    window = [];
    current;
    thresholds;
    maxWindow;
    constructor(thresholds, options = {}) {
        this.thresholds = { ...thresholds };
        this.maxWindow = thresholds.windowSize;
        this.current = options.initialStage ?? 'exploration';
    }
    setThresholds(thresholds) {
        this.thresholds = { ...thresholds };
    }
    getStage() {
        return this.current;
    }
    getWindow() {
        return [...this.window];
    }
    reset() {
        this.window.length = 0;
        this.current = 'exploration';
    }
    record(toolName) {
        if (typeof toolName !== 'string' || toolName.trim().length === 0) {
            return { stage: this.current, switched: false, window: this.getWindow() };
        }
        this.window.push(toolName);
        while (this.window.length > this.maxWindow) {
            this.window.shift();
        }
        const observed = this.classifyWindow();
        const switched = observed !== null && observed !== this.current;
        if (switched) {
            this.current = observed;
        }
        return { stage: this.current, switched, window: this.getWindow() };
    }
    classifyWindow() {
        if (this.window.length === 0)
            return null;
        if (this.debugStreakAtTail() >= this.thresholds.debugStreak) {
            return 'debugging';
        }
        const counts = this.countCategories();
        const total = this.window.length;
        if (counts.edit / total > this.thresholds.editShare) {
            return 'editing';
        }
        if (counts.explore / total > this.thresholds.exploreShare) {
            return 'exploration';
        }
        return null;
    }
    debugStreakAtTail() {
        let streak = 0;
        for (let i = this.window.length - 1; i >= 0; i -= 1) {
            if (classifyTool(this.window[i]) !== 'debug')
                break;
            streak += 1;
        }
        return streak;
    }
    countCategories() {
        const counts = {
            explore: 0,
            edit: 0,
            debug: 0,
            unknown: 0,
        };
        for (const toolName of this.window) {
            counts[classifyTool(toolName)] += 1;
        }
        return counts;
    }
}
//# sourceMappingURL=stageDetector.js.map