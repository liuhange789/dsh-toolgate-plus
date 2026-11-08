import type { Disposer, DshHostContext } from './types/dshContext.ts';

const REQUIRED_INJECTS: readonly string[] = ['agents', 'tools'];

export class LifecycleManager {
  private readonly disposers: Disposer[] = [];
  private loaded = false;

  validateInject(ctx: DshHostContext): boolean {
    for (const required of REQUIRED_INJECTS) {
      if (!ctx.inject.includes(required)) {
        ctx.log('error', 'LifecycleManager: missing required inject', { missing: required });
        return false;
      }
    }
    return true;
  }

  registerDisposer(fn: Disposer): void {
    this.disposers.push(fn);
  }

  markLoaded(): void {
    this.loaded = true;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  disposeAll(): void {
    while (this.disposers.length > 0) {
      const disposer = this.disposers.pop();
      if (disposer) {
        try {
          disposer();
        } catch {
          // Disposer failures must not block the remaining teardown.
        }
      }
    }
    this.loaded = false;
  }
}
