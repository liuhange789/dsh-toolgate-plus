import type { PluginConfig } from './model/pluginConfig.ts';
import { createInitialSnapshot, type StageSnapshot } from './model/types.ts';
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

export class HostLightApi {
  private readonly deps: HostLightApiDeps;

  constructor(deps: HostLightApiDeps) {
    this.deps = deps;
  }

  async getStageSnapshot(): Promise<StageSnapshot> {
    if (!this.deps.lifecycle.isLoaded()) {
      return createInitialSnapshot(Date.now());
    }
    return this.deps.getSnapshot();
  }

  async getPluginConfig(): Promise<PluginConfig> {
    return this.deps.configStore.read();
  }

  async setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult> {
    const result = await this.deps.configStore.write(patch);
    return { config: result.config, errorCode: result.errorCode };
  }

  pushStageSnapshot(snapshot: StageSnapshot): void {
    if (!this.deps.lifecycle.isLoaded()) return;
    try {
      this.deps.ctx.push('onStagePush', snapshot);
    } catch {
      this.deps.ctx.log('warn', 'HostLightApi: pushStageSnapshot failed');
    }
  }

  register(): void {
    this.deps.ctx.expose('getStageSnapshot', () => this.getStageSnapshot());
    this.deps.ctx.expose('getPluginConfig', () => this.getPluginConfig());
    this.deps.ctx.expose('setPluginConfig', (...args: unknown[]) =>
      this.setPluginConfig(args[0] as Partial<PluginConfig>),
    );
  }
}
