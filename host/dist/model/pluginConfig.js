export const DEFAULT_PLUGIN_CONFIG = {
    autoCollapse: true,
    sensitivity: 'standard',
};
export function clonePluginConfig(config) {
    return {
        autoCollapse: config.autoCollapse,
        sensitivity: config.sensitivity,
    };
}
//# sourceMappingURL=pluginConfig.js.map