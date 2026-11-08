import { createInitialSnapshot } from "./model/types.js";
export class HostLightApi {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async getStageSnapshot() {
        if (!this.deps.lifecycle.isLoaded()) {
            return createInitialSnapshot(Date.now());
        }
        return this.deps.getSnapshot();
    }
    async getPluginConfig() {
        return this.deps.configStore.read();
    }
    async setPluginConfig(patch) {
        const result = await this.deps.configStore.write(patch);
        return { config: result.config, errorCode: result.errorCode };
    }
    pushStageSnapshot(snapshot) {
        if (!this.deps.lifecycle.isLoaded())
            return;
        try {
            this.deps.ctx.push('onStagePush', snapshot);
        }
        catch {
            this.deps.ctx.log('warn', 'HostLightApi: pushStageSnapshot failed');
        }
    }
    register() {
        this.deps.ctx.expose('getStageSnapshot', () => this.getStageSnapshot());
        this.deps.ctx.expose('getPluginConfig', () => this.getPluginConfig());
        this.deps.ctx.expose('setPluginConfig', (...args) => this.setPluginConfig(args[0]));
    }
}
//# sourceMappingURL=hostLightApi.js.map