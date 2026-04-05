import { Plugin } from 'obsidian';
import { SynapseModal } from './views/synapse-modal';
import { SynapseSettingTab } from './settings';
import { SynapseSettings, DEFAULT_SETTINGS, Rating } from './types';
import { VocabularyStore } from './storage/vocabulary-store';
import { review as fsrsReview, getPreviewIntervals } from './scheduler/fsrs-scheduler';
import type { FSRSData } from './types';

export default class Synapse extends Plugin {
  settings!: SynapseSettings;
  private synapseModal: SynapseModal | null = null;
  private vocabularyStore!: VocabularyStore;

  async onload() {
    console.log('Synapse: Loading plugin...');

    await this.loadSettings();

    this.vocabularyStore = new VocabularyStore(this.app, this.settings);

    this.addSettingTab(new SynapseSettingTab(this.app, this as any));

    this.addRibbonIcon('graduation-cap', 'Synapse', () => {
      this.openModal();
    });

    this.addCommand({
      id: 'review-due-cards',
      name: 'Review Due Cards',
      callback: async () => {
        await this.openModalWithMode('flash-card');
      },
    });

    this.addCommand({
      id: 'start-matching-game',
      name: 'Start Matching Game',
      callback: async () => {
        await this.openModalWithMode('pair-mode');
      },
    });

    this.addCommand({
      id: 'view-statistics',
      name: 'View Statistics',
      callback: async () => {
        await this.openModalWithMode('statistic');
      },
    });

    this.addCommand({
      id: 'open-vocabulary-file',
      name: 'Open Vocabulary File',
      callback: async () => {
        await this.openVocabularyFile();
      },
    });

    console.log('Synapse: Plugin loaded!');
  }

  onunload() {
    if (this.synapseModal) {
      this.synapseModal.close();
    }
    console.log('Synapse: Plugin unloaded');
  }

  private async openModalWithMode(mode: 'flash-card' | 'pair-mode' | 'statistic' | 'menu'): Promise<void> {
    if (!this.synapseModal) {
      this.synapseModal = new SynapseModal(this.app, this.settings, (fsrs) => this.getIntervalHints(fsrs));
    } else {
      this.synapseModal.updateSettings(this.settings);
    }

    this.synapseModal.open();

    if (mode !== 'menu' && (window as any).SynapseState) {
      (window as any).SynapseState.targetPage = mode;
    }
  }

  private openModal(): void {
    this.openModalWithMode('menu');
  }

  private async openVocabularyFile(): Promise<void> {
    const file = await this.vocabularyStore.getVocabularyFile();
    if (file) {
      const leaf = this.app.workspace.getLeaf('tab');
      await leaf.openFile(file);
    } else {
      console.log('No vocabulary file configured');
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getIntervalHints(fsrs: FSRSData | undefined): Record<number, number> {
    return getPreviewIntervals(fsrs);
  }

  async handleReview(entry: any, rating: Rating): Promise<void> {
    if (!entry.fsrs) {
      entry.fsrs = {
        nextReview: new Date().toISOString().split('T')[0],
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        repetitions: 0,
        lapses: 0,
      };
    }

    const result = fsrsReview(
      {
        nextReview: entry.fsrs.nextReview,
        stability: entry.fsrs.stability,
        difficulty: entry.fsrs.difficulty,
        elapsedDays: entry.fsrs.elapsedDays,
        repetitions: entry.fsrs.repetitions,
        lapses: entry.fsrs.lapses,
      },
      rating
    );

    await this.vocabularyStore.updateEntryFSRS(entry, result);
  }
}
