import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { VocabularyService } from '../../services/vocabulary.service';
import { AppState, Page } from '../../state';
import type { Statistics } from '../../types';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  protected state = inject(AppState);
  private vocabularyService = inject(VocabularyService);

  readonly statistics = signal<Statistics | null>(null);

  async ngOnInit(): Promise<void> {
    this.state.resetReviewedCount();
    const stats = await this.vocabularyService.getStatistics();
    this.statistics.set({
      totalWords: stats.total,
      learnedWords: stats.learned,
      learningWords: stats.learning,
      newWords: stats.new,
      reviewStreak: 0,
      accuracyPerTag: {},
      accuracyPerLanguagePair: {},
      totalTimeSpentMinutes: 0,
      retentionRate: 0,
    });
  }

  navigateTo(page: Page): void {
    this.state.setPage(page);
  }
}
