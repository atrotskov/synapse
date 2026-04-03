import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

export default class Synapse extends Plugin {
  settings!: SynapseSettings;

  async onload() {
    console.log("Synapse: Loading plugin...");

    await this.loadSettings();

    this.addSettingTab(new SynapseSettingTab(this.app, this));

    this.addRibbonIcon("graduation-cap", "Synapse", () => {
      new Notice("Synapse: Hello World!");
    });

    this.addCommand({
      id: "vocabmaster-hello",
      name: "Say Hello",
      callback: () => {
        new Notice("Hello from Synapse!");
      },
    });

    console.log("Synapse: Plugin loaded!");
  }

  onunload() {
    console.log("Synapse: Plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

interface SynapseSettings {
  vocabularyFile: string;
  primaryLanguage: string;
  dailyReviewLimit: number;
  matchingGameSize: number;
  tagsToExclude: string;
}

const DEFAULT_SETTINGS: SynapseSettings = {
  vocabularyFile: "",
  primaryLanguage: "en",
  dailyReviewLimit: 20,
  matchingGameSize: 10,
  tagsToExclude: "",
};

class SynapseSettingTab extends PluginSettingTab {
  plugin: Synapse;

  constructor(app: App, plugin: Synapse) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Synapse Settings" });

    new Setting(containerEl)
      .setName("Vocabulary File")
      .setDesc("Path to your vocabulary markdown file")
      .addText((text) =>
        text
          .setPlaceholder("Vocabulary/words.md")
          .setValue(this.plugin.settings.vocabularyFile)
          .onChange(async (value) => {
            this.plugin.settings.vocabularyFile = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Primary Language")
      .setDesc("Default source language for UI (ISO 639-1 code)")
      .addText((text) =>
        text
          .setPlaceholder("en")
          .setValue(this.plugin.settings.primaryLanguage)
          .onChange(async (value) => {
            this.plugin.settings.primaryLanguage = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Daily Review Limit")
      .setDesc("Maximum new cards per day")
      .addText((text) =>
        text
          .setPlaceholder("20")
          .setValue(String(this.plugin.settings.dailyReviewLimit))
          .onChange(async (value) => {
            this.plugin.settings.dailyReviewLimit = parseInt(value) || 20;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Matching Game Size")
      .setDesc("Number of pairs per game round")
      .addText((text) =>
        text
          .setPlaceholder("10")
          .setValue(String(this.plugin.settings.matchingGameSize))
          .onChange(async (value) => {
            this.plugin.settings.matchingGameSize = parseInt(value) || 10;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Tags to Exclude")
      .setDesc("Comma-separated tags to skip during practice")
      .addText((text) =>
        text
          .setPlaceholder("exclude,these, tags")
          .setValue(this.plugin.settings.tagsToExclude)
          .onChange(async (value) => {
            this.plugin.settings.tagsToExclude = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
