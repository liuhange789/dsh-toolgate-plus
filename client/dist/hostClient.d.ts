import type { DshClientContext, Disposer } from './types/clientContext.ts';
import type { ApiWriteResult, PluginConfig, StageSnapshot } from './model/types.ts';
export declare class HostClient {
    private readonly ctx;
    constructor(ctx: DshClientContext);
    getStageSnapshot(): Promise<StageSnapshot>;
    getPluginConfig(): Promise<PluginConfig>;
    setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult>;
    subscribeStagePush(handler: (snapshot: StageSnapshot) => void): Disposer;
}
//# sourceMappingURL=hostClient.d.ts.map