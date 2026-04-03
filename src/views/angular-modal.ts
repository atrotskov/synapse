import { Modal } from 'obsidian';
import { angularBundle } from 'angular-ui-bundle';

export class AngularModal extends Modal {
  private angularInitialized: boolean = false;

  constructor(app: any) {
    super(app);
  }

  async onOpen() {
    const container = this.contentEl;
    
    const root = document.createElement('app-root');
    container.appendChild(root);

    if (!this.angularInitialized) {
      this.injectAngularBundle();
      this.angularInitialized = true;
    }
  }

  private injectAngularBundle(): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = angularBundle;
    document.head.appendChild(script);
  }

  onClose() {
    const appRoot = this.contentEl.querySelector('app-root');
    if (appRoot) {
      appRoot.remove();
    }
  }
}