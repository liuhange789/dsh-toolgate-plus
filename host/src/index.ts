import type { DshHostContext, Disposer } from './types/dshContext.ts';
import { LifecycleManager } from './lifecycleManager.ts';
import { ConfigStore } from './config/configStore.ts';
import { configSchema } from './config/schema.ts';
import { createInitialSnapshot, type StageSnapshot } from './model/types.ts';
import { StageDetector } from './stage/stageDetector.ts';
import { resolveProfile } from './stage/sensitivityProfile.ts';
import { SuggestionThrottler } from './stage/suggestionThrottler.ts';
import { StageCoordinator } from './stageCoordinator.ts';
import { registerToolPreExecListener } from './listeners/toolPreExecListener.ts';
import { HostLightApi } from './hostLightApi.ts';

export const inject = ['agents', 'tools'] as const;

export async function setup(ctx: DshHostContext): Promise<Disposer> {
  const lifecycle = new LifecycleManager();
  if (!lifecycle.validateInject(ctx)) {
    return () => {};
  }

  const configStore = new ConfigStore(ctx);
  await configStore.load();

  const detector = new StageDetector(resolveProfile(configStore.read().sensitivity));
  const throttler = new SuggestionThrottler();
  let currentSnapshot: StageSnapshot = createInitialSnapshot(Date.now());

  const api = new HostLightApi({
    ctx,
    configStore,
    lifecycle,
    getSnapshot: () => currentSnapshot,
  });
  api.register();

  const coordinator = new StageCoordinator({
    ctx,
    detector,
    throttler,
    getConfig: () => configStore.read(),
    onSnapshot: (snapshot) => {
      currentSnapshot = snapshot;
      api.pushStageSnapshot(snapshot);
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

  return () => {
    lifecycle.disposeAll();
    throttler.reset();
    detector.reset();
    currentSnapshot = createInitialSnapshot(Date.now());
  };
}

export { configSchema };
