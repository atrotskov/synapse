import '@angular/compiler';

import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

(async () => {
  const root = document.querySelector<HTMLElement>('app-root');
  if (!root) return;
  const app = await createApplication({ providers: appConfig.providers });
  app.bootstrap(App, root as HTMLElement);
})();