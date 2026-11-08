export const STAGES = ['exploration', 'editing', 'debugging'];
export const STAGE_ICONS = {
    exploration: '🔍',
    editing: '✏️',
    debugging: '🐛',
};
export const VALID_SENSITIVITIES = [
    'loose',
    'standard',
    'aggressive',
];
export function isSensitivity(value) {
    return (typeof value === 'string' &&
        VALID_SENSITIVITIES.includes(value));
}
export function isStage(value) {
    return typeof value === 'string' && STAGES.includes(value);
}
export function createInitialSnapshot(now) {
    return {
        stage: 'exploration',
        icon: STAGE_ICONS.exploration,
        suggestion: null,
        switchedAt: now,
    };
}
//# sourceMappingURL=types.js.map