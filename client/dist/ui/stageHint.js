export const HINT_AUTO_HIDE_MS = 10_000;
export class StageHint {
    el = null;
    timer = null;
    autoCollapse = true;
    mount(container) {
        const el = document.createElement('div');
        el.style.fontSize = '12px';
        el.style.lineHeight = '18px';
        el.style.color = '#595959';
        el.style.background = '#F6F8FA';
        el.style.borderRadius = '6px';
        el.style.padding = '4px 8px';
        el.style.marginBottom = '4px';
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';
        el.style.textOverflow = 'ellipsis';
        el.style.display = 'none';
        container.appendChild(el);
        this.el = el;
    }
    setAutoCollapse(value) {
        this.autoCollapse = value;
    }
    show(text) {
        if (!this.el)
            return;
        this.clearTimer();
        this.el.textContent = text;
        this.el.style.display = 'block';
        this.el.title = text;
        if (this.autoCollapse) {
            this.timer = setTimeout(() => {
                this.timer = null;
                this.hide();
            }, HINT_AUTO_HIDE_MS);
        }
    }
    hide() {
        this.clearTimer();
        if (!this.el)
            return;
        this.el.style.display = 'none';
        this.el.textContent = '';
        this.el.removeAttribute('title');
    }
    unmount() {
        this.clearTimer();
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.el = null;
    }
    clearTimer() {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
//# sourceMappingURL=stageHint.js.map