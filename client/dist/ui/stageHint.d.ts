export declare const HINT_AUTO_HIDE_MS = 10000;
export declare class StageHint {
    private el;
    private timer;
    private autoCollapse;
    mount(container: HTMLElement): void;
    setAutoCollapse(value: boolean): void;
    show(text: string): void;
    hide(): void;
    unmount(): void;
    private clearTimer;
}
//# sourceMappingURL=stageHint.d.ts.map