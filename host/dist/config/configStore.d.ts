import type { PluginConfig } from '../model/pluginConfig.ts';
import type { Disposer, LogFn } from '../types/dshContext.ts';
export declare const ERR_CFG_WRITE_FAILED = "CFG_WRITE_FAILED";
export declare const ERR_INVALID_SENSITIVITY = "INVALID_SENSITIVITY";
export interface ConfigWriteResult {
    config: PluginConfig;
    errorCode: string | null;
}
/**
 * 配置来源改为 cordis 加载器传入的插件配置（配合 index.ts 导出的 configSchema）。
 * DSH 里没有 ctx.config 这个服务，原实现调 ctx.config.read/write/subscribe 会抛 TypeError。
 * 配置键与默认值保持不变：autoCollapse / sensitivity。
 */
export declare class ConfigStore {
    private current;
    private readonly log;
    constructor(initial?: Partial<PluginConfig>, log?: LogFn | null);
    read(): PluginConfig;
    load(): Promise<PluginConfig>;
    write(patch: Partial<PluginConfig>): Promise<ConfigWriteResult>;
    /**
     * 配置只在加载时生效，运行期没有外部写入方（原来的写入入口是浏览器侧的 setPluginConfig RPC）。
     * 保留这个订阅接口，是为了让 index.ts 的阈值刷新逻辑与测试意图不变。
     */
    subscribe(handler: (config: PluginConfig) => void): Disposer;
    private normalize;
}
//# sourceMappingURL=configStore.d.ts.map