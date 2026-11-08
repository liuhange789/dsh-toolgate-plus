const REQUIRED_INJECTS = ['agents', 'tools'];
export class LifecycleManager {
    disposers = [];
    loaded = false;
    validateInject(ctx) {
        for (const required of REQUIRED_INJECTS) {
            if (!ctx.inject.includes(required)) {
                ctx.log('error', 'LifecycleManager: missing required inject', { missing: required });
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