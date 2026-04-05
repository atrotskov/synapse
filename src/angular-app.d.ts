declare module 'angular-app' {
  export function bootstrapAngular(element: HTMLElement): Promise<{ destroy: () => void }>;
}