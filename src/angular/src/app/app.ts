import { Component } from '@angular/core';
import { FlashcardComponent } from './components/flashcard/flashcard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlashcardComponent],
  template: `
    <div class="app-container">
      <header>
        <h1>Synapse Flashcards</h1>
        <p class="subtitle">Angular 21 + Zoneless</p>
      </header>
      <app-flashcard />
    </div>
  `,
  styles: [`
    .app-container {
      padding: 20px;
      text-align: center;
    }
    header {
      margin-bottom: 20px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
      color: var(--text-normal);
    }
    .subtitle {
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--text-muted);
    }
  `],
})
export class App {}
