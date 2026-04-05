import { Injectable, signal, computed } from '@angular/core';
import { VocabularyEntry, SynapseSettings, GameResult, Statistics } from './types';

export type Page = 'menu' | 'flash-card' | 'pair-mode' | 'statistic' | 'tag-select' | 'review-pre';

@Injectable({ providedIn: 'root' })
export class AppState {
  private _entries = signal<VocabularyEntry[]>([]);
  private _currentIndex = signal(0);
  private _isFlipped = signal(false);
  private _settings = signal<SynapseSettings | null>(null);
  private _currentPage = signal<Page>('menu');
  private _isLoading = signal(false);
  private _gameResult = signal<GameResult | null>(null);
  private _statistics = signal<Statistics | null>(null);
  private _dueCount = signal(0);
  private _availableTags = signal<string[]>([]);
  private _selectedTags = signal<string[]>([]);
  private _tagEntryCounts = signal<Record<string, number>>({});
  private _reviewedCount = signal(0);
  private _intervalHints = signal<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  readonly entries = this._entries.asReadonly();
  readonly currentIndex = this._currentIndex.asReadonly();
  readonly isFlipped = this._isFlipped.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly gameResult = this._gameResult.asReadonly();
  readonly statistics = this._statistics.asReadonly();
  readonly dueCount = this._dueCount.asReadonly();
  readonly availableTags = this._availableTags.asReadonly();
  readonly selectedTags = this._selectedTags.asReadonly();
  readonly tagEntryCounts = this._tagEntryCounts.asReadonly();
  readonly reviewedCount = this._reviewedCount.asReadonly();
  readonly intervalHints = this._intervalHints.asReadonly();

  readonly currentEntry = computed(() => {
    const entries = this._entries();
    const index = this._currentIndex();
    return entries[index] ?? null;
  });

  readonly totalEntries = computed(() => this._entries().length);

  readonly hasNext = computed(() => this._currentIndex() < this._entries().length - 1);
  readonly hasPrevious = computed(() => this._currentIndex() > 0);

  readonly selectedTagsCount = computed(() => this._selectedTags().length);

  setEntries(entries: VocabularyEntry[]): void {
    this._entries.set(entries);
    this._currentIndex.set(0);
    this._isFlipped.set(false);
  }

  setSettings(settings: SynapseSettings): void {
    this._settings.set(settings);
  }

  setPage(page: Page): void {
    this._currentPage.set(page);
    if (page !== 'flash-card') {
      this.resetReviewedCount();
    }
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  setGameResult(result: GameResult): void {
    this._gameResult.set(result);
  }

  setStatistics(stats: Statistics): void {
    this._statistics.set(stats);
  }

  setDueCount(count: number): void {
    this._dueCount.set(count);
  }

  setAvailableTags(tags: string[], entryCounts: Record<string, number>): void {
    this._availableTags.set(tags);
    this._tagEntryCounts.set(entryCounts);
  }

  toggleTag(tag: string): void {
    const current = this._selectedTags();
    if (current.includes(tag)) {
      this._selectedTags.set(current.filter((t) => t !== tag));
    } else {
      this._selectedTags.set([...current, tag]);
    }
  }

  clearSelectedTags(): void {
    this._selectedTags.set([]);
  }

  setEntriesForTagPractice(entries: VocabularyEntry[]): void {
    this._entries.set(entries);
    this._currentIndex.set(0);
    this._isFlipped.set(false);
    this._reviewedCount.set(0);
    this._currentPage.set('flash-card');
  }

  incrementReviewedCount(): void {
    this._reviewedCount.update((n) => n + 1);
  }

  resetReviewedCount(): void {
    this._reviewedCount.set(0);
  }

  setIntervalHints(hints: Record<number, number>): void {
    this._intervalHints.set(hints);
  }

  flip(): void {
    this._isFlipped.update((v) => !v);
  }

  next(): void {
    if (this.hasNext()) {
      this._currentIndex.update((i) => i + 1);
      this._isFlipped.set(false);
    }
  }

  previous(): void {
    if (this.hasPrevious()) {
      this._currentIndex.update((i) => i - 1);
      this._isFlipped.set(false);
    }
  }

  goToIndex(index: number): void {
    if (index >= 0 && index < this._entries().length) {
      this._currentIndex.set(index);
      this._isFlipped.set(false);
    }
  }

  clearEntries(): void {
    this._entries.set([]);
    this._currentIndex.set(0);
    this._isFlipped.set(false);
  }

  goToMenu(): void {
    this.clearEntries();
    this.clearSelectedTags();
    this.resetReviewedCount();
    this._currentPage.set('menu');
  }
}

declare global {
  interface Window {
    SynapseState: {
      entries: VocabularyEntry[];
      settings: SynapseSettings;
      statistics: Statistics;
      dueCount: number;
      availableTags: string[];
      tagEntryCounts: Record<string, number>;
      getIntervalHints: (fsrs: any) => { 1: number; 2: number; 3: number; 4: number };
    };
  }
}
