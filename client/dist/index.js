import { HostClient } from "./hostClient.js";
import { StatusStage } from "./ui/statusStage.js";
import { StageHint } from "./ui/stageHint.js";
import { SettingsPanel } from "./ui/settingsPanel.js";
export async function setup(ctx) {
    const hostClient = new HostClient(ctx);
    const statusStage = new StatusStage();
    const stageHint = new StageHint();
    const settingsPanel = new SettingsPanel(async (patch) => {
        const result = await hostClient.setPluginConfig(patch);
        if (!result.errorCode) {
            stageHint.setAutoCollapse(result.config.autoCollapse);
        }
        return result;
    });
    const statusBarContainer = document.createElement('div');
    ctx.ui.statusBar.mount(statusBarContainer);
    statusStage.mount(statusBarContainer);
    const hintContainer = document.createElement('div');
    ctx.ui.hintArea.mount(hintContainer);
    stageHint.mount(hintContainer);
    const settingsContainer = document.createElement('div');
    ctx.ui.settings.mount(settingsContainer);
    settingsPanel.mount(settingsContainer);
    const initialConfig = await hostClient.getPluginConfig();
    settingsPanel.render(initialConfig);
    stageHint.setAutoCollapse(initialConfig.autoCollapse);
    const initialSnapshot = await hostClient.getStageSnapshot();
    statusStage.render(initialSnapshot.stage);
    const stageDisposer = hostClient.subscribeStagePush((snapshot) => {
        statusStage.render(snapshot.stage);
        if (snapshot.suggestion) {
            stageHint.show(snapshot.suggestion);
        }
        else {
            stageHint.hide();
        }
    });
    return () => {
        stageDisposer();
        statusStage.unmount();
        stageHint.unmount();
        settingsPanel.unmount();
        ctx.ui.statusBar.unmount();
        ctx.ui.hintArea.unmount();
        ctx.ui.settings.unmount();
    };
}
//# sourceMappingURL=index.js.map