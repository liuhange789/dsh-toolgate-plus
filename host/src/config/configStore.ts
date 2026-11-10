import type { PluginConfig } from '../model/pluginConfig.ts';
import { DEFAULT_PLUGIN_CONFIG, clonePluginConfig } from '../model/pluginConfig.ts';
import type { Sensitivity } from '../model/types.ts';
import { isSensitivity } from '../model/types.ts';
import type { Disposer, LogFn } from '../types/dshContext.ts';

export const ERR_CFG_WRITE_FAILED = 'CFG_WRITE_FAILED';
export const ERR_INVALID_SENSITIVITY = 'INVALID_SENSITIVITY';

export interface ConfigWriteResult {
  config: PluginConfig;
  errorCode: string | null;
}

/**
 * 配置来源改为 cordis 加载器传入的插件配置（配合 index.ts 导出的 configSchema）。
 * DSH 里没有 ctx.config 这个服务，原实现调 ctx.config.read/write/subscribe 会抛 TypeError。
 * 配置键与默认值保持不变：autoCollapse / sensitivity。
 */
export class ConfigStore {
  private current: PluginConfig;
  private readonly log: LogFn | null;

  constructor(initial: Partial<PluginConfig> = {}, log: LogFn | null = null) {
    this.current = this.normalize(initial as Record<string, unknown>);
    this.log = log;
  }

  read(): PluginConfig {
    return clonePluginConfig(this.current);
  }

  async load(): Promise<PluginConfig> {
    return this.read();
  }

  async write(patch: Partial<PluginConfig>): Promise<ConfigWriteResult> {
    if (patch.sensitivity !== undefined && !isSensitivity(patch.sensitivity)) {
      return { config: this.read(), errorCode: ERR_INVALID_SENSITIVITY };
    }
    this.current = {
      autoCollapse: patch.autoCollapse ?? this.current.autoCollapse,
      sensitivity: (patch.sensitivity ?? this.current.sensitivity) as Sensitivity,
    };
    return { config: this.read(), errorCode: null };
  }

  /**
   * 配置只在加载时生效，运行期没有外部写入方（原来的写入入口是浏览器侧的 setPluginConfig RPC）。
   * 保留这个订阅接口，是为了让 index.ts 的阈值刷新逻辑与测试意图不变。
   */
  subscribe(handler: (config: PluginConfig) => void): Disposer {
    handler(this.read());
    return () => {};
  }

  private normalize(raw: Record<string, unknown>): PluginConfig {
    const autoCollapse =
      typeof raw.autoCollapse === 'boolean'
        ? raw.autoCollapse
        : DEFAULT_PLUGIN_CONFIG.autoCollapse;
    const sensitivity = isSensitivity(raw.sensitivity)
      ? (raw.sensitivity as Sensitivity)
      : DEFAULT_PLUGIN_CONFIG.sensitivity;
    if (raw.sensitivity !== undefined && !isSensitivity(raw.sensitivity)) {
      this.log?.('warn', 'ConfigStore: invalid sensitivity, falling back to standard', {
        received: raw.sensitivity,
      });
    }
    return { autoCollapse, sensitivity };
  }
}
