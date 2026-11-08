import type { ApiWriteResult, PluginConfig, Sensitivity } from '../model/types.ts';

const STYLE_FONT = 'PingFang SC, Microsoft YaHei, sans-serif';
const COLOR_PRIMARY = '#1677FF';
const COLOR_ERROR = '#FF4D4F';
const RADIUS_CARD = '8px';

const SENSITIVITY_OPTIONS: readonly { value: Sensitivity; label: string }[] = [
  { value: 'loose', label: '宽松' },
  { value: 'standard', label: '标准' },
  { value: 'aggressive', label: '激进' },
];

export class SettingsPanel {
  private el: HTMLElement | null = null;
  private currentConfig: PluginConfig | null = null;
  private readonly onWrite: (patch: Partial<PluginConfig>) => Promise<ApiWriteResult>;

  constructor(onWrite: (patch: Partial<PluginConfig>) => Promise<ApiWriteResult>) {
    this.onWrite = onWrite;
  }

  mount(container: HTMLElement): void {
    const panel = document.createElement('div');
    panel.style.fontFamily = STYLE_FONT;
    panel.style.padding = '16px';
    panel.style.borderRadius = RADIUS_CARD;
    panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    panel.style.background = '#fff';
    container.appendChild(panel);
    this.el = panel;
  }

  render(config: PluginConfig): void {
    if (!this.el) return;
    this.currentConfig = config;
    const el = this.el;
    el.innerHTML = '';

    el.appendChild(this.createToggleRow('自动收缩', config.autoCollapse, async (value) => {
      await this.write({ autoCollapse: value });
    }));
    el.appendChild(this.createSpacer(12));
    el.appendChild(this.createRadioRow('灵敏度', config.sensitivity, async (value) => {
      await this.write({ sensitivity: value });
    }));
  }

  unmount(): void {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.currentConfig = null;
  }

  private createToggleRow(
    label: string,
    checked: boolean,
    onChange: (value: boolean) => void,
  ): HTMLElement {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.fontSize = '14px';
    row.appendChild(labelEl);

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = checked;
    toggle.style.accentColor = COLOR_PRIMARY;
    toggle.style.cursor = 'pointer';
    toggle.addEventListener('change', () => {
      onChange(toggle.checked);
    });
    row.appendChild(toggle);
    return row;
  }

  private createRadioRow(
    label: string,
    value: Sensitivity,
    onChange: (value: Sensitivity) => void,
  ): HTMLElement {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.fontSize = '14px';
    row.appendChild(labelEl);

    const group = document.createElement('div');
    group.style.display = 'flex';
    group.style.gap = '8px';

    for (const option of SENSITIVITY_OPTIONS) {
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'toolgate-plus-sensitivity';
      radio.checked = option.value === value;
      radio.style.accentColor = COLOR_PRIMARY;
      radio.style.cursor = 'pointer';
      radio.addEventListener('change', () => {
        if (radio.checked) onChange(option.value);
      });

      const radioLabel = document.createElement('label');
      radioLabel.style.fontSize = '13px';
      radioLabel.style.cursor = 'pointer';
      radioLabel.style.marginRight = '4px';
      radioLabel.appendChild(radio);
      radioLabel.appendChild(document.createTextNode(option.label));
      group.appendChild(radioLabel);
    }

    row.appendChild(group);
    return row;
  }

  private createSpacer(height: number): HTMLElement {
    const spacer = document.createElement('div');
    spacer.style.height = `${height}px`;
    return spacer;
  }

  private async write(patch: Partial<PluginConfig>): Promise<void> {
    if (!this.currentConfig) return;
    const result = await this.onWrite(patch);
    if (result.errorCode) {
      this.render(this.currentConfig);
      this.showInlineError('写入失败，已回滚');
      return;
    }
    this.render(result.config);
  }

  private showInlineError(message: string): void {
    if (!this.el) return;
    const error = document.createElement('div');
    error.textContent = message;
    error.style.color = COLOR_ERROR;
    error.style.fontSize = '12px';
    error.style.marginTop = '8px';
    this.el.appendChild(error);
    setTimeout(() => {
      if (error.parentNode) error.parentNode.removeChild(error);
    }, 3000);
  }
}
