import type { PluginConfig } from './model/pluginConfig.ts';
import type { StageSnapshot } from './model/types.ts';
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
export declare class StageCoordinator {
    private readonly deps;
    constructor(deps: StageCoordinatorDeps);
    handleToolCall(exec: ToolExecutionLike, now: number): void;
    private pushSuggestion;
}
//# sourceMappingURL=stageCoordinator.d.ts.map