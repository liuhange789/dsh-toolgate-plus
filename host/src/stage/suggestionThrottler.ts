import type { Stage } from '../model/types.ts';

export const DEFAULT_SUGGESTION_COOLDOWN_MS = 60_000;

/**
 * Per-stage throttle. The first entry into a stage emits immediately; a
 * re-entry inside the cooldown emits nothing, which also damps stage
 * rollback jitter. The cooldown starts per stage, so switching to a different
 * stage is never blocked by the previous stage's suggestion.
 */
export class SuggestionThrottler {
  private readonly lastByStage = new Map<Stage, number>();
  private readonly cooldownMs: number;

  constructor(cooldownMs: number = DEFAULT_SUGGESTION_COOLDOWN_MS) {
    this.cooldownMs = cooldownMs;
  }

  shouldEmit(stage: Stage, now: number): boolean {
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

  reset(): void {
    this.lastByStage.clear();
  }
}
