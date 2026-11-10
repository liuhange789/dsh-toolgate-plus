import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { configSchema } from './config/schema.ts';
/** 只依赖 tools：阶段判定读的是工具调用事件，建议通过 agent.followup 送达。 */
export declare const inject: readonly ["tools"];
/**
 * 插件入口。
 * @param ctx Host Context
 * @param pluginConfig cordis 加载器传入的 config（配合下面的 configSchema）
 */
export declare function apply(ctx: DshHostContext, pluginConfig?: unknown): Promise<Disposer>;
/** 兼容只找 setup 的加载器；与 apply 是同一实现。 */
export declare const setup: typeof apply;
export { configSchema };
//# sourceMappingURL=index.d.ts.map