import { Injectable, inject } from '@angular/core';
import { ObsidianService } from './obsidian.service';
import { SYNAPSE_SETTINGS } from '../app.tokens';
import { parseVocabularyFile, entryToMarkdown } from '../utils/vocabulary-parser';
import { updateFSRSLine } from '../utils/fsrs-parser';
import type { VocabularyEntry, FSRSData, Statistics } from '../types';

@Injectable({ providedIn: 'root' })
export class VocabularyService {
  private obsidianService = inject(ObsidianService);
  private settings = inject(SYNAPSE_SETTINGS);

  private cache: VocabularyEntry[] | null = null;
  private cacheFilePath: string | null = null;

  private invalidateCache(): void {
    this.cache = null;
    this.cacheFilePath = null;
  }

  async getVocabularyFile(): Promise<string> {
    return this.settings.vocabularyFile;
  }

  async loadEntries(): Promise<VocabularyEntry[]> {
    const filePath = await this.getVocabularyFile();
    if (!filePath) {
      return [];
    }

    if (this.cache && this.cacheFilePath === filePath) {
      return this.cache;
    }

    const content = await this.obsidianService.readFile(filePath);
    const entries = parseVocabularyFile(content);

    this.cache = entries;
    this.cacheFilePath = filePath;

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

  async updateEntryFSRS(entry: VocabularyEntry, fsrsData: FSRSData): Promise<void> {
    const filePath = await this.getVocabularyFile();
    if (!filePath) {
      throw new Error('Vocabulary file not found');
    }

    const content = await this.obsidianService.readFile(filePath);
    const lines = content.split('\n');
    const line = lines[entry.lineIndex];

    if (!line) {
      throw new Error(`Line ${entry.lineIndex} not found in vocabulary file`);
    }

    lines[entry.lineIndex] = updateFSRSLine(line, fsrsData);
    const newContent = lines.join('\n');

    await this.obsidianService.writeFile(filePath, newContent);

    entry.fsrs = fsrsData;
    entry.rawLine = lines[entry.lineIndex];
  }

  async saveEntry(entry: VocabularyEntry): Promise<void> {
    const filePath = await this.getVocabularyFile();
    if (!filePath) {
      throw new Error('Vocabulary file not found');
    }

    const content = await this.obsidianService.readFile(filePath);
    const lines = content.split('\n');
    let markdown = entryToMarkdown(entry);

    if (entry.fsrs) {
      markdown = markdown + ' ' + this.serializeFSRS(entry.fsrs);
    }

    lines[entry.lineIndex] = markdown;
    const newContent = lines.join('\n');

    await this.obsidianService.writeFile(filePath, newContent);

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
