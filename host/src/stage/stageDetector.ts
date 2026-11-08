import type { Stage } from '../model/types.ts';
import { classifyTool, type ToolCategory } from './toolTaxonomy.ts';
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
export class StageDetector {
  private readonly window: string[] = [];
  private current: Stage;
  private thresholds: StageThresholds;
  private readonly maxWindow: number;

  constructor(thresholds: StageThresholds, options: StageDetectorOptions = {}) {
    this.thresholds = { ...thresholds };
    this.maxWindow = thresholds.windowSize;
    this.current = options.initialStage ?? 'exploration';
  }

  setThresholds(thresholds: StageThresholds): void {
    this.thresholds = { ...thresholds };
  }

  getStage(): Stage {
    return this.current;
  }

  getWindow(): readonly string[] {
    return [...this.window];
  }

  reset(): void {
    this.window.length = 0;
    this.current = 'exploration';
  }

  record(toolName: string): StageDecision {
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

  private classifyWindow(): Stage | null {
    if (this.window.length === 0) return null;

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

  private debugStreakAtTail(): number {
    let streak = 0;
    for (let i = this.window.length - 1; i >= 0; i -= 1) {
      if (classifyTool(this.window[i]) !== 'debug') break;
      streak += 1;
    }
    return streak;
  }

  private countCategories(): Record<ToolCategory, number> {
    const counts: Record<ToolCategory, number> = {
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
