import type { Sensitivity } from './types.ts';

export interface PluginConfig {
  autoCollapse: boolean;
  sensitivity: Sensitivity;
}

export const DEFAULT_PLUGIN_CONFIG: PluginConfig = {
  autoCollapse: true,
  sensitivity: 'standard',
};

export function clonePluginConfig(config: PluginConfig): PluginConfig {
  return {
    autoCollapse: config.autoCollapse,
    sensitivity: config.sensitivity,
  };
}
