import { describe, expect, it } from 'vitest';
import { SuggestionThrottler } from './suggestionThrottler.ts';

describe('SuggestionThrottler', () => {
  it('emits the first suggestion for each stage immediately', () => {
    const throttler = new SuggestionThrottler(60_000);
    expect(throttler.shouldEmit('editing', 1_000)).toBe(true);
    expect(throttler.shouldEmit('exploration', 1_000)).toBe(true);
    expect(throttler.shouldEmit('debugging', 1_000)).toBe(true);
  });

  it('suppresses a duplicate suggestion for the same stage inside the cooldown', () => {
    const throttler = new SuggestionThrottler(60_000);
    expect(throttler.shouldEmit('editing', 1_000)).toBe(true);
    expect(throttler.shouldEmit('editing', 1_001)).toBe(false);
    expect(throttler.shouldEmit('editing', 60_999)).toBe(false);
  });

  it('emits again after the cooldown expires', () => {
    const throttler = new SuggestionThrottler(60_000);
    expect(throttler.shouldEmit('editing', 1_000)).toBe(true);
    expect(throttler.shouldEmit('editing', 61_000)).toBe(true);
  });

  it('clears all state on reset', () => {
    const throttler = new SuggestionThrottler(60_000);
    expect(throttler.shouldEmit('editing', 1_000)).toBe(true);
    throttler.reset();
    expect(throttler.shouldEmit('editing', 1_001)).toBe(true);
  });
});
