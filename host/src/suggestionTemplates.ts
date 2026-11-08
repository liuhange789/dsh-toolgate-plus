import type { Stage } from './model/types.ts';

export const MAX_SUGGESTION_LENGTH = 40;

export const STAGE_SUGGESTIONS: Record<Stage, string> = {
  exploration: '先读关键文件摸清结构，再决定改动点。',
  editing: '已进入编辑阶段，小步改动并随手验证。',
  debugging: '已进入调试阶段，先复现问题再最小修复。',
};

export function getStageSuggestion(stage: Stage): string {
  const text = STAGE_SUGGESTIONS[stage];
  return text.length > MAX_SUGGESTION_LENGTH
    ? `${text.slice(0, MAX_SUGGESTION_LENGTH - 1)}…`
    : text;
}
