export type Stage = 'exploration' | 'editing' | 'debugging';
export type Sensitivity = 'loose' | 'standard' | 'aggressive';
export declare const STAGE_ICONS: Record<Stage, string>;
export declare const STAGE_LABELS: Record<Stage, string>;
export interface PluginConfig {
    autoCollapse: boolean;
    sensitivity: Sensitivity;
}
export declare const DEFAULT_PLUGIN_CONFIG: PluginConfig;
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
export declare function createDefaultStageSnapshot(): StageSnapshot;
//# sourceMappingURL=types.d.ts.map