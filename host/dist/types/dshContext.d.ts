export type Disposer = () => void;
export interface DshUserMessage {
    readonly id: string;
    readonly role: 'user';
    readonly content: ReadonlyArray<{
        readonly type: 'text';
        readonly text: string;
    }>;
    readonly source: {
        readonly kind: 'plugin';
        readonly plugin: string;
    };
}
export interface DshAgent {
    followup(message: DshUserMessage): void;
}
export interface ToolExecutionLike {
    readonly name?: string;
    readonly agent?: DshAgent;
}
export type PreToolDecision = {
    readonly kind: 'allow';
} | {
    readonly kind: 'deny';
    readonly reason?: string;
} | {
    readonly kind: 'ask';
    readonly reason?: string;
};
/** systemPrompt 片段；text 是函数时每次装配都会重新求值。 */
export interface DshPromptSection {
    name: string;
    order: number;
    text: string | ((context: {
        scope?: object;
    }) => string);
}
export interface DshSystemPromptService {
    section(section: DshPromptSection): Disposer;
}
export interface DshLogger {
    info(message: string): void;
    warn(message: string): void;
    debug?(message: string): void;
}
/**
 * 插件拿到的 Host Context —— 只声明本插件真正用到、且在 DSH 宿主里确实存在的成员。
 * 之前的 ctx.expose / ctx.push / ctx.config / ctx.inject 在 DSH 里都不存在
 * （cordis 的 Context 上没有这些属性），照着它们写会在 apply 阶段直接抛 TypeError。
 */
export interface DshEventContext {
    tools?: {
        register(definition: unknown): Disposer;
    };
    systemPrompt?: DshSystemPromptService;
    logger?: DshLogger;
    /** 老版本宿主用这个函数式日志接口。 */
    log?(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
    on(eventName: string, handler: (...args: unknown[]) => unknown): Disposer;
    effect<T>(fn: () => Disposer | Promise<Disposer>): T;
}
export type DshHostContext = DshEventContext;
export type LogFn = (level: 'debug' | 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>) => void;
/** 统一日志适配：优先 cordis logger 服务，其次老宿主 ctx.log，最后退回 console。 */
export declare function createLog(ctx: DshHostContext): LogFn;
//# sourceMappingURL=dshContext.d.ts.map