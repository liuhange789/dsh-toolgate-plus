export type Stage = 'exploration' | 'editing' | 'debugging';
export type Sensitivity = 'loose' | 'standard' | 'aggressive';
export declare const STAGES: readonly Stage[];
export declare const STAGE_ICONS: Record<Stage, string>;
export declare const VALID_SENSITIVITIES: readonly Sensitivity[];
export declare function isSensitivity(value: unknown): value is Sensitivity;
export declare function isStage(value: unknown): value is Stage;
export interface StageSnapshot {
    readonly stage: Stage;
    readonly icon: string;
    readonly suggestion: string | null;
    readonly switchedAt: number;
}
export declare function createInitialSnapshot(now: number): StageSnapshot;
//# sourceMappingURL=types.d.ts.map