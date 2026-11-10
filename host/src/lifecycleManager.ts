import type { Disposer, DshHostContext, LogFn } from './types/dshContext.ts';

/** 本插件只硬依赖 tools；agent 由工具调用负载带过来，不需要作为服务注入。 */
const REQUIRED_INJECTS: readonly string[] = ['tools'];

export class LifecycleManager {
  private readonly disposers: Disposer[] = [];
  private readonly log: LogFn;
  private loaded = false;

  constructor(log: LogFn = () => {}) {
    this.log = log;
  }

  /**
   * 判断宿主是否真的提供了所需服务。
   * 原实现读 ctx.inject（cordis Context 上并没有这个属性），在真实宿主里会直接抛错。
   */
  validateInject(ctx: DshHostContext): boolean {
    for (const required of REQUIRED_INJECTS) {
      const service = (ctx as unknown as Record<string, unknown>)[required];
      if (service === undefined || service === null) {
        this.log('error', 'LifecycleManager: missing required service', { missing: required });
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
