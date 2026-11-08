export const STAGE_ICONS = {
    exploration: '🔍',
    editing: '✏️',
    debugging: '🐛',
};
export const STAGE_LABELS = {
    exploration: '探索',
    editing: '编辑',
    debugging: '调试',
};
export const DEFAULT_PLUGIN_CONFIG = {
    autoCollapse: true,
    sensitivity: 'standard',
};
export function createDefaultStageSnapshot() {
    return {
        stage: 'exploration',
        icon: STAGE_ICONS.exploration,
        suggestion: null,
        switchedAt: 0,
    };
}
//# sourceMappingURL=types.js.map