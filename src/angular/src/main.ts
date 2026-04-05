import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { OBSIDIAN_APP, SYNAPSE_SETTINGS } from './app/app.tokens';
import type { App as ObsidianApp } from 'obsidian';
import type { SynapseSettings } from './app/types';

export function bootstrapAngular(obsidianApp: ObsidianApp, settings: SynapseSettings) {
  return bootstrapApplication(App, {
    providers: [
      ...appConfig.providers,
      { provide: OBSIDIAN_APP, useValue: obsidianApp },
      { provide: SYNAPSE_SETTINGS, useValue: settings },
    ]
  });
}
