export type Disposer = () => void;

export interface DshUserMessage {
  readonly id: string;
  readonly role: 'user';
  readonly content: ReadonlyArray<{ readonly type: 'text'; readonly text: string }>;
  readonly source: { readonly kind: 'plugin'; readonly plugin: string };
}

export interface DshAgent {
  followup(message: DshUserMessage): void;
}

export interface ToolExecutionLike {
  readonly name?: string;
  readonly agent?: DshAgent;
}

export type PreToolDecision =
  | { readonly kind: 'allow' }
  | { readonly kind: 'deny'; readonly reason?: string }
  | { readonly kind: 'ask'; readonly reason?: string };

export interface DshEventContext {
  on(eventName: string, handler: (...args: unknown[]) => unknown): Disposer;
  effect<T>(fn: () => Disposer | Promise<Disposer>): T;
  inject: readonly string[];
  log(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
  config: {
    read(): Promise<Record<string, unknown> | null>;
    write(patch: Record<string, unknown>): Promise<void>;
    subscribe(handler: (config: Record<string, unknown>) => void): Disposer;
  };
  expose(name: string, handler: (...args: unknown[]) => unknown): void;
  push(event: string, payload: unknown): void;
}

export type DshHostContext = DshEventContext;

export interface DshClientContext {
  host: {
    call(method: string, ...args: unknown[]): Promise<unknown>;
    subscribe(event: string, handler: (payload: unknown) => void): Disposer;
  };
  ui: {
    statusBar: {
      mount(element: HTMLElement): void;
      unmount(): void;
    };
    hintArea: {
      mount(element: HTMLElement): void;
      unmount(): void;
    };
    settings: {
      mount(element: HTMLElement): void;
      unmount(): void;
    };
  };
  log(level: 'info' | 'warn' | 'error', message: string, fields?: Record<string, unknown>): void;
}
