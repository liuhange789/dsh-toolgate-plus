import type { Disposer, DshHostContext } from './types/dshContext.ts';
export declare class LifecycleManager {
    private readonly disposers;
    private loaded;
    validateInject(ctx: DshHostContext): boolean;
    registerDisposer(fn: Disposer): void;
    markLoaded(): void;
    isLoaded(): boolean;
    disposeAll(): void;
}
//# sourceMappingURL=lifecycleManager.d.ts.map