import type {
  Disposer,
  DshHostContext,
  PreToolDecision,
  ToolExecutionLike,
} from '../types/dshContext.ts';
import { createLog } from '../types/dshContext.ts';
import type { StageCoordinator } from '../stageCoordinator.ts';

type PreExecuteNext = () => Promise<PreToolDecision>;

/**
 * `tools/pre-execute` is an around-middleware: it must always hand control to
 * `next()` so the gate never changes tool admission decisions. The plugin only
 * observes the call name and delegates.
 */
export function registerToolPreExecListener(
  ctx: DshHostContext,
  coordinator: StageCoordinator,
): Disposer {
  const log = createLog(ctx);
  const handler = (exec: ToolExecutionLike, next: PreExecuteNext): Promise<PreToolDecision> => {
    try {
      coordinator.handleToolCall(exec, Date.now());
    } catch {
      log('warn', 'toolPreExecListener: stage update failed');
    }
    return next();
  };

  return ctx.on('tools/pre-execute', handler as (...args: unknown[]) => unknown);
}
