import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AppState, Page } from '../../state';

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

  readonly statistics = this.state.statistics;

  ngOnInit(): void {
    this.state.resetReviewedCount();
  }

  navigateTo(page: Page): void {
    this.state.setPage(page);
  }
}
