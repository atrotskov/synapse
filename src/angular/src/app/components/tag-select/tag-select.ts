import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppState } from '../../state';
import { VocabularyEntry } from '../../types';

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

  readonly availableTags = this.state.availableTags;
  readonly tagEntryCounts = this.state.tagEntryCounts;
  readonly selectedTags = this.state.selectedTags;
  readonly selectedCount = this.state.selectedTagsCount;

  isSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  toggleTag(tag: string): void {
    this.state.toggleTag(tag);
  }

  selectAll(): void {
    this.state.setEntriesForTagPractice(this.state.entries());
  }

  startPractice(): void {
    const selected = this.selectedTags();
    if (selected.length === 0) return;

    const allEntries = this.state.entries();
    const filtered = allEntries.filter((entry: VocabularyEntry) =>
      entry.tags.some((tag: string) => selected.includes(tag))
    );

    this.state.setEntriesForTagPractice(filtered);
  }

  goBack(): void {
    this.state.clearSelectedTags();
    this.state.setPage('menu');
  }
}
