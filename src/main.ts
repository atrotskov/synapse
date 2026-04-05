import { Plugin, TFile } from 'obsidian';
import { SynapseModal } from './views/synapse-modal';
import { SynapseSettingTab } from './settings';
import { SynapseSettings, DEFAULT_SETTINGS } from './types';

export default class Synapse extends Plugin {
  settings!: SynapseSettings;
  private synapseModal: SynapseModal | null = null;

  async onload() {
    console.log('Synapse: Loading plugin...');

    await this.loadSettings();

    this.addSettingTab(new SynapseSettingTab(this.app, this as any));

    this.addRibbonIcon('graduation-cap', 'Synapse', () => {
      this.openModal();
    });

    this.addCommand({
      id: 'review-due-cards',
      name: 'Review Due Cards',
      callback: () => this.openModalWithMode('flash-card'),
    });

    this.addCommand({
      id: 'start-matching-game',
      name: 'Start Matching Game',
      callback: () => this.openModalWithMode('pair-mode'),
    });

    this.addCommand({
      id: 'view-statistics',
      name: 'View Statistics',
      callback: () => this.openModalWithMode('statistic'),
    });

    this.addCommand({
      id: 'open-vocabulary-file',
      name: 'Open Vocabulary File',
      callback: () => this.openVocabularyFile(),
    });

    console.log('Synapse: Plugin loaded!');
  }

  onunload() {
    if (this.synapseModal) {
      this.synapseModal.close();
    }
    console.log('Synapse: Plugin unloaded');
  }

  private openModalWithMode(mode: 'flash-card' | 'pair-mode' | 'statistic' | 'menu'): void {
    if (!this.synapseModal) {
      this.synapseModal = new SynapseModal(this.app, this.settings);
    }
    this.synapseModal.open();
  }

  private openModal(): void {
    this.openModalWithMode('menu');
  }

  private async openVocabularyFile(): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(this.settings.vocabularyFile);
    if (file instanceof TFile) {
      await this.app.workspace.getLeaf('tab').openFile(file);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
