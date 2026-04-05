import { App, TFile } from 'obsidian';
import type { VocabularyEntry, FSRSData, SynapseSettings } from '../types';
import { parseVocabularyFile, entryToMarkdown } from '../parser/vocabulary-parser';
import { updateFSRSLine } from '../parser/fsrs-parser';

export class VocabularyStore {
  private app: App;
  private settings: SynapseSettings;
  private cache: VocabularyEntry[] | null = null;
  private cacheFilePath: string | null = null;

  constructor(app: App, settings: SynapseSettings) {
    this.app = app;
    this.settings = settings;
  }

  updateSettings(settings: SynapseSettings): void {
    this.settings = settings;
    this.invalidateCache();
  }

  invalidateCache(): void {
    this.cache = null;
    this.cacheFilePath = null;
  }

  async getVocabularyFile(): Promise<TFile | null> {
    if (!this.settings.vocabularyFile) {
      return null;
    }
    return this.app.vault.getAbstractFileByPath(this.settings.vocabularyFile) as TFile | null;
  }

  async loadEntries(): Promise<VocabularyEntry[]> {
    const file = await this.getVocabularyFile();
    if (!file) {
      return [];
    }

    if (this.cache && this.cacheFilePath === file.path) {
      return this.cache;
    }

    const content = await this.app.vault.read(file);
    const entries = parseVocabularyFile(content);

    this.cache = entries;
    this.cacheFilePath = file.path;

    return entries;
  }

  async getEntriesDueForReview(): Promise<VocabularyEntry[]> {
    const entries = await this.loadEntries();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entries.filter((entry) => {
      if (!entry.fsrs) {
        return true;
      }
      const nextReview = new Date(entry.fsrs.nextReview);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview <= today;
    });
  }

  async getEntriesByTags(tags: string[]): Promise<VocabularyEntry[]> {
    const entries = await this.loadEntries();
    if (tags.length === 0) {
      return entries;
    }
    return entries.filter((entry) => {
      return tags.some((tag) => entry.tags.includes(tag));
    });
  }

  async getEntriesByLanguage(
    sourceLang: string,
    targetLang: string,
  ): Promise<VocabularyEntry[]> {
    const entries = await this.loadEntries();
    return entries.filter((entry) => {
      const hasSource = entry.translations.some((t) => t.lang === sourceLang);
      const hasTarget = entry.translations.some((t) => t.lang === targetLang);
      return hasSource && hasTarget;
    });
  }

  async updateEntryFSRS(
    entry: VocabularyEntry,
    fsrsData: FSRSData,
  ): Promise<void> {
    const file = await this.getVocabularyFile();
    if (!file) {
      throw new Error('Vocabulary file not found');
    }

    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    const line = lines[entry.lineIndex];

    if (!line) {
      throw new Error(`Line ${entry.lineIndex} not found in vocabulary file`);
    }

    lines[entry.lineIndex] = updateFSRSLine(line, fsrsData);
    const newContent = lines.join('\n');

    await this.app.vault.modify(file, newContent);

    entry.fsrs = fsrsData;
    entry.rawLine = lines[entry.lineIndex];
  }

  async saveEntry(entry: VocabularyEntry): Promise<void> {
    const file = await this.getVocabularyFile();
    if (!file) {
      throw new Error('Vocabulary file not found');
    }

    const content = await this.app.vault.read(file);
    const lines = content.split('\n');
    const markdown = entryToMarkdown(entry);

    if (entry.fsrs) {
      markdown + ' ' + this.serializeFSRS(entry.fsrs);
    }

    lines[entry.lineIndex] = markdown;
    const newContent = lines.join('\n');

    await this.app.vault.modify(file, newContent);

    entry.rawLine = markdown;
  }

  private serializeFSRS(fsrs: FSRSData): string {
    return `[fsrs:${fsrs.nextReview}|${fsrs.stability}|${fsrs.difficulty}|${fsrs.elapsedDays}|${fsrs.repetitions}|${fsrs.lapses}]`;
  }

  async getAllTags(): Promise<string[]> {
    const entries = await this.loadEntries();
    const tagSet = new Set<string>();

    for (const entry of entries) {
      for (const tag of entry.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  }

  async getAvailableLanguages(): Promise<string[]> {
    const entries = await this.loadEntries();
    const langSet = new Set<string>();

    for (const entry of entries) {
      for (const translation of entry.translations) {
        langSet.add(translation.lang);
      }
    }

    return Array.from(langSet).sort();
  }

  async getStatistics(): Promise<{
    total: number;
    new: number;
    learning: number;
    learned: number;
  }> {
    const entries = await this.loadEntries();

    let newCount = 0;
    let learningCount = 0;
    let learnedCount = 0;

    for (const entry of entries) {
      if (!entry.fsrs) {
        newCount++;
      } else if (entry.fsrs.repetitions < 5) {
        learningCount++;
      } else {
        learnedCount++;
      }
    }

    return {
      total: entries.length,
      new: newCount,
      learning: learningCount,
      learned: learnedCount,
    };
  }
}