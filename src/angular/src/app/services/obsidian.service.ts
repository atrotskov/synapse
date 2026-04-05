import { Injectable, inject } from '@angular/core';
import { OBSIDIAN_APP } from '../app.tokens';
import { TFile } from 'obsidian';

@Injectable({ providedIn: 'root' })
export class ObsidianService {
  private app = inject(OBSIDIAN_APP);

  async readFile(path: string): Promise<string> {
    const file = this.getFileByPath(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    return this.app.vault.read(file);
  }

  async writeFile(path: string, content: string): Promise<void> {
    const file = this.getFileByPath(path);
    if (!file) {
      throw new Error(`File not found: ${path}`);
    }
    await this.app.vault.modify(file, content);
  }

  getFileByPath(path: string): TFile | null {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (file instanceof TFile) {
      return file;
    }
    return null;
  }

  async createOrModifyFile(path: string, content: string): Promise<void> {
    const file = this.getFileByPath(path);
    if (file) {
      await this.app.vault.modify(file, content);
    } else {
      await this.app.vault.create(path, content);
    }
  }
}
