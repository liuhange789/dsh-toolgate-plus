import { STAGE_ICONS } from "./model/types.js";
import { getStageSuggestion } from "./suggestionTemplates.js";
import { createSuggestionMessage } from "./suggestionMessage.js";
export class StageCoordinator {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    handleToolCall(exec, now) {
        const toolName = typeof exec.name === 'string' ? exec.name : '';
        if (toolName.length === 0) {
            this.deps.ctx.log('warn', 'StageCoordinator: tool name missing');
            return;
        }
        const decision = this.deps.detector.record(toolName);
        if (!decision.switched)
            return;
        const suggestion = this.deps.throttler.shouldEmit(decision.stage, now)
            ? getStageSuggestion(decision.stage)
            : null;
        const snapshot = {
            stage: decision.stage,
            icon: STAGE_ICONS[decision.stage],
            suggestion,
            switchedAt: now,
        };
        this.deps.onSnapshot(snapshot);
        if (suggestion === null)
            return;
        this.pushSuggestion(exec, suggestion);
    }
    pushSuggestion(exec, suggestion) {
        const agent = exec.agent;
        if (!agent || typeof agent.followup !== 'function') {
            this.deps.ctx.log('warn', 'StageCoordinator: agent unavailable, suggestion not queued');
            return;
        }
        try {
            agent.followup(createSuggestionMessage(suggestion));
        }
        catch {
            this.deps.ctx.log('warn', 'StageCoordinator: agent.followup failed');
        }
    }
}
//# sourceMappingURL=stageCoordinator.js.map