import { createLog } from "../types/dshContext.js";
/**
 * `tools/pre-execute` is an around-middleware: it must always hand control to
 * `next()` so the gate never changes tool admission decisions. The plugin only
 * observes the call name and delegates.
 */
export function registerToolPreExecListener(ctx, coordinator) {
    const log = createLog(ctx);
    const handler = (exec, next) => {
        try {
            coordinator.handleToolCall(exec, Date.now());
        }
        catch {
            log('warn', 'toolPreExecListener: stage update failed');
        }
        return next();
    };
    return ctx.on('tools/pre-execute', handler);
}
//# sourceMappingURL=toolPreExecListener.js.map