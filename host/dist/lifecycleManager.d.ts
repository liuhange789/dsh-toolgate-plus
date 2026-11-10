import type { Disposer, DshHostContext, LogFn } from './types/dshContext.ts';
export declare class LifecycleManager {
    private readonly disposers;
    private readonly log;
    private loaded;
    constructor(log?: LogFn);
    /**
     * 判断宿主是否真的提供了所需服务。
     * 原实现读 ctx.inject（cordis Context 上并没有这个属性），在真实宿主里会直接抛错。
     */
    validateInject(ctx: DshHostContext): boolean;
    registerDisposer(fn: Disposer): void;
    markLoaded(): void;
    isLoaded(): boolean;
    disposeAll(): void;
}
//# sourceMappingURL=lifecycleManager.d.ts.map