import { STAGE_ICONS, STAGE_LABELS } from "../model/types.js";
export class StatusStage {
    el = null;
    lastStage = null;
    mount(container) {
        const el = document.createElement('span');
        el.style.display = 'inline-flex';
        el.style.alignItems = 'center';
        el.style.fontSize = '14px';
        el.style.marginRight = '6px';
        el.style.flexShrink = '0';
        el.style.userSelect = 'none';
        container.appendChild(el);
        this.el = el;
    }
    render(stage) {
        if (!this.el)
            return;
        if (stage === this.lastStage)
            return;
        this.lastStage = stage;
        this.el.textContent = STAGE_ICONS[stage];
        this.el.title = `当前阶段：${STAGE_LABELS[stage]}`;
        this.el.setAttribute('aria-label', `当前阶段：${STAGE_LABELS[stage]}`);
    }
    unmount() {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el = null;
        this.lastStage = null;
    }
}
//# sourceMappingURL=statusStage.js.map