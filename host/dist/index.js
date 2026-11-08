import { LifecycleManager } from "./lifecycleManager.js";
import { ConfigStore } from "./config/configStore.js";
import { configSchema } from "./config/schema.js";
import { createInitialSnapshot } from "./model/types.js";
import { StageDetector } from "./stage/stageDetector.js";
import { resolveProfile } from "./stage/sensitivityProfile.js";
import { SuggestionThrottler } from "./stage/suggestionThrottler.js";
import { StageCoordinator } from "./stageCoordinator.js";
import { registerToolPreExecListener } from "./listeners/toolPreExecListener.js";
import { HostLightApi } from "./hostLightApi.js";
export const inject = ['agents', 'tools'];
export async function setup(ctx) {
    const lifecycle = new LifecycleManager();
    if (!lifecycle.validateInject(ctx)) {
        return () => { };
    }
    const configStore = new ConfigStore(ctx);
    await configStore.load();
    const detector = new StageDetector(resolveProfile(configStore.read().sensitivity));
    const throttler = new SuggestionThrottler();
    let currentSnapshot = createInitialSnapshot(Date.now());
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
    const configDisposer = ctx.effect(() => {
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
//# sourceMappingURL=index.js.map