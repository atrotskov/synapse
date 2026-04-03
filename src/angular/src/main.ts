import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export function bootstrapAngular(element: HTMLElement) {
  return bootstrapApplication(App, {
    providers: appConfig.providers
  });
}