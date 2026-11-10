import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { createLog } from './types/dshContext.ts';
import { LifecycleManager } from './lifecycleManager.ts';
import { ConfigStore } from './config/configStore.ts';
import { configSchema } from './config/schema.ts';
import { StageDetector } from './stage/stageDetector.ts';
import { resolveProfile } from './stage/sensitivityProfile.ts';
import { SuggestionThrottler } from './stage/suggestionThrottler.ts';
import { StageCoordinator } from './stageCoordinator.ts';
import { registerToolPreExecListener } from './listeners/toolPreExecListener.ts';

/** 只依赖 tools：阶段判定读的是工具调用事件，建议通过 agent.followup 送达。 */
export const inject = ['tools'] as const;

/**
 * 插件入口。
 * @param ctx Host Context
 * @param pluginConfig cordis 加载器传入的 config（配合下面的 configSchema）
 */
export async function apply(ctx: DshHostContext, pluginConfig?: unknown): Promise<Disposer> {
  const log = createLog(ctx);
  const lifecycle = new LifecycleManager(log);
  if (!lifecycle.validateInject(ctx)) {
    return () => {};
  }

  const configStore = new ConfigStore(
    typeof pluginConfig === 'object' && pluginConfig !== null
      ? (pluginConfig as Record<string, unknown>)
      : {},
    log,
  );
  await configStore.load();

  const detector = new StageDetector(resolveProfile(configStore.read().sensitivity));
  const throttler = new SuggestionThrottler();
  const coordinator = new StageCoordinator({
    ctx,
    detector,
    throttler,
    getConfig: () => configStore.read(),
    onSnapshot: (snapshot) => {
      // 原来这里把快照 push 给浏览器侧状态灯；DSH 没有这条通道，改为落日志，
      // 用户可见的一行建议仍由 StageCoordinator 通过 agent.followup 送达。
      log('info', 'toolgate-plus: stage switched', {
        stage: snapshot.stage,
        icon: snapshot.icon,
        suggestion: snapshot.suggestion ?? '',
      });
    },
  });

  const toolDisposer = registerToolPreExecListener(ctx, coordinator);

  const configDisposer = ctx.effect<Disposer>(() => {
    return configStore.subscribe((nextConfig) => {
      detector.setThresholds(resolveProfile(nextConfig.sensitivity));
    });
  });

  lifecycle.registerDisposer(toolDisposer);
  lifecycle.registerDisposer(configDisposer);
  lifecycle.markLoaded();

  log('info', `toolgate-plus: active (sensitivity=${configStore.read().sensitivity})`);

  return () => {
    lifecycle.disposeAll();
    throttler.reset();
    detector.reset();
  };
}

/** 兼容只找 setup 的加载器；与 apply 是同一实现。 */
export const setup = apply;

export { configSchema };
