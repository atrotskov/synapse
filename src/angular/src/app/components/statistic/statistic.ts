import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VocabularyService } from '../../services/vocabulary.service';
import { AppState } from '../../state';
import type { Statistics } from '../../types';

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [],
  templateUrl: './statistic.html',
  styleUrl: './statistic.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticComponent {
  protected state = inject(AppState);
  private vocabularyService = inject(VocabularyService);

  readonly statistics = signal<Statistics | null>(null);

  constructor() {
    this.loadStatistics();
  }

  private async loadStatistics(): Promise<void> {
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

  goBack(): void {
    this.state.setPage('menu');
  }
}
