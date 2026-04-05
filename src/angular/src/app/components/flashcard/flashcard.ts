import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { VocabularyService } from '../../services/vocabulary.service';
import { SchedulerService } from '../../services/scheduler.service';
import { AppState } from '../../state';
import { Rating, RATING_LABELS, VocabularyEntry } from '../../types';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [],
  templateUrl: './flashcard.html',
  styleUrl: './flashcard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashcardComponent {
  private vocabularyService = inject(VocabularyService);
  private schedulerService = inject(SchedulerService);
  private state = inject(AppState);

  private _entries = signal<VocabularyEntry[]>([]);
  private _currentIndex = signal(0);
  private _isFlipped = signal(false);
  private _intervalHints = signal<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });

  readonly currentEntry = computed(() => {
    const entries = this._entries();
    const index = this._currentIndex();
    return entries[index] ?? null;
  });

  readonly currentIndex = this._currentIndex.asReadonly();
  readonly total = computed(() => this._entries().length);
  readonly isFlipped = this._isFlipped.asReadonly();
  readonly hasNext = computed(() => this._currentIndex() < this._entries().length - 1);
  readonly hasPrevious = computed(() => this._currentIndex() > 0);
  readonly reviewedCount = this.state.reviewedCount;
  readonly intervalHints = this._intervalHints.asReadonly();

  readonly ratings: Rating[] = [1, 2, 3, 4];
  readonly ratingLabels = RATING_LABELS;

  constructor() {
    this.loadEntries();
  }

  private async loadEntries(): Promise<void> {
    const practiceTags = this.state.practiceTags();
    let entries: VocabularyEntry[];

    if (practiceTags.length > 0) {
      entries = await this.vocabularyService.getEntriesByTags(practiceTags);
      this.state.setPracticeTags([]);
    } else {
      entries = await this.vocabularyService.getEntriesDueForReview();
    }

    this._entries.set(entries);
    this._currentIndex.set(0);
    this._isFlipped.set(false);
  }

  flip(): void {
    this._isFlipped.update((v) => !v);
    if (this._isFlipped()) {
      this.updateIntervalHints();
    }
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

  async rate(rating: Rating): Promise<void> {
    const entry = this.currentEntry();
    if (!entry) return;

    this.state.incrementReviewedCount();

    const newFsrs = this.schedulerService.review(entry.fsrs, rating);
    await this.vocabularyService.updateEntryFSRS(entry, newFsrs);

    this.next();
  }

  formatInterval(days: number): string {
    if (days < 1 / 24) {
      const minutes = Math.round(days * 24 * 60);
      return `${minutes}m`;
    }
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours}h`;
    }
    if (days < 30) {
      return `${Math.round(days)}d`;
    }
    if (days < 365) {
      const months = Math.round(days / 30);
      return `${months}mo`;
    }
    const years = Math.round(days / 365);
    return `${years}y`;
  }

  private updateIntervalHints(): void {
    const entry = this.currentEntry();
    if (!entry) return;

    const hints = this.schedulerService.getPreviewIntervals(entry.fsrs);
    this._intervalHints.set(hints);
  }

  getFrontText(): string {
    const entry = this.currentEntry();
    if (!entry) return 'No cards available';

    const settings = this.state.settings();
    const primaryLang = settings?.primaryLanguage || 'en';
    const translation = entry.translations.find((t: { lang: string }) => t.lang === primaryLang);
    if (translation) {
      return translation.meanings.join(', ');
    }
    return entry.translations[0]?.meanings.join(', ') || 'No translation';
  }

  getBackText(): string {
    const entry = this.currentEntry();
    if (!entry) return '';

    const settings = this.state.settings();
    const primaryLang = settings?.primaryLanguage || 'en';
    const otherTranslations = entry.translations.filter((t: { lang: string }) => t.lang !== primaryLang);
    const parts: string[] = [];

    for (const t of otherTranslations) {
      parts.push(`(${t.lang}) ${t.meanings.join(', ')}`);
    }

    if (entry.examples.length > 0) {
      const example = entry.examples[0];
      const exampleText = example.segments.map((s: { text: string }) => s.text).join('');
      parts.push(`Example: ${exampleText}`);
    }

    return parts.join('\n') || 'No back content';
  }

  hasTags(): boolean {
    const entry = this.currentEntry();
    return !!(entry && entry.tags && entry.tags.length > 0);
  }
}
