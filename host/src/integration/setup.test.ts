import { describe, expect, it, vi } from 'vitest';
import type { Disposer, DshHostContext, PreToolDecision } from '../types/dshContext.ts';
import { inject, setup } from '../index.ts';

interface LoggedStage {
  stage: string;
  suggestion: string;
}

function makeMockCtx(options: { withTools?: boolean } = {}) {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const stageLogs: LoggedStage[] = [];

  const log = vi.fn((level: string, message: string, fields?: Record<string, unknown>) => {
    if (message === 'toolgate-plus: stage switched' && fields) {
      stageLogs.push(fields as unknown as LoggedStage);
    }
  });

  const ctx: Record<string, unknown> = {
    handlers,
    stageLogs,
    log,
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown): Disposer => {
      handlers.set(event, handler);
      return () => handlers.delete(event);
    }),
    effect: vi.fn(<T>(fn: () => Disposer | Promise<Disposer>): T => fn() as unknown as T),
  };
  if (options.withTools !== false) {
    ctx.tools = { register: vi.fn(() => () => {}) };
  }

  return ctx as typeof ctx & { stageLogs: LoggedStage[]; log: ReturnType<typeof vi.fn> };
}

function exec(name: string, followup: (message: unknown) => void) {
  return { name, agent: { followup } };
}

describe('dsh-toolgate-plus host setup', () => {
  it('observes tool calls, delegates to next(), and throttles repeated stage suggestions', async () => {
    const ctx = makeMockCtx();
    await setup(ctx as unknown as DshHostContext);

    const handler = ctx.handlers.get('tools/pre-execute');
    expect(handler).toBeDefined();

    const followup = vi.fn();
    const next = vi.fn(async (): Promise<PreToolDecision> => ({ kind: 'allow' }));

    const call = async (name: string): Promise<unknown> => {
      const result = await handler!(exec(name, followup), next);
      return result;
    };

    await call('read_file');
    expect(followup).toHaveBeenCalledTimes(0);

    // First entry into editing emits one suggestion.
    await call('write_file');
    await call('edit_file');
    await call('apply_patch');
    expect(followup).toHaveBeenCalledTimes(1);
    const firstMessage = followup.mock.calls[0][0] as {
      role: string;
      source: { kind: string; plugin: string };
      content: { type: string; text: string }[];
    };
    expect(firstMessage.role).toBe('user');
    expect(firstMessage.source).toEqual({ kind: 'plugin', plugin: 'dsh-toolgate-plus' });
    expect(firstMessage.content[0].text).toContain('编辑');

    // Drain the window back to exploration; that stage also emits once.
    for (let i = 0; i < 5; i += 1) {
      await call('read_file');
    }
    expect(followup).toHaveBeenCalledTimes(2);

    // Re-enter editing immediately: status changes, but the suggestion is throttled.
    await call('write_file');
    await call('write_file');
    await call('write_file');
    expect(followup).toHaveBeenCalledTimes(2);

    // 状态快照不再 push 给浏览器，改为日志记录；阶段切换仍然是 3 次。
    expect(ctx.stageLogs.length).toBe(3);
    expect(ctx.stageLogs[ctx.stageLogs.length - 1].stage).toBe('editing');
    expect(ctx.stageLogs[ctx.stageLogs.length - 1].suggestion).toBe('');

    expect(next).toHaveBeenCalledTimes(12);
  });

  it('declares only the tools inject and hooks tools/pre-execute', async () => {
    const ctx = makeMockCtx();
    await setup(ctx as unknown as DshHostContext);

    expect([...inject]).toEqual(['tools']);
    expect(ctx.handlers.has('tools/pre-execute')).toBe(true);
  });

  it('refuses to load when the tools service is missing', async () => {
    const ctx = makeMockCtx({ withTools: false });
    const disposer = await setup(ctx as unknown as DshHostContext);

    expect(ctx.handlers.has('tools/pre-execute')).toBe(false);
    expect(ctx.log).toHaveBeenCalledWith('error', 'LifecycleManager: missing required service', {
      missing: 'tools',
    });
    disposer();
  });
});
