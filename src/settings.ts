import { App, PluginSettingTab, Setting } from 'obsidian';
import type { SynapseSettings } from './types';
import type { FSRSParameters } from 'ts-fsrs';
import { DEFAULT_SETTINGS } from './types';

export interface SynapsePlugin {
  settings: SynapseSettings;
  saveSettings: () => Promise<void>;
}

export const DEFAULT_FSRS_PARAMETERS: FSRSParameters = {
  request_retention: 0.9,
  maximum_interval: 36500,
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.62, 1.06, 0.26, 2.05],
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['1m', '10m'],
  relearning_steps: ['1m', '10m'],
};

export class SynapseSettingTab extends PluginSettingTab {
  plugin: SynapsePlugin;

  constructor(app: App, plugin: any) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Synapse Settings' });

    new Setting(containerEl)
      .setName('Vocabulary File')
      .setDesc('Path to your vocabulary markdown file')
      .addText((text) =>
        text
          .setPlaceholder('Vocabulary/words.md')
          .setValue(this.plugin.settings.vocabularyFile)
          .onChange(async (value) => {
            this.plugin.settings.vocabularyFile = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Primary Language')
      .setDesc('Default source language for UI (ISO 639-1 code)')
      .addText((text) =>
        text
          .setPlaceholder('en')
          .setValue(this.plugin.settings.primaryLanguage)
          .onChange(async (value) => {
            this.plugin.settings.primaryLanguage = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Daily Review Limit')
      .setDesc('Maximum new cards per day')
      .addText((text) =>
        text
          .setPlaceholder('20')
          .setValue(String(this.plugin.settings.dailyReviewLimit))
          .onChange(async (value) => {
            this.plugin.settings.dailyReviewLimit = parseInt(value) || 20;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Matching Game Size')
      .setDesc('Number of pairs per game round')
      .addText((text) =>
        text
          .setPlaceholder('10')
          .setValue(String(this.plugin.settings.matchingGameSize))
          .onChange(async (value) => {
            this.plugin.settings.matchingGameSize = parseInt(value) || 10;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Tags to Exclude')
      .setDesc('Comma-separated tags to skip during practice')
      .addText((text) =>
        text
          .setPlaceholder('exclude, these, tags')
          .setValue(this.plugin.settings.tagsToExclude)
          .onChange(async (value) => {
            this.plugin.settings.tagsToExclude = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}