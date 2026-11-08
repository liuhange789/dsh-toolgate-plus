export type Stage = 'exploration' | 'editing' | 'debugging';

export type Sensitivity = 'loose' | 'standard' | 'aggressive';

export const STAGE_ICONS: Record<Stage, string> = {
  exploration: '🔍',
  editing: '✏️',
  debugging: '🐛',
};

export const STAGE_LABELS: Record<Stage, string> = {
  exploration: '探索',
  editing: '编辑',
  debugging: '调试',
};

export interface PluginConfig {
  autoCollapse: boolean;
  sensitivity: Sensitivity;
}

export const DEFAULT_PLUGIN_CONFIG: PluginConfig = {
  autoCollapse: true,
  sensitivity: 'standard',
};

export interface StageSnapshot {
  stage: Stage;
  icon: string;
  suggestion: string | null;
  switchedAt: number;
}

export interface ApiWriteResult {
  config: PluginConfig;
  errorCode: string | null;
}

export function createDefaultStageSnapshot(): StageSnapshot {
  return {
    stage: 'exploration',
    icon: STAGE_ICONS.exploration,
    suggestion: null,
    switchedAt: 0,
  };
}
