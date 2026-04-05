import { Modal } from 'obsidian';
import { bootstrapAngular } from 'angular-app';
import { VocabularyStore } from '../storage/vocabulary-store';
import { SynapseSettings, FSRSData } from '../types';

export class SynapseModal extends Modal {
  private appRef: any = null;
  private vocabularyStore: VocabularyStore;
  private getIntervalHints: (fsrs: FSRSData | undefined) => Record<number, number>;

  constructor(
    app: any,
    private settings: SynapseSettings,
    getIntervalHints: (fsrs: FSRSData | undefined) => Record<number, number>
  ) {
    super(app);
    this.vocabularyStore = new VocabularyStore(app, settings);
    this.getIntervalHints = getIntervalHints;
  }

  updateSettings(settings: SynapseSettings): void {
    this.vocabularyStore.updateSettings(settings);
  }

  async onOpen() {
    await this.loadDataAndOpen();
  }

  private async loadDataAndOpen(): Promise<void> {
    const entries = await this.vocabularyStore.loadEntries();
    const entriesDue = await this.vocabularyStore.getEntriesDueForReview();
    const statistics = await this.vocabularyStore.getStatistics();
    const allTags = await this.vocabularyStore.getAllTags();

    const tagEntryCounts: Record<string, number> = {};
    for (const tag of allTags) {
      tagEntryCounts[tag] = entries.filter((e) => e.tags.includes(tag)).length;
    }

    const windowState = (window as any).SynapseState || {};
    (window as any).SynapseState = {
      ...windowState,
      entries: entriesDue,
      settings: this.settings,
      statistics: {
        totalWords: statistics.total,
        learnedWords: statistics.learned,
        learningWords: statistics.learning,
        newWords: statistics.new,
        reviewStreak: 0,
        accuracyPerTag: {},
        accuracyPerLanguagePair: {},
        totalTimeSpentMinutes: 0,
        retentionRate: 0,
      },
      dueCount: entriesDue.length,
      availableTags: allTags,
      tagEntryCounts,
      getIntervalHints: this.getIntervalHints,
    };

    const root = document.createElement('app-root');
    this.contentEl.appendChild(root);
    this.appRef = await bootstrapAngular(root);
  }

  async refreshData(): Promise<void> {
    const entries = await this.vocabularyStore.loadEntries();
    const entriesDue = await this.vocabularyStore.getEntriesDueForReview();
    const statistics = await this.vocabularyStore.getStatistics();
    const allTags = await this.vocabularyStore.getAllTags();

    const tagEntryCounts: Record<string, number> = {};
    for (const tag of allTags) {
      tagEntryCounts[tag] = entries.filter((e) => e.tags.includes(tag)).length;
    }

    if (window.SynapseState) {
      window.SynapseState.entries = entriesDue;
      window.SynapseState.statistics = {
        totalWords: statistics.total,
        learnedWords: statistics.learned,
        learningWords: statistics.learning,
        newWords: statistics.new,
        reviewStreak: window.SynapseState.statistics?.reviewStreak || 0,
        accuracyPerTag: window.SynapseState.statistics?.accuracyPerTag || {},
        accuracyPerLanguagePair: window.SynapseState.statistics?.accuracyPerLanguagePair || {},
        totalTimeSpentMinutes: window.SynapseState.statistics?.totalTimeSpentMinutes || 0,
        retentionRate: window.SynapseState.statistics?.retentionRate || 0,
      };
      window.SynapseState.dueCount = entriesDue.length;
      window.SynapseState.availableTags = allTags;
      window.SynapseState.tagEntryCounts = tagEntryCounts;
    }
  }

  onClose() {
    this.appRef?.destroy();
    this.appRef = null;
    (window as any).SynapseState = null;
  }
}
