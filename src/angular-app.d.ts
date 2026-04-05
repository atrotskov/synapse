declare module 'angular-app' {
    import type { App } from 'obsidian';
    import type { SynapseSettings } from './types';

    export function bootstrapAngular(obsidianApp: App, settings: SynapseSettings): Promise<{ destroy: () => void }>;
}
