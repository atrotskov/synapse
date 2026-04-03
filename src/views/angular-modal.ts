import { Modal } from 'obsidian';
import { angularBundle } from 'angular-ui-bundle';

export class AngularModal extends Modal {
    private scriptInjected = false;

    constructor(app: any) {
        super(app);
    }

    onOpen() {
        this.contentEl.createEl('app-root');
        this.injectAngularBundle();
    }

    private injectAngularBundle(): void {
        if (this.scriptInjected) return;
        const script = document.createElement('script');
        script.textContent = angularBundle;
        document.head.appendChild(script);
        this.scriptInjected = true;
    }

    onClose() {
        this.contentEl.querySelector('app-root')?.remove();
    }
}
