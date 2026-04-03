import { Component, signal } from '@angular/core';
import { Flashcard } from './components/flashcard/flashcard';
import { Menu } from './components/menu/menu';
import { Statistic } from './components/statistic/statistic';
import { PairMode } from './components/pair-mode/pair-mode';

type Page = 'menu' | 'flash-card' | 'pair-mode' | 'statistic';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Flashcard, Menu, Statistic, PairMode],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly currentPage = signal<Page>('menu');
}
