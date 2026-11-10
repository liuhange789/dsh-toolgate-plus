/** 本插件只硬依赖 tools；agent 由工具调用负载带过来，不需要作为服务注入。 */
const REQUIRED_INJECTS = ['tools'];
export class LifecycleManager {
    disposers = [];
    log;
    loaded = false;
    constructor(log = () => { }) {
        this.log = log;
    }
    /**
     * 判断宿主是否真的提供了所需服务。
     * 原实现读 ctx.inject（cordis Context 上并没有这个属性），在真实宿主里会直接抛错。
     */
    validateInject(ctx) {
        for (const required of REQUIRED_INJECTS) {
            const service = ctx[required];
            if (service === undefined || service === null) {
                this.log('error', 'LifecycleManager: missing required service', { missing: required });
                return false;
            }
        }
        return true;
    }
    registerDisposer(fn) {
        this.disposers.push(fn);
    }
    markLoaded() {
        this.loaded = true;
    }
    isLoaded() {
        return this.loaded;
    }
    disposeAll() {
        while (this.disposers.length > 0) {
            const disposer = this.disposers.pop();
            if (disposer) {
                try {
                    disposer();
                }
                catch {
                    // Disposer failures must not block the remaining teardown.
                }
            }
        }
        this.loaded = false;
    }
}
//# sourceMappingURL=lifecycleManager.js.map