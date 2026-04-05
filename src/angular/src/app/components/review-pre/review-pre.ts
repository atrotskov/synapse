import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VocabularyService } from '../../services/vocabulary.service';
import { AppState } from '../../state';

@Component({
  selector: 'app-review-pre',
  standalone: true,
  imports: [],
  templateUrl: './review-pre.html',
  styleUrl: './review-pre.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPreComponent {
  protected state = inject(AppState);
  private vocabularyService = inject(VocabularyService);

  readonly dueCount = signal(0);

  constructor() {
    this.loadDueCount();
  }

  private async loadDueCount(): Promise<void> {
    const entries = await this.vocabularyService.getEntriesDueForReview();
    this.dueCount.set(entries.length);
  }

  startReview(): void {
    this.state.setPage('flash-card');
  }

  goBack(): void {
    this.state.setPage('menu');
  }
}
