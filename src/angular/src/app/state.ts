import { Injectable, signal, computed } from '@angular/core';
import { SynapseSettings } from './types';

export type Page = 'menu' | 'flash-card' | 'pair-mode' | 'statistic' | 'tag-select' | 'review-pre';

@Injectable({ providedIn: 'root' })
export class AppState {
  private _currentPage = signal<Page>('menu');
  private _isFlipped = signal(false);
  private _settings = signal<SynapseSettings | null>(null);
  private _isLoading = signal(false);
  private _selectedTags = signal<string[]>([]);
  private _reviewedCount = signal(0);
  private _practiceTags = signal<string[]>([]);

  readonly currentPage = this._currentPage.asReadonly();
  readonly isFlipped = this._isFlipped.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedTags = this._selectedTags.asReadonly();
  readonly reviewedCount = this._reviewedCount.asReadonly();
  readonly practiceTags = this._practiceTags.asReadonly();

  readonly selectedTagsCount = computed(() => this._selectedTags().length);

  setPage(page: Page): void {
    this._currentPage.set(page);
    if (page !== 'flash-card') {
      this.resetReviewedCount();
    }
  }

  setSettings(settings: SynapseSettings): void {
    this._settings.set(settings);
  }

  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
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

  setPracticeTags(tags: string[]): void {
    this._practiceTags.set(tags);
  }

  incrementReviewedCount(): void {
    this._reviewedCount.update((n) => n + 1);
  }

  resetReviewedCount(): void {
    this._reviewedCount.set(0);
  }

  flip(): void {
    this._isFlipped.update((v) => !v);
  }

  goToMenu(): void {
    this.clearSelectedTags();
    this._practiceTags.set([]);
    this.resetReviewedCount();
    this._currentPage.set('menu');
  }
}
