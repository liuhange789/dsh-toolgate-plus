import type { PluginConfig } from './model/pluginConfig.ts';
import type { StageSnapshot } from './model/types.ts';
import { STAGE_ICONS } from './model/types.ts';
import { getStageSuggestion } from './suggestionTemplates.ts';
import { createSuggestionMessage } from './suggestionMessage.ts';
import type { DshHostContext, ToolExecutionLike } from './types/dshContext.ts';
import type { StageDetector } from './stage/stageDetector.ts';
import type { SuggestionThrottler } from './stage/suggestionThrottler.ts';

export interface StageCoordinatorDeps {
  ctx: DshHostContext;
  detector: StageDetector;
  throttler: SuggestionThrottler;
  getConfig: () => PluginConfig;
  onSnapshot: (snapshot: StageSnapshot) => void;
}

export class StageCoordinator {
  private readonly deps: StageCoordinatorDeps;

  constructor(deps: StageCoordinatorDeps) {
    this.deps = deps;
  }

  handleToolCall(exec: ToolExecutionLike, now: number): void {
    const toolName = typeof exec.name === 'string' ? exec.name : '';
    if (toolName.length === 0) {
      this.deps.ctx.log('warn', 'StageCoordinator: tool name missing');
      return;
    }

    const decision = this.deps.detector.record(toolName);
    if (!decision.switched) return;

    const suggestion = this.deps.throttler.shouldEmit(decision.stage, now)
      ? getStageSuggestion(decision.stage)
      : null;

    const snapshot: StageSnapshot = {
      stage: decision.stage,
      icon: STAGE_ICONS[decision.stage],
      suggestion,
      switchedAt: now,
    };
    this.deps.onSnapshot(snapshot);

    if (suggestion === null) return;
    this.pushSuggestion(exec, suggestion);
  }

  private pushSuggestion(exec: ToolExecutionLike, suggestion: string): void {
    const agent = exec.agent;
    if (!agent || typeof agent.followup !== 'function') {
      this.deps.ctx.log('warn', 'StageCoordinator: agent unavailable, suggestion not queued');
      return;
    }
    try {
      agent.followup(createSuggestionMessage(suggestion));
    } catch {
      this.deps.ctx.log('warn', 'StageCoordinator: agent.followup failed');
    }
  }
}
