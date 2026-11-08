import { DEFAULT_PLUGIN_CONFIG, createDefaultStageSnapshot, } from "./model/types.js";
export class HostClient {
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
    }
    async getStageSnapshot() {
        try {
            return (await this.ctx.host.call('getStageSnapshot'));
        }
        catch {
            return createDefaultStageSnapshot();
        }
    }
    async getPluginConfig() {
        try {
            return (await this.ctx.host.call('getPluginConfig'));
        }
        catch {
            return { ...DEFAULT_PLUGIN_CONFIG };
        }
    }
    async setPluginConfig(patch) {
        try {
            return (await this.ctx.host.call('setPluginConfig', patch));
        }
        catch {
            return {
                config: { ...DEFAULT_PLUGIN_CONFIG },
                errorCode: 'CFG_WRITE_FAILED',
            };
        }
    }
    subscribeStagePush(handler) {
        return this.ctx.host.subscribe('onStagePush', (payload) => {
            handler(payload);
        });
    }
}
//# sourceMappingURL=hostClient.js.map