import { Component, inject, OnInit } from '@angular/core';
import { FlashcardComponent } from './components/flashcard/flashcard';
import { MenuComponent } from './components/menu/menu';
import { StatisticComponent } from './components/statistic/statistic';
import { PairModeComponent } from './components/pair-mode/pair-mode';
import { TagSelectComponent } from './components/tag-select/tag-select';
import { ReviewPreComponent } from './components/review-pre/review-pre';
import { AppState, Page } from './state';
import { Rating, VocabularyEntry } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FlashcardComponent,
    MenuComponent,
    StatisticComponent,
    PairModeComponent,
    TagSelectComponent,
    ReviewPreComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected state = inject(AppState);
  readonly currentPage = this.state.currentPage;

  ngOnInit(): void {
    if (window.SynapseState) {
      this.state.setEntries(window.SynapseState.entries || []);
      this.state.setSettings(window.SynapseState.settings);
      this.state.setStatistics(window.SynapseState.statistics);
      this.state.setDueCount(window.SynapseState.dueCount || 0);
      this.state.setAvailableTags(
        window.SynapseState.availableTags || [],
        window.SynapseState.tagEntryCounts || {}
      );
    }
  }

  onReviewed(event: { entry: VocabularyEntry; rating: Rating }): void {
    console.log('Card reviewed:', event);
  }
}
