import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AppState } from '../../state';
import { VocabularyEntry } from '../../types';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface GameCard {
  id: string;
  text: string;
  lang: string;
  entry: VocabularyEntry;
  isSelected: boolean;
  isMatched: boolean;
  isSource: boolean;
}

@Component({
  selector: 'app-pair-mode',
  standalone: true,
  imports: [],
  templateUrl: './pair-mode.html',
  styleUrl: './pair-mode.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairModeComponent {
  protected state = inject(AppState);

  private sourceCards = signal<GameCard[]>([]);
  private targetCards = signal<GameCard[]>([]);
  private selectedSource = signal<GameCard | null>(null);
  private selectedTarget = signal<GameCard | null>(null);
  private correctPairs = signal(0);
  private totalPairs = signal(0);
  private mistakes = signal<{ source: string; target: string }[]>([]);
  private gameStarted = signal(false);
  private gameComplete = signal(false);

  readonly source = this.sourceCards.asReadonly();
  readonly target = this.targetCards.asReadonly();
  readonly selectedSourceCard = this.selectedSource.asReadonly();
  readonly selectedTargetCard = this.selectedTarget.asReadonly();
  readonly correctCount = this.correctPairs.asReadonly();
  readonly totalCount = this.totalPairs.asReadonly();
  readonly mistakeList = this.mistakes.asReadonly();
  readonly started = this.gameStarted.asReadonly();
  readonly complete = this.gameComplete.asReadonly();

  readonly accuracy = computed(() => {
    const total = this.correctCount() + this.mistakes().length;
    if (total === 0) return 0;
    return Math.round((this.correctCount() / total) * 100);
  });

  startGame(): void {
    const entries = this.state.entries();
    const settings = this.state.settings();
    const gameSize = settings?.matchingGameSize || 10;
    const primaryLang = settings?.primaryLanguage || 'en';

    const selectedEntries = shuffle([...entries]).slice(0, Math.min(gameSize, entries.length));
    const source: GameCard[] = [];
    const target: GameCard[] = [];

    selectedEntries.forEach((entry: VocabularyEntry, i: number) => {
      const sourceTranslation = entry.translations.find((t: { lang: string }) => t.lang === primaryLang);
      const targetTranslation = entry.translations.find((t: { lang: string }) => t.lang !== primaryLang);

      if (sourceTranslation) {
        source.push({
          id: `source-${i}`,
          text: sourceTranslation.meanings[0],
          lang: primaryLang,
          entry,
          isSelected: false,
          isMatched: false,
          isSource: true,
        });
      }

      if (targetTranslation) {
        target.push({
          id: `target-${i}`,
          text: targetTranslation.meanings[0],
          lang: targetTranslation.lang,
          entry,
          isSelected: false,
          isMatched: false,
          isSource: false,
        });
      }
    });

    this.sourceCards.set(shuffle(source));
    this.targetCards.set(shuffle(target));
    this.totalPairs.set(source.length);
    this.correctPairs.set(0);
    this.mistakes.set([]);
    this.selectedSource.set(null);
    this.selectedTarget.set(null);
    this.gameStarted.set(true);
    this.gameComplete.set(false);
  }

  selectSource(card: GameCard): void {
    if (card.isMatched) return;

    this.sourceCards.update((cards) =>
      cards.map((c) => (c.id === card.id ? { ...c, isSelected: true } : { ...c, isSelected: false }))
    );
    this.selectedSource.set(card);

    this.checkMatch();
  }

  selectTarget(card: GameCard): void {
    if (card.isMatched) return;

    this.targetCards.update((cards) =>
      cards.map((c) => (c.id === card.id ? { ...c, isSelected: true } : { ...c, isSelected: false }))
    );
    this.selectedTarget.set(card);

    this.checkMatch();
  }

  private checkMatch(): void {
    const source = this.selectedSource();
    const target = this.selectedTarget();

    if (!source || !target) return;

    if (source.entry === target.entry) {
      this.sourceCards.update((cards) =>
        cards.map((c) => (c.id === source.id ? { ...c, isMatched: true, isSelected: false } : c))
      );
      this.targetCards.update((cards) =>
        cards.map((c) => (c.id === target.id ? { ...c, isMatched: true, isSelected: false } : c))
      );
      this.correctPairs.update((n) => n + 1);
      this.selectedSource.set(null);
      this.selectedTarget.set(null);

      if (this.correctPairs() === this.totalPairs()) {
        this.gameComplete.set(true);
      }
    } else {
      this.mistakes.update((m) => [...m, { source: source.text, target: target.text }]);
      setTimeout(() => {
        this.sourceCards.update((cards) =>
          cards.map((c) => (c.id === source.id ? { ...c, isSelected: false } : c))
        );
        this.targetCards.update((cards) =>
          cards.map((c) => (c.id === target.id ? { ...c, isSelected: false } : c))
        );
        this.selectedSource.set(null);
        this.selectedTarget.set(null);
      }, 500);
    }
  }

  resetGame(): void {
    this.gameStarted.set(false);
    this.gameComplete.set(false);
    this.sourceCards.set([]);
    this.targetCards.set([]);
    this.correctPairs.set(0);
    this.totalPairs.set(0);
    this.mistakes.set([]);
    this.selectedSource.set(null);
    this.selectedTarget.set(null);
  }

  goToMenu(): void {
    this.resetGame();
    this.state.setPage('menu');
  }
}
