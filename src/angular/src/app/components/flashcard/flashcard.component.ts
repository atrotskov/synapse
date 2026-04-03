import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [],
  template: `
    <div class="flashcard-container">
      <div class="flashcard" (click)="flip()">
        @if (!isFlipped()) {
          <div class="card-front">
            <span class="label">Front</span>
            <div class="content">{{ front() }}</div>
          </div>
        } @else {
          <div class="card-back">
            <span class="label">Back</span>
            <div class="content">{{ back() }}</div>
          </div>
        }
      </div>
      <div class="controls">
        <button (click)="previous()" [disabled]="currentIndex() === 0">Previous</button>
        <span class="counter">{{ currentIndex() + 1 }} / {{ total() }}</span>
        <button (click)="next()" [disabled]="currentIndex() === total() - 1">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .flashcard-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .flashcard {
      width: 300px;
      height: 200px;
      perspective: 1000px;
      cursor: pointer;
    }
    .card-front, .card-back {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s;
    }
    .card-front {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .card-back {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
      color: white;
    }
    .label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
    }
    .content {
      font-size: 24px;
      font-weight: 600;
      margin-top: 8px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: #667eea;
      color: white;
      cursor: pointer;
      font-size: 14px;
    }
    .controls button:hover:not(:disabled) {
      background: #764ba2;
    }
    .controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .counter {
      font-size: 14px;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlashcardComponent {
  readonly front = signal('Hello');
  readonly back = signal('World');
  readonly isFlipped = signal(false);
  readonly currentIndex = signal(0);
  readonly total = signal(5);

  flip() {
    this.isFlipped.update(v => !v);
  }

  next() {
    if (this.currentIndex() < this.total() - 1) {
      this.currentIndex.update(i => i + 1);
      this.isFlipped.set(false);
    }
  }

  previous() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
      this.isFlipped.set(false);
    }
  }
}