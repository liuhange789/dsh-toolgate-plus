import type { DshClientContext, Disposer } from './types/clientContext.ts';
import type {
  ApiWriteResult,
  PluginConfig,
  StageSnapshot,
} from './model/types.ts';
import {
  DEFAULT_PLUGIN_CONFIG,
  createDefaultStageSnapshot,
} from './model/types.ts';

export class HostClient {
  private readonly ctx: DshClientContext;

  constructor(ctx: DshClientContext) {
    this.ctx = ctx;
  }

  async getStageSnapshot(): Promise<StageSnapshot> {
    try {
      return (await this.ctx.host.call('getStageSnapshot')) as StageSnapshot;
    } catch {
      return createDefaultStageSnapshot();
    }
  }

  async getPluginConfig(): Promise<PluginConfig> {
    try {
      return (await this.ctx.host.call('getPluginConfig')) as PluginConfig;
    } catch {
      return { ...DEFAULT_PLUGIN_CONFIG };
    }
  }

  async setPluginConfig(patch: Partial<PluginConfig>): Promise<ApiWriteResult> {
    try {
      return (await this.ctx.host.call('setPluginConfig', patch)) as ApiWriteResult;
    } catch {
      return {
        config: { ...DEFAULT_PLUGIN_CONFIG },
        errorCode: 'CFG_WRITE_FAILED',
      };
    }
  }

  subscribeStagePush(handler: (snapshot: StageSnapshot) => void): Disposer {
    return this.ctx.host.subscribe('onStagePush', (payload: unknown) => {
      handler(payload as StageSnapshot);
    });
  }
}
