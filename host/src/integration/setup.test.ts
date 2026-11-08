import { describe, expect, it, vi } from 'vitest';
import type { Disposer, DshHostContext, PreToolDecision } from '../types/dshContext.ts';
import { setup } from '../index.ts';

interface PushedEvent {
  event: string;
  payload: unknown;
}

function makeMockCtx() {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const exposed = new Map<string, (...args: unknown[]) => unknown>();
  const pushed: PushedEvent[] = [];
  const configValues: Record<string, unknown> = {
    autoCollapse: true,
    sensitivity: 'standard',
  };

  const ctx = {
    handlers,
    exposed,
    pushed,
    on: vi.fn((event: string, handler: (...args: unknown[]) => unknown): Disposer => {
      handlers.set(event, handler);
      return () => handlers.delete(event);
    }),
    effect: vi.fn(<T>(fn: () => Disposer | Promise<Disposer>): T => fn() as unknown as T),
    inject: ['agents', 'tools'] as readonly string[],
    log: vi.fn(),
    config: {
      read: vi.fn(async () => configValues),
      write: vi.fn(async () => {}),
      subscribe: vi.fn(() => () => {}),
    },
    expose: vi.fn((name: string, handler: (...args: unknown[]) => unknown) => {
      exposed.set(name, handler);
    }),
    push: vi.fn((event: string, payload: unknown) => {
      pushed.push({ event, payload });
    }),
  };

  return ctx;
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

    const stageEvents = ctx.pushed.filter((entry) => entry.event === 'onStagePush');
    expect(stageEvents.length).toBe(3);
    expect((stageEvents[stageEvents.length - 1].payload as { stage: string }).stage).toBe('editing');
    expect((stageEvents[stageEvents.length - 1].payload as { suggestion: string | null }).suggestion).toBeNull();

    expect(next).toHaveBeenCalledTimes(12);

    const snapshotHandler = ctx.exposed.get('getStageSnapshot');
    expect(snapshotHandler).toBeDefined();
    const snapshot = (await snapshotHandler!()) as { stage: string };
    expect(snapshot.stage).toBe('editing');
  });

  it('declares the required injects and exposes the client RPC surface', async () => {
    const ctx = makeMockCtx();
    await setup(ctx as unknown as DshHostContext);

    expect(ctx.handlers.has('tools/pre-execute')).toBe(true);
    expect(ctx.exposed.has('getStageSnapshot')).toBe(true);
    expect(ctx.exposed.has('getPluginConfig')).toBe(true);
    expect(ctx.exposed.has('setPluginConfig')).toBe(true);
  });

  it('refuses to load when a required inject is missing', async () => {
    const ctx = makeMockCtx();
    ctx.inject = ['tools'] as readonly string[];
    const disposer = await setup(ctx as unknown as DshHostContext);

    expect(ctx.handlers.has('tools/pre-execute')).toBe(false);
    expect(ctx.log).toHaveBeenCalledWith(
      'error',
      'LifecycleManager: missing required inject',
      { missing: 'agents' },
    );
    disposer();
  });
});
