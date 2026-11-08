export const HINT_AUTO_HIDE_MS = 10_000;

export class StageHint {
  private el: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private autoCollapse = true;

  mount(container: HTMLElement): void {
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

  setAutoCollapse(value: boolean): void {
    this.autoCollapse = value;
  }

  show(text: string): void {
    if (!this.el) return;
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

  hide(): void {
    this.clearTimer();
    if (!this.el) return;
    this.el.style.display = 'none';
    this.el.textContent = '';
    this.el.removeAttribute('title');
  }

  unmount(): void {
    this.clearTimer();
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
