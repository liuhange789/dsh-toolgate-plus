export type Stage = 'exploration' | 'editing' | 'debugging';

export type Sensitivity = 'loose' | 'standard' | 'aggressive';

export const STAGES: readonly Stage[] = ['exploration', 'editing', 'debugging'] as const;

export const STAGE_ICONS: Record<Stage, string> = {
  exploration: '🔍',
  editing: '✏️',
  debugging: '🐛',
};

export const VALID_SENSITIVITIES: readonly Sensitivity[] = [
  'loose',
  'standard',
  'aggressive',
] as const;

export function isSensitivity(value: unknown): value is Sensitivity {
  return (
    typeof value === 'string' &&
    (VALID_SENSITIVITIES as readonly string[]).includes(value)
  );
}

export function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGES as readonly string[]).includes(value);
}

export interface StageSnapshot {
  readonly stage: Stage;
  readonly icon: string;
  readonly suggestion: string | null;
  readonly switchedAt: number;
}

export function createInitialSnapshot(now: number): StageSnapshot {
  return {
    stage: 'exploration',
    icon: STAGE_ICONS.exploration,
    suggestion: null,
    switchedAt: now,
  };
}
