import type { ApiWriteResult, PluginConfig } from '../model/types.ts';
export declare class SettingsPanel {
    private el;
    private currentConfig;
    private readonly onWrite;
    constructor(onWrite: (patch: Partial<PluginConfig>) => Promise<ApiWriteResult>);
    mount(container: HTMLElement): void;
    render(config: PluginConfig): void;
    unmount(): void;
    private createToggleRow;
    private createRadioRow;
    private createSpacer;
    private write;
    private showInlineError;
}
//# sourceMappingURL=settingsPanel.d.ts.map