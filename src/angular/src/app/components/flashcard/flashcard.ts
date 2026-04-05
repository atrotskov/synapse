import { Component, ChangeDetectionStrategy, Output, EventEmitter, inject } from '@angular/core';
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
  private state = inject(AppState);

  @Output() reviewed = new EventEmitter<{ entry: VocabularyEntry; rating: Rating }>();

  readonly currentIndex = this.state.currentIndex;
  readonly total = this.state.totalEntries;
  readonly isFlipped = this.state.isFlipped;
  readonly currentEntry = this.state.currentEntry;
  readonly hasNext = this.state.hasNext;
  readonly hasPrevious = this.state.hasPrevious;
  readonly reviewedCount = this.state.reviewedCount;
  readonly intervalHints = this.state.intervalHints;

  readonly ratings: Rating[] = [1, 2, 3, 4];
  readonly ratingLabels = RATING_LABELS;

  flip(): void {
    this.state.flip();
    if (this.state.isFlipped()) {
      this.updateIntervalHints();
    }
  }

  next(): void {
    this.state.next();
  }

  previous(): void {
    this.state.previous();
  }

  rate(rating: Rating): void {
    const entry = this.currentEntry();
    if (entry) {
      this.state.incrementReviewedCount();
      this.reviewed.emit({ entry, rating });
    }
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

    if (window.SynapseState?.getIntervalHints) {
      const hints = window.SynapseState.getIntervalHints(entry.fsrs);
      this.state.setIntervalHints(hints);
    }
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
}
