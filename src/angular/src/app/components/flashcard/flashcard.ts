import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [],
  templateUrl: './flashcard.html',
  styleUrl: './flashcard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Flashcard {
  readonly front = signal('Hello');
  readonly back = signal('World');
  readonly isFlipped = signal(false);
  readonly currentIndex = signal(0);
  readonly total = signal(5);

  flip() {
    this.isFlipped.update((v) => !v);
  }

  next() {
    if (this.currentIndex() < this.total() - 1) {
      this.currentIndex.update((i) => i + 1);
      this.isFlipped.set(false);
    }
  }

  previous() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.isFlipped.set(false);
    }
  }
}
