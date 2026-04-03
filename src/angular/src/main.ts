import '@angular/compiler';

import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

export { App, appConfig };

export async function createSynapseApp(container: HTMLElement) {
  const app = await createApplication({
    providers: appConfig.providers
  });
  
  const root = document.createElement('app-root');
  container.appendChild(root);
  
  app.bootstrap(App, root);
  return app;
}

// Auto-bootstrap when loaded as a script tag
(async () => {
  const container = document.querySelector('.modal-content') || document.body;
  let root = document.querySelector('app-root');
  if (!root) {
    root = document.createElement('app-root');
    container.appendChild(root);
  }
  const app = await createApplication({
    providers: appConfig.providers
  });
  app.bootstrap(App, root as HTMLElement);
})();