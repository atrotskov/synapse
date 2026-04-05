import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  readonly dueCount = this.state.dueCount;

  startReview(): void {
    this.state.setPage('flash-card');
  }

  goBack(): void {
    this.state.setPage('menu');
  }
}
