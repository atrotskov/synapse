import { Modal } from 'obsidian';
import { bootstrapAngular } from 'angular-app';

export class AngularModal extends Modal {
    private appRef: any = null;

    async onOpen() {
        const root = document.createElement('app-root');
        this.contentEl.appendChild(root);
        this.appRef = await bootstrapAngular(root);
    }

    onClose() {
        this.appRef?.destroy();
        this.appRef = null;
    }
}
