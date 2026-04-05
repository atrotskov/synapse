import { App, Modal } from 'obsidian';
import { bootstrapAngular } from 'angular-app';
import type { SynapseSettings } from '../types';

export class SynapseModal extends Modal {
  private appRef: any = null;

  constructor(app: App, private settings: SynapseSettings) {
    super(app);
  }

  async onOpen() {
    const root = document.createElement('app-root');
    this.contentEl.appendChild(root);
    this.appRef = await bootstrapAngular(this.app, this.settings);
  }

  onClose() {
    this.appRef?.destroy();
    this.appRef = null;
  }
}
