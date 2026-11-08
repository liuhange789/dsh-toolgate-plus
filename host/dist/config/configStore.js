import { DEFAULT_PLUGIN_CONFIG, clonePluginConfig } from "../model/pluginConfig.js";
import { isSensitivity } from "../model/types.js";
export const ERR_CFG_WRITE_FAILED = 'CFG_WRITE_FAILED';
export const ERR_INVALID_SENSITIVITY = 'INVALID_SENSITIVITY';
export class ConfigStore {
    current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
    ctx;
    constructor(ctx = null) {
        this.ctx = ctx;
    }
    read() {
        return clonePluginConfig(this.current);
    }
    async load() {
        if (!this.ctx) {
            return this.read();
        }
        try {
            const raw = await this.ctx.config.read();
            if (!raw) {
                this.current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
                return this.read();
            }
            this.current = this.normalize(raw);
            return this.read();
        }
        catch {
            this.ctx.log('warn', 'ConfigStore: config read failed, using defaults');
            this.current = clonePluginConfig(DEFAULT_PLUGIN_CONFIG);
            return this.read();
        }
    }
    async write(patch) {
        if (patch.sensitivity !== undefined && !isSensitivity(patch.sensitivity)) {
            return { config: this.read(), errorCode: ERR_INVALID_SENSITIVITY };
        }
        const next = {
            autoCollapse: patch.autoCollapse ?? this.current.autoCollapse,
            sensitivity: (patch.sensitivity ?? this.current.sensitivity),
        };
        if (!this.ctx) {
            this.current = next;
            return { config: this.read(), errorCode: null };
        }
        try {
            await this.ctx.config.write(next);
            this.current = next;
            return { config: this.read(), errorCode: null };
        }
        catch {
            this.ctx.log('warn', 'ConfigStore: config write failed', { code: ERR_CFG_WRITE_FAILED });
            return { config: this.read(), errorCode: ERR_CFG_WRITE_FAILED };
        }
    }
    subscribe(handler) {
        if (!this.ctx) {
            return () => { };
        }
        return this.ctx.config.subscribe((raw) => {
            this.current = this.normalize(raw);
            handler(this.read());
        });
    }
    normalize(raw) {
        const autoCollapse = typeof raw.autoCollapse === 'boolean'
            ? raw.autoCollapse
            : DEFAULT_PLUGIN_CONFIG.autoCollapse;
        const sensitivity = isSensitivity(raw.sensitivity)
            ? raw.sensitivity
            : DEFAULT_PLUGIN_CONFIG.sensitivity;
        if (raw.sensitivity !== undefined && !isSensitivity(raw.sensitivity)) {
            this.ctx?.log('warn', 'ConfigStore: invalid sensitivity, falling back to standard', {
                received: raw.sensitivity,
            });
        }
        return { autoCollapse, sensitivity };
    }
}
//# sourceMappingURL=configStore.js.map