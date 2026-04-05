import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { VocabularyService } from '../../services/vocabulary.service';
import { AppState } from '../../state';

@Component({
  selector: 'app-tag-select',
  standalone: true,
  imports: [],
  templateUrl: './tag-select.html',
  styleUrl: './tag-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagSelectComponent {
  protected state = inject(AppState);
  private vocabularyService = inject(VocabularyService);

  readonly availableTags = signal<string[]>([]);
  readonly tagEntryCounts = signal<Record<string, number>>({});

  readonly selectedCount = this.state.selectedTagsCount;

  constructor() {
    this.loadTags();
  }

  private async loadTags(): Promise<void> {
    const tags = await this.vocabularyService.getAllTags();
    const entries = await this.vocabularyService.loadEntries();

    const counts: Record<string, number> = {};
    for (const tag of tags) {
      counts[tag] = entries.filter((e) => e.tags.includes(tag)).length;
    }

    this.availableTags.set(tags);
    this.tagEntryCounts.set(counts);
  }

  isSelected(tag: string): boolean {
    return this.state.selectedTags().includes(tag);
  }

  toggleTag(tag: string): void {
    this.state.toggleTag(tag);
  }

  startPractice(): void {
    const selected = this.state.selectedTags();
    if (selected.length === 0) return;

    this.state.setPracticeTags(selected);
    this.state.setPage('flash-card');
  }

  goBack(): void {
    this.state.clearSelectedTags();
    this.state.setPage('menu');
  }
}
