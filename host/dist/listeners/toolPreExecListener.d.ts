import type { Disposer, DshHostContext } from '../types/dshContext.ts';
import type { StageCoordinator } from '../stageCoordinator.ts';
/**
 * `tools/pre-execute` is an around-middleware: it must always hand control to
 * `next()` so the gate never changes tool admission decisions. The plugin only
 * observes the call name and delegates.
 */
export declare function registerToolPreExecListener(ctx: DshHostContext, coordinator: StageCoordinator): Disposer;
//# sourceMappingURL=toolPreExecListener.d.ts.map