import { Component, inject } from '@angular/core';
import { FlashcardComponent } from './components/flashcard/flashcard';
import { MenuComponent } from './components/menu/menu';
import { StatisticComponent } from './components/statistic/statistic';
import { PairModeComponent } from './components/pair-mode/pair-mode';
import { TagSelectComponent } from './components/tag-select/tag-select';
import { ReviewPreComponent } from './components/review-pre/review-pre';
import { AppState } from './state';

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
export class App {
  protected state = inject(AppState);
  readonly currentPage = this.state.currentPage;
}
