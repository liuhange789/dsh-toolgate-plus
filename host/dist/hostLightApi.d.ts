import type { PluginConfig } from './model/pluginConfig.ts';
import { type StageSnapshot } from './model/types.ts';
import type { ConfigStore, ConfigWriteResult } from './config/configStore.ts';
import type { DshHostContext } from './types/dshContext.ts';
import type { LifecycleManager } from './lifecycleManager.ts';
export interface HostLightApiDeps {
    ctx: DshHostContext;
    configStore: ConfigStore;
    lifecycle: LifecycleManager;
    getSnapshot: () => StageSnapshot;
}
export interface ApiWriteResult extends ConfigWriteResult {
    config: PluginConfig;
}
export declare class HostLightApi {
    private readonly deps;
    constructor(deps: HostLightApiDeps);
    getStageSnapshot(): Promise<StageSnapshot>;
    getPluginConfig(): Promise<PluginConfig>;
    setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult>;
    pushStageSnapshot(snapshot: StageSnapshot): void;
    register(): void;
}
//# sourceMappingURL=hostLightApi.d.ts.map